import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useIntl } from 'react-intl';

import { Page } from '@onekeyhq/components';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { AccountSelectorProviderMirror } from '@onekeyhq/kit/src/components/AccountSelector';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { useAppRoute } from '@onekeyhq/kit/src/hooks/useAppRoute';
import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { defaultLogger } from '@onekeyhq/shared/src/logger/logger';
import type {
  EModalStakingRoutes,
  IModalStakingParamList,
} from '@onekeyhq/shared/src/routes';
import { formatMillisecondsToBlocks } from '@onekeyhq/shared/src/utils/dateUtils';
import earnUtils from '@onekeyhq/shared/src/utils/earnUtils';
import networkUtils from '@onekeyhq/shared/src/utils/networkUtils';
import { EAccountSelectorSceneName } from '@onekeyhq/shared/types';
import { EEarnProviderEnum } from '@onekeyhq/shared/types/earn';
import type { IFeeUTXO } from '@onekeyhq/shared/types/fee';
import { EEarnLabels } from '@onekeyhq/shared/types/staking';

import { UniversalStake } from '../../components/UniversalStake';
import { useProviderLabel } from '../../hooks/useProviderLabel';
import { useUniversalStake } from '../../hooks/useUniversalHooks';
import { buildLocalTxStatusSyncId } from '../../utils/utils';

function BasicStakePage() {
  const route = useAppRoute<
    IModalStakingParamList,
    EModalStakingRoutes.Stake
  >();
  const { accountId, networkId, details, onSuccess, indexedAccountId } =
    route.params;
  const { token, provider, rewardToken } = details;

  const { result: tokenResult } = usePromiseResult(
    () =>
      backgroundApiProxy.serviceStaking.getProtocolDetails({
        accountId,
        networkId,
        indexedAccountId,
        symbol: token.info.symbol,
        provider: provider.name,
      }),
    [accountId, networkId, indexedAccountId, token, provider],
    {
      revalidateOnFocus: true,
    },
  );

  const balanceParsed = tokenResult?.token.balanceParsed || token.balanceParsed;
  const price = tokenResult?.token.price || token.price;

  const tokenInfo = token.info;

  const actionTag = buildLocalTxStatusSyncId({
    providerName: provider.name,
    tokenSymbol: tokenInfo.symbol,
  });
  const [btcFeeRate, setBtcFeeRate] = useState<string | undefined>();
  const btcFeeRateInit = useRef<boolean>(false);

  const onFeeRateChange = useMemo(() => {
    if (
      provider.name.toLowerCase() === EEarnProviderEnum.Babylon.toLowerCase()
    ) {
      return (value: string) => setBtcFeeRate(value);
    }
  }, [provider.name]);

  const btcStakingTerm = useMemo<number | undefined>(() => {
    if (provider?.minStakeTerm) {
      return formatMillisecondsToBlocks(provider.minStakeTerm);
    }
    return undefined;
  }, [provider]);

  const handleStake = useUniversalStake({ accountId, networkId });
  const appNavigation = useAppNavigation();
  const onConfirm = useCallback(
    async (amount: string) => {
      const inviteCode =
        await backgroundApiProxy.serviceReferralCode.getInviteCode();
      await handleStake({
        inviteCode,
        amount,
        symbol: tokenInfo.symbol,
        provider: provider.name,
        stakingInfo: {
          label: EEarnLabels.Stake,
          protocol: earnUtils.getEarnProviderName({
            providerName: provider.name,
          }),
          protocolLogoURI: provider.logoURI,
          send: { token: tokenInfo, amount },
          tags: [actionTag],
        },
        term: btcStakingTerm,
        feeRate: Number(btcFeeRate) > 0 ? Number(btcFeeRate) : undefined,
        morphoVault: earnUtils.isMorphoProvider({
          providerName: provider.name,
        })
          ? provider.vault
          : undefined,
        onSuccess: async (txs) => {
          appNavigation.pop();
          defaultLogger.staking.page.staking({
            token: tokenInfo,
            stakingProtocol: provider.name,
          });
          const tx = txs[0];
          if (
            tx &&
            provider.name.toLowerCase() ===
              EEarnProviderEnum.Babylon.toLowerCase()
          ) {
            await backgroundApiProxy.serviceStaking.addBabylonTrackingItem({
              txId: tx.decodedTx.txid,
              action: 'stake',
              createAt: Date.now(),
              accountId,
              networkId,
              amount,
              minStakeTerm: provider.minStakeTerm,
            });
          }
          onSuccess?.();
        },
      });
    },
    [
      handleStake,
      appNavigation,
      tokenInfo,
      provider,
      actionTag,
      onSuccess,
      btcStakingTerm,
      accountId,
      networkId,
      btcFeeRate,
    ],
  );

  const intl = useIntl();
  const providerLabel = useProviderLabel(provider.name);

  const isReachBabylonCap = useMemo<boolean | undefined>(() => {
    if (provider && provider.name === EEarnProviderEnum.Babylon.toLowerCase()) {
      return provider.stakeDisable;
    }
    return false;
  }, [provider]);

  const showEstReceive = useMemo<boolean>(
    () =>
      earnUtils.isLidoProvider({
        providerName: provider.name,
      }) ||
      earnUtils.isMorphoProvider({
        providerName: provider.name,
      }),
    [provider],
  );

  const estReceiveTokenRate = useMemo(() => {
    if (
      earnUtils.isLidoProvider({
        providerName: provider.name,
      })
    ) {
      return provider.lidoStTokenRate;
    }
    if (
      earnUtils.isMorphoProvider({
        providerName: provider.name,
      })
    ) {
      return provider.morphoTokenRate;
    }
    return '1';
  }, [provider]);

  const { result: estimateFeeUTXO } = usePromiseResult(async () => {
    if (!networkUtils.isBTCNetwork(networkId)) {
      return;
    }
    const account = await backgroundApiProxy.serviceAccount.getAccount({
      accountId,
      networkId,
    });
    const accountAddress = account.address;
    const result = await backgroundApiProxy.serviceGas.estimateFee({
      accountId,
      networkId,
      accountAddress,
    });
    return result.feeUTXO?.filter(
      (o): o is Required<Pick<IFeeUTXO, 'feeRate'>> => o.feeRate !== undefined,
    );
  }, [accountId, networkId]);

  useEffect(() => {
    if (
      estimateFeeUTXO &&
      estimateFeeUTXO.length === 3 &&
      !btcFeeRateInit.current
    ) {
      const [, normalFee] = estimateFeeUTXO;
      setBtcFeeRate(normalFee.feeRate);
      btcFeeRateInit.current = true;
    }
  }, [estimateFeeUTXO]);

  return (
    <Page scrollEnabled>
      <Page.Header
        title={intl.formatMessage(
          { id: ETranslations.earn_earn_token },
          { 'token': tokenInfo.symbol },
        )}
      />
      <Page.Body>
        <UniversalStake
          accountId={accountId}
          networkId={networkId}
          decimals={details.token.info.decimals}
          details={details}
          apr={
            Number(provider.aprWithoutFee) > 0
              ? provider.aprWithoutFee
              : undefined
          }
          price={price}
          balance={balanceParsed}
          minAmount={provider.minStakeAmount}
          maxAmount={provider.maxStakeAmount}
          minStakeTerm={provider.minStakeTerm}
          minStakeBlocks={provider.minStakeBlocks}
          tokenImageUri={tokenInfo.logoURI}
          tokenSymbol={tokenInfo.symbol}
          providerLogo={provider.logoURI}
          providerName={provider.name}
          providerLabel={providerLabel}
          stakingTime={provider.stakingTime}
          nextLaunchLeft={provider.nextLaunchLeft}
          isReachBabylonCap={isReachBabylonCap}
          rewardToken={rewardToken}
          isDisabled={isReachBabylonCap}
          updateFrequency={tokenResult?.updateFrequency}
          showEstReceive={showEstReceive}
          estReceiveToken={rewardToken}
          estReceiveTokenRate={estReceiveTokenRate}
          onConfirm={onConfirm}
          minTransactionFee={provider.minTransactionFee}
          estimateFeeUTXO={estimateFeeUTXO}
          onFeeRateChange={onFeeRateChange}
        />
      </Page.Body>
    </Page>
  );
}

export default function StakePage() {
  return (
    <AccountSelectorProviderMirror
      config={{
        sceneName: EAccountSelectorSceneName.home,
        sceneUrl: '',
      }}
      enabledNum={[0]}
    >
      <BasicStakePage />
    </AccountSelectorProviderMirror>
  );
}

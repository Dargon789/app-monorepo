import { useCallback, useMemo } from 'react';

import { useIntl } from 'react-intl';

import { Page } from '@onekeyhq/components';
import backgroundApiProxy from '@onekeyhq/kit/src/background/instance/backgroundApiProxy';
import { AccountSelectorProviderMirror } from '@onekeyhq/kit/src/components/AccountSelector';
import useAppNavigation from '@onekeyhq/kit/src/hooks/useAppNavigation';
import { useAppRoute } from '@onekeyhq/kit/src/hooks/useAppRoute';
import { useEarnActions } from '@onekeyhq/kit/src/states/jotai/contexts/earn/actions';
import { EarnProviderMirror } from '@onekeyhq/kit/src/views/Earn/EarnProviderMirror';
import { EJotaiContextStoreNames } from '@onekeyhq/kit-bg/src/states/jotai/atoms';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { defaultLogger } from '@onekeyhq/shared/src/logger/logger';
import type {
  EModalStakingRoutes,
  IModalStakingParamList,
} from '@onekeyhq/shared/src/routes';
import earnUtils from '@onekeyhq/shared/src/utils/earnUtils';
import { EAccountSelectorSceneName } from '@onekeyhq/shared/types';
import type { IApproveConfirmFnParams } from '@onekeyhq/shared/types/staking';
import { EApproveType, EEarnLabels } from '@onekeyhq/shared/types/staking';

import { ApproveBaseStake } from '../../components/ApproveBaseStake';
import { useProviderLabel } from '../../hooks/useProviderLabel';
import { useUniversalStake } from '../../hooks/useUniversalHooks';
import { buildLocalTxStatusSyncId } from '../../utils/utils';

const BasicApproveBaseStakePage = () => {
  const route = useAppRoute<
    IModalStakingParamList,
    EModalStakingRoutes.ApproveBaseStake
  >();

  const { networkId, accountId, details, currentAllowance } = route.params;
  const { token, provider } = details;
  const { balanceParsed, price } = token;
  const appNavigation = useAppNavigation();
  // const actionTag = buildLocalTxStatusSyncId(details);
  const { removePermitCache } = useEarnActions().current;

  const handleStake = useUniversalStake({ accountId, networkId });
  const onConfirm = useCallback(async (params: IApproveConfirmFnParams) => {
    // const inviteCode =
    //   await backgroundApiProxy.serviceReferralCode.getInviteCode();
    // await handleStake({
    //   amount: params.amount,
    //   inviteCode,
    //   stakingInfo: {
    //     label: EEarnLabels.Stake,
    //     protocol: earnUtils.getEarnProviderName({
    //       providerName: provider.name,
    //     }),
    //     protocolLogoURI: provider.logoURI,
    //     send: { token: token.info, amount: params.amount },
    //     tags: [actionTag],
    //   },
    //   symbol: token.info.symbol,
    //   provider: provider.name,
    //   morphoVault: earnUtils.isMorphoProvider({
    //     providerName: provider.name,
    //   })
    //     ? provider.vault
    //     : undefined,
    //   approveType: params.approveType,
    //   permitSignature: params.permitSignature,
    //   onSuccess: () => {
    //     if (
    //       params.approveType === EApproveType.Permit &&
    //       params.permitSignature
    //     ) {
    //       removePermitCache({
    //         accountId,
    //         networkId,
    //         tokenAddress: token.info.address,
    //         amount: params.amount,
    //       });
    //     }
    //     appNavigation.pop();
    //     defaultLogger.staking.page.staking({
    //       token: token.info,
    //       stakingProtocol: provider.name,
    //     });
    //   },
    // });
  }, []);
  const intl = useIntl();

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

  const providerLabel = useProviderLabel(provider.name);

  return (
    <Page scrollEnabled>
      <Page.Header
        title={intl.formatMessage(
          { id: ETranslations.earn_earn_token },
          { 'token': token.info.symbol },
        )}
      />
      <Page.Body>
        <ApproveBaseStake
          details={details}
          price={price}
          balance={balanceParsed}
          token={token.info}
          minAmount={provider.minStakeAmount}
          decimals={token.info.decimals}
          onConfirm={onConfirm}
          apr={
            Number(provider.aprWithoutFee) > 0
              ? provider.aprWithoutFee
              : undefined
          }
          currentAllowance={currentAllowance}
          providerLogo={details.provider.logoURI}
          providerName={details.provider.name}
          providerLabel={providerLabel}
          showEstReceive={showEstReceive}
          estReceiveToken={details.rewardToken}
          estReceiveTokenRate={estReceiveTokenRate}
          approveTarget={{
            accountId,
            networkId,
            spenderAddress: details.approveTarget ?? '',
            token: token.info,
          }}
        />
      </Page.Body>
    </Page>
  );
};

export default function ApproveBaseStakePage() {
  return (
    <AccountSelectorProviderMirror
      config={{
        sceneName: EAccountSelectorSceneName.home,
        sceneUrl: '',
      }}
      enabledNum={[0]}
    >
      <EarnProviderMirror storeName={EJotaiContextStoreNames.earn}>
        <BasicApproveBaseStakePage />
      </EarnProviderMirror>
    </AccountSelectorProviderMirror>
  );
}

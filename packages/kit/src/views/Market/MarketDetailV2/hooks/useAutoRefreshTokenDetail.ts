import { usePromiseResult } from '@onekeyhq/kit/src/hooks/usePromiseResult';
import { useTokenDetailActions } from '@onekeyhq/kit/src/states/jotai/contexts/marketV2';

interface IUseMarketDetailDataProps {
  tokenAddress: string;
  networkId: string;
  isNative: boolean;
}

export function useAutoRefreshTokenDetail(data: IUseMarketDetailDataProps) {
  const { current: tokenDetailActions } = useTokenDetailActions();

  return usePromiseResult(
    async () => {
      // Always fetch token detail data to get complete token information
      // The K-line price priority logic is handled inside fetchTokenDetail
      await tokenDetailActions.fetchTokenDetail(
        data.tokenAddress,
        data.networkId,
      );

      // Set the tokenAddress, networkId, and isNative in jotai state
      tokenDetailActions.setTokenAddress(data.tokenAddress);
      tokenDetailActions.setNetworkId(data.networkId);
      tokenDetailActions.setIsNative(data.isNative);
    },
    [data.tokenAddress, data.networkId, data.isNative, tokenDetailActions],
    {
      pollingInterval: 6000, // Changed from 5000 to 6000 to avoid race condition with K-line updates
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );
}

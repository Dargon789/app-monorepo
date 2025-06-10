import {
  PrivyElements,
  PrivyProvider as PrivyProviderBase,
} from '@privy-io/expo';

import {
  PRIVY_APP_ID,
  PRIVY_MOBILE_CLIENT_ID,
} from '@onekeyhq/shared/src/consts/primeConsts';
import { OneKeyPlainTextError } from '@onekeyhq/shared/src/errors';

import { PrimeGlobalEffect } from '../hooks/PrimeGlobalEffect';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const appId = PRIVY_APP_ID;
  const clientId = PRIVY_MOBILE_CLIENT_ID;
  if (!appId) {
    throw new OneKeyPlainTextError('PRIVY_APP_ID is not set');
  }
  if (!clientId) {
    throw new OneKeyPlainTextError('PRIVY_MOBILE_CLIENT_ID is not set');
  }

  return (
    <PrivyProviderBase appId={appId} clientId={clientId}>
      <PrivyElements />
      <PrimeGlobalEffect />
      {children}
    </PrivyProviderBase>
  );
}

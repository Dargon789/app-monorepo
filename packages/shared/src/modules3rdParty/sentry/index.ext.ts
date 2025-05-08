/* eslint-disable spellcheck/spell-checker */
import type { ComponentType } from 'react';

import * as Sentry from '@sentry/react';

import appGlobals from '../../appGlobals';

import {
  buildBasicOptions,
  buildIntegrations,
  buildSentryOptions,
} from './basicOptions';

import type { FallbackRender } from '@sentry/react';

export const initSentry = () => {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  Sentry.init({
    dsn: 'https://7850b8d23c313bf0df1bcaead128af6f@o4508208799809536.ingest.de.sentry.io/4508325155831888',
    ...buildBasicOptions({
      onError: (errorMessage, stacktrace) => {
        appGlobals.$defaultLogger?.app.error.log(errorMessage, stacktrace);
      },
    }),
    ...buildSentryOptions(Sentry),
    integrations: buildIntegrations(Sentry),
  });
};

export * from '@sentry/react';

export * from './basicOptions';

export const nativeCrash = () => {};

export const withSentryHOC = (
  Component: ComponentType<any>,
  errorBoundaryFallback?: FallbackRender,
): ComponentType<any> =>
  Sentry.withErrorBoundary(Sentry.withProfiler(Component), {
    onError: (error, info) => {
      console.error('error', error, info);
    },
    fallback: errorBoundaryFallback,
  });

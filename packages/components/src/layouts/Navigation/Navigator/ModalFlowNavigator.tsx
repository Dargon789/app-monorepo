import { memo, useCallback, useEffect, useMemo } from 'react';

import { useIntl } from 'react-intl';

import type { ETranslations } from '@onekeyhq/shared/src/locale';

import { EPageType } from '../../../hocs';
import { PageTypeContext } from '../../../hocs/PageType/context';
import { useThemeValue } from '../../../hooks';
import { makeModalStackNavigatorOptions } from '../GlobalScreenOptions';
import createWebModalNavigator from '../Modal/createWebModalNavigator';
import { createStackNavigator } from '../StackNavigator';

import { hasStackNavigatorModal } from './CommonConfig';

import type { ICommonNavigatorConfig, IScreenOptionsInfo } from './types';
import type { IModalNavigationOptions } from '../ScreenProps';
import type { ParamListBase } from '@react-navigation/routers';

export interface IModalFlowNavigatorConfig<
  RouteName extends string,
  P extends ParamListBase,
> extends ICommonNavigatorConfig<RouteName, P> {
  translationId?: ETranslations | string;
  shouldPopOnClickBackdrop?: boolean;
  dismissOnOverlayPress?: boolean;
}

interface IModalFlowNavigatorProps<
  RouteName extends string,
  P extends ParamListBase,
> {
  config: IModalFlowNavigatorConfig<RouteName, P>[];
  name?: string;
  onMounted?: () => void;
  onUnmounted?: () => void;
}

const ModalStack = hasStackNavigatorModal
  ? createStackNavigator()
  : createWebModalNavigator();

/**
 * Renders a modal stack navigator with configurable screens and lifecycle hooks.
 *
 * Displays a sequence of modal screens defined by the provided configuration, applying theme and internationalization settings. Optionally invokes lifecycle callbacks when the navigator mounts and unmounts. The navigator adapts its page type context based on the current page type.
 *
 * @param config - Array of modal screen configurations to render in the navigator
 * @param onMounted - Optional callback invoked when the navigator is mounted
 * @param onUnmounted - Optional callback invoked when the navigator is unmounted
 */
function ModalFlowNavigator<RouteName extends string, P extends ParamListBase>({
  config,
  onMounted,
  onUnmounted,
  pageType: pageTypeFromProps,
}: IModalFlowNavigatorProps<RouteName, P> & {
  pageType?: EPageType;
}) {
  const [bgColor, titleColor] = useThemeValue(['bgApp', 'text']);
  const intl = useIntl();

  const makeScreenOptions = useCallback(
    (optionsInfo: IScreenOptionsInfo<any>) => ({
      ...makeModalStackNavigatorOptions({
        optionsInfo,
        bgColor,
        titleColor,
      }),
    }),
    [bgColor, titleColor],
  );

  useEffect(() => {
    onMounted?.();
    return () => {
      onUnmounted?.();
    };
  }, [onMounted, onUnmounted]);

  const contextValue = useMemo(
    () => ({
      pageType: pageTypeFromProps || EPageType.modal,
    }),
    [pageTypeFromProps],
  );
  return (
    <PageTypeContext.Provider value={contextValue}>
      <ModalStack.Navigator screenOptions={makeScreenOptions}>
        {config.map(
          ({
            name,
            component,
            options,
            translationId,
            shouldPopOnClickBackdrop,
            dismissOnOverlayPress,
          }) => {
            const customOptions: IModalNavigationOptions = {
              ...options,
              shouldPopOnClickBackdrop,
              dismissOnOverlayPress,
              title: translationId
                ? intl.formatMessage({
                    id: translationId as ETranslations,
                  })
                : '',
            };
            const key = `Modal-Flow-${name as string}`;
            return (
              <ModalStack.Screen
                key={key}
                name={name}
                component={component}
                options={customOptions}
              />
            );
          },
        )}
      </ModalStack.Navigator>
    </PageTypeContext.Provider>
  );
}

export default memo(ModalFlowNavigator);

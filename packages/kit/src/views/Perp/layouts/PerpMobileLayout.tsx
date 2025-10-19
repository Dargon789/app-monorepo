import { memo, useCallback, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';
import { RefreshControl, ScrollView } from 'react-native';

import type { IModalNavigationProp } from '@onekeyhq/components';
import {
  DebugRenderTracker,
  IconButton,
  SizableText,
  XStack,
  YStack,
} from '@onekeyhq/components';
import { ETranslations } from '@onekeyhq/shared/src/locale';
import { EModalRoutes } from '@onekeyhq/shared/src/routes';
import type { IModalPerpParamList } from '@onekeyhq/shared/src/routes/perp';
import { EModalPerpRoutes } from '@onekeyhq/shared/src/routes/perp';

import useAppNavigation from '../../../hooks/useAppNavigation';
import { useHyperliquidActions } from '../../../states/jotai/contexts/hyperliquid';
import {
  usePerpsActiveOpenOrdersLengthAtom,
  usePerpsActivePositionLengthAtom,
} from '../../../states/jotai/contexts/hyperliquid/atoms';
import { PerpOpenOrdersList } from '../components/OrderInfoPanel/List/PerpOpenOrdersList';
import { PerpPositionsList } from '../components/OrderInfoPanel/List/PerpPositionsList';
import { PerpOrderBook } from '../components/PerpOrderBook';
import { PerpTips } from '../components/PerpTips';
import { PerpTickerBar } from '../components/TickerBar/PerpTickerBar';
import { PerpTradingPanel } from '../components/TradingPanel/PerpTradingPanel';

enum ETabName {
  Positions = 'Positions',
  OpenOrders = 'OpenOrders',
}

const tabNameToTranslationKey: Record<
  ETabName,
  ETranslations.perp_position_title | ETranslations.perp_open_orders_title
> = {
  [ETabName.Positions]: ETranslations.perp_position_title,
  [ETabName.OpenOrders]: ETranslations.perp_open_orders_title,
};

const TabBarItem = memo(
  ({
    name,
    isFocused,
    onPress,
  }: {
    name: ETabName;
    isFocused: boolean;
    onPress: (name: ETabName) => void;
  }) => {
    const intl = useIntl();
    const [openOrdersLength] = usePerpsActiveOpenOrdersLengthAtom();
    const [positionsLength] = usePerpsActivePositionLengthAtom();

    const tabCount = useMemo(() => {
      if (name === ETabName.Positions && positionsLength > 0) {
        return `(${positionsLength})`;
      }
      if (name === ETabName.OpenOrders && openOrdersLength > 0) {
        return `(${openOrdersLength})`;
      }
      return '';
    }, [name, positionsLength, openOrdersLength]);

    return (
      <DebugRenderTracker
        position="bottom-center"
        name={`PerpMobileLayout_TabBarItem_${name}`}
      >
        <XStack
          py="$2"
          borderBottomWidth={isFocused ? '$0.5' : '$0'}
          borderBottomColor="$borderActive"
          onPress={() => onPress(name)}
          mb={-2}
        >
          <SizableText size="$headingXs">
            {`${intl.formatMessage({
              id: tabNameToTranslationKey[name],
            })} ${tabCount}`}
          </SizableText>
        </XStack>
      </DebugRenderTracker>
    );
  },
);

TabBarItem.displayName = 'TabBarItem';

export function PerpMobileLayout() {
  const [activeTab, setActiveTab] = useState<ETabName>(ETabName.Positions);
  const [refreshing, setRefreshing] = useState(false);

  const navigation =
    useAppNavigation<IModalNavigationProp<IModalPerpParamList>>();
  const actions = useHyperliquidActions();

  const handleViewTpslOrders = useCallback(() => {
    setActiveTab(ETabName.OpenOrders);
  }, []);

  const handleViewTradesHistory = useCallback(() => {
    navigation.pushModal(EModalRoutes.PerpModal, {
      screen: EModalPerpRoutes.PerpTradersHistoryList,
    });
  }, [navigation]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await actions.current.refreshAllPerpsData();
    } finally {
      setRefreshing(false);
    }
  }, [actions]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '$bgApp' }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      stickyHeaderIndices={[1, 3]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <PerpTips />
      <PerpTickerBar />
      <XStack gap="$2.5" px="$4" pb="$4">
        <YStack flexBasis="35%" flexShrink={1}>
          <PerpOrderBook />
        </YStack>
        <YStack flexBasis="65%" flexShrink={1}>
          <PerpTradingPanel isMobile />
        </YStack>
      </XStack>
      <XStack
        bg="$bgApp"
        borderBottomWidth="$0.5"
        borderBottomColor="$borderSubdued"
        justifyContent="space-between"
        alignItems="center"
        pr="$4"
        pl="$4"
      >
        <XStack gap="$5">
          <TabBarItem
            name={ETabName.Positions}
            isFocused={activeTab === ETabName.Positions}
            onPress={setActiveTab}
          />
          <TabBarItem
            name={ETabName.OpenOrders}
            isFocused={activeTab === ETabName.OpenOrders}
            onPress={setActiveTab}
          />
        </XStack>
        <IconButton
          variant="tertiary"
          size="small"
          borderRadius="$full"
          icon="ClockTimeHistoryOutline"
          onPress={handleViewTradesHistory}
        />
      </XStack>
      <YStack flex={1}>
        <YStack
          display={activeTab === ETabName.Positions ? 'flex' : 'none'}
          flex={1}
        >
          <PerpPositionsList
            handleViewTpslOrders={handleViewTpslOrders}
            isMobile
            useTabsList={false}
            disableListScroll
          />
        </YStack>
        <YStack
          display={activeTab === ETabName.OpenOrders ? 'flex' : 'none'}
          flex={1}
        >
          <PerpOpenOrdersList isMobile useTabsList={false} disableListScroll />
        </YStack>
      </YStack>
    </ScrollView>
  );
}

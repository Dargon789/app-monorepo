import { memo, useCallback } from 'react';
import type { ReactNode } from 'react';

import {
  Icon,
  Input,
  SizableText,
  XStack,
  YStack,
  getFontSize,
} from '@onekeyhq/components';

interface IInputAction {
  labelColor: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
}

interface IInputHelper {
  text: string;
  align?: 'left' | 'right';
}

interface ITradingFormInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  onFocus?: () => void;
  error?: string;
  suffix?: string;
  customSuffix?: ReactNode;
  actions?: IInputAction[];
  helper?: IInputHelper;
  validator?: (value: string) => boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  readonly?: boolean;
  ifOnDialog?: boolean;
  isMobile?: boolean;
}

export const TradingFormInput = memo(
  ({
    value,
    onChange,
    label,
    placeholder,
    disabled = false,
    onFocus,
    error,
    suffix,
    customSuffix,
    actions,
    helper,
    validator,
    keyboardType = 'decimal-pad',
    ifOnDialog = false,
    isMobile = false,
  }: ITradingFormInputProps) => {
    const handleInputChange = useCallback(
      (text: string) => {
        if (validator && !validator(text)) return;
        onChange(text);
      },
      [validator, onChange],
    );

    const renderAddOns = () => {
      const addOns = [];

      if (customSuffix) {
        addOns.push({
          renderContent: <XStack alignItems="center">{customSuffix}</XStack>,
        });
      } else if (suffix) {
        addOns.push({
          renderContent: (
            <XStack alignItems="center">
              <SizableText size="$bodyMdMedium" color="$textSubdued">
                {suffix}
              </SizableText>
            </XStack>
          ),
        });
      }

      if (actions && actions.length > 0) {
        actions.forEach((action) => {
          addOns.push({
            renderContent: (
              <XStack
                alignItems="center"
                cursor="pointer"
                onPress={action.onPress}
                opacity={action.disabled ? 0.5 : 1}
                gap="$1"
              >
                <SizableText size="$bodyMdMedium" color={action.labelColor}>
                  {action.label}
                </SizableText>
                {action.icon ? (
                  <Icon name={action.icon as any} size="$3" />
                ) : null}
              </XStack>
            ),
          });
        });
      }

      return addOns.length > 0 ? addOns : undefined;
    };
    if (isMobile) {
      return (
        <YStack
          gap="$3"
          bg={ifOnDialog ? '$bgApp' : '$bgSubdued'}
          borderRadius="$2"
          borderWidth={ifOnDialog ? '$px' : 0}
          borderColor={ifOnDialog ? '$borderSubdued' : undefined}
          px="$3"
        >
          <Input
            flex={1}
            h={32}
            size="medium"
            value={value}
            onChangeText={handleInputChange}
            onFocus={onFocus}
            placeholder={placeholder}
            keyboardType={keyboardType}
            disabled={disabled}
            fontSize={getFontSize('$bodyMd')}
            bg="$bgSubdued"
            containerProps={{
              flex: 1,
              borderWidth: 0,
              bg: 'transparent',
              p: 0,
            }}
            InputComponentStyle={{
              p: 0,
              bg: 'transparent',
            }}
            addOns={disabled ? undefined : renderAddOns()}
          />
          {error ? (
            <SizableText size="$bodySm" color="$red10" mt="$1">
              {error}
            </SizableText>
          ) : null}
          {helper ? (
            <XStack
              alignItems="center"
              alignSelf={helper.align === 'left' ? 'flex-start' : 'flex-end'}
              mt="$1"
              gap="$1"
            >
              <SizableText size="$bodySm" color="$textSubdued">
                {helper.text}
              </SizableText>
            </XStack>
          ) : null}
        </YStack>
      );
    }
    return (
      <YStack
        bg="$bgSubdued"
        borderRadius="$3"
        py="$1"
        pl="$1"
        pr="$2.5"
        hoverStyle={
          ifOnDialog
            ? undefined
            : {
                outlineWidth: '$px',
                outlineColor: '$border',
                outlineStyle: 'solid',
              }
        }
        borderWidth={ifOnDialog ? '$px' : '$0'}
        borderColor={ifOnDialog ? '$border' : '$transparent'}
      >
        <YStack>
          <Input
            h={40}
            placeholder={placeholder}
            textAlign="right"
            leftAddOnProps={{
              renderContent: (
                <XStack alignItems="center" justifyContent="center">
                  <SizableText size="$bodyMd" color="$textSubdued" mr="$2">
                    {label}
                  </SizableText>
                </XStack>
              ),
            }}
            value={value}
            onChangeText={handleInputChange}
            onFocus={onFocus}
            disabled={disabled}
            keyboardType={keyboardType}
            size="small"
            containerProps={{
              bg: '$bgSubdued',
              borderRadius: '$2',
              borderWidth: '$0',
            }}
            addOns={renderAddOns()}
          />

          {error ? (
            <SizableText size="$bodySm" color="$red10" mt="$1">
              {error}
            </SizableText>
          ) : null}
          {helper ? (
            <XStack
              alignItems="center"
              alignSelf={helper.align === 'left' ? 'flex-start' : 'flex-end'}
              mt="$1"
              gap="$1"
            >
              <SizableText size="$bodySm" color="$textSubdued">
                {helper.text}
              </SizableText>
            </XStack>
          ) : null}
        </YStack>
      </YStack>
    );
  },
);

TradingFormInput.displayName = 'TradingFormInput';

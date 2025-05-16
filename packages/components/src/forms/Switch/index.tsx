import { useState } from 'react';

import { Switch as TMSwitch, useTheme } from 'tamagui';

import platformEnv from '@onekeyhq/shared/src/platformEnv';

import type { IFormFieldProps } from '../types';
import type { GetProps } from 'tamagui';

export enum ESwitchSize {
  'small' = 'small',
  'large' = 'large',
}

export type ISwitchProps = IFormFieldProps<
  boolean,
  Omit<GetProps<typeof TMSwitch>, 'checked' | 'onCheckedChange' | 'value'> & {
    size?: 'small' | 'large';
    thumbProps?: Partial<GetProps<typeof TMSwitch.Thumb>>;
  }
> & {
  isUncontrolled?: boolean;
};

export function Switch({
  value,
  defaultChecked,
  onChange,
  size = 'large',
  disabled,
  isUncontrolled,
  thumbProps,
  ...restProps
}: ISwitchProps) {
  const theme = useTheme();
  const [stateChecked, setStateChecked] = useState(defaultChecked);

  const checked = isUncontrolled ? stateChecked : value;

  return (
    <TMSwitch
      tag="span"
      flexShrink={0}
      unstyled
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(v) => {
        if (isUncontrolled) {
          setStateChecked(v);
        }
        onChange?.(v);
      }}
      native
      w={size === 'small' ? 38 : 54}
      h={size === 'small' ? '$6' : '$8'}
      minHeight={size === 'small' ? '$6' : '$8'}
      bg={checked ? '$bgPrimary' : '$neutral5'}
      p="$0"
      borderRadius="$full"
      borderWidth="$0.5"
      borderColor="$transparent"
      opacity={disabled ? 0.5 : 1}
      disabled={disabled}
      nativeProps={{
        disabled,
        ios_backgroundColor: theme.neutral5.val,
        trackColor: {
          false: theme.neutral5.val,
          true: theme.bgPrimary.val,
        },
        thumbColor: theme.bg.val,
      }}
      {...restProps}
    >
      <TMSwitch.Thumb
        unstyled
        w={size === 'small' ? '$5' : '$7'}
        h={size === 'small' ? '$5' : '$7'}
        borderRadius="$full"
        bg="$bg"
        // Native platforms use quicker animations due to different user experience expectations.
        // Please don't set the animation too fast.
        // ref: https://github.com/tamagui/tamagui/commit/0586079faec69d044a5b1d45f84ae9f2e4e6e463
        animation={platformEnv.isNative ? 'quick' : 'easeInOut'}
        {...thumbProps}
      />
    </TMSwitch>
  );
}

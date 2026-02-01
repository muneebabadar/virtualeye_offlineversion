import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAccessibleColors } from '@/hooks/useAccessibleColors';
import { SemanticColors } from '@/constants/color';
import React, { ReactNode } from 'react';

import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
  AccessibilityRole,
  AccessibilityState
} from 'react-native';

interface AccessibleButtonProps {
  children?: ReactNode;
  title?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: 'primary' | 'secondary' | 'danger';
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  title,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  accessibilityRole = 'button',
  accessibilityState,
}) => {
  const { hapticFeedback } = useAccessibility();
  const colors = useAccessibleColors();

  const handlePress = () => {
    if (disabled) return;
    hapticFeedback?.('medium');
    onPress();
  };

  /** * FIX FOR 2304 & 7053: Defined inside the component to access 'colors'.
   * Used type casting (as keyof typeof colors) to satisfy index signature.
   */
  const getVariantStyles = (v: string): ViewStyle => {
    switch (v) {
      case 'primary':
        return { backgroundColor: colors[SemanticColors.buttonPrimaryBg as keyof typeof colors] };
      case 'secondary':
        return { backgroundColor: colors[SemanticColors.buttonSecondaryBg as keyof typeof colors] };
      case 'danger':
        return { backgroundColor: colors[SemanticColors.buttonDangerBg as keyof typeof colors] };
      default:
        return { backgroundColor: colors[SemanticColors.buttonPrimaryBg as keyof typeof colors] };
    }
  };

  const getVariantTextStyles = (v: string): TextStyle => {
    switch (v) {
      case 'primary':
        return { color: colors[SemanticColors.buttonPrimaryText as keyof typeof colors] };
      case 'secondary':
        return { color: colors[SemanticColors.buttonSecondaryText as keyof typeof colors] };
      case 'danger':
        return { color: colors[SemanticColors.buttonDangerText as keyof typeof colors] };
      default:
        return { color: colors[SemanticColors.buttonPrimaryText as keyof typeof colors] };
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, ...accessibilityState }}
      style={({ pressed }) => [
        styles.button,
        getVariantStyles(variant),
        pressed && styles.pressed,
        disabled && { backgroundColor: colors[SemanticColors.disabledBg as keyof typeof colors] },
        style,
      ]}
    >
      {children ? (
        children
      ) : (
        <Text
          style={[
            styles.buttonText,
            getVariantTextStyles(variant),
            disabled && { color: colors[SemanticColors.disabledText as keyof typeof colors] },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Standard Android touch target
    minWidth: 48,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

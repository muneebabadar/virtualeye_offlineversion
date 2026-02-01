import { Tabs } from 'expo-router';
import React from 'react';
import { I18nManager, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccessibleColors } from '@/hooks/useAccessibleColors';

export default function TabLayout() {
  const colors = useAccessibleColors();
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        // FIX: Use your WCAG compliant primary blue
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarButton: HapticTab,
        // FIX: Android-optimized tab bar height
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: Platform.OS === 'android' ? 70 : 88,
          paddingBottom: Platform.OS === 'android' ? 12 : 30,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: t('common.modes'),
          // FIX: Semantic label for screen readers
          tabBarAccessibilityLabel: t('common.modes'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: t('welcome.featuresTitle'),
          // FIX: Clearer hint for Help/Explore
          tabBarAccessibilityLabel: t('welcome.featuresTitle'),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
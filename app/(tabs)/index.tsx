import React, { useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useAccessibleColors } from '@/hooks/useAccessibleColors';
import { AccessibleText } from '@/components/AccessibleText';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { speak, hapticFeedback } = useAccessibility();
  const colors = useAccessibleColors();

  useEffect(() => {
    // 1. Announce the app is starting
    speak?.(t("welcome.appName") + " " + t("common.loading"), true);
    hapticFeedback?.("light");

    // 2. Logic to decide where to go
    // For now, we simulate a check. In production, check AsyncStorage.
    const hasCompletedSetup = false; 

    const timer = setTimeout(() => {
      if (hasCompletedSetup) {
        router.replace('/features');
      } else {
        router.replace('/welcome');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.centerContent}>
        {/* Large Visual/Accessible Logo Placeholder */}
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
          <AccessibleText style={{ color: colors.textInverse, fontSize: 40, fontWeight: 'bold' }}>
            V
          </AccessibleText>
        </View>

        <AccessibleText style={[styles.title, { color: colors.text }]} level={1}>
          {t("welcome.appName")}
        </AccessibleText>

        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={{ marginTop: 30 }}
          accessible={true}
          accessibilityLabel={t("common.loading")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    alignItems: 'center',
    width: '100%',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4, // Android Shadow
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
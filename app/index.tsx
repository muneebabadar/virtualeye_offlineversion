import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View, PixelRatio, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next"; // Added for i18n

const LoadingScreen = () => {
  const router = useRouter();
  const { speak } = useAccessibility();
  const colors = useAccessibleColors();
  const { t } = useTranslation();

  useEffect(() => {
    // FIX: Using localized announcement
    speak?.(t("welcome.announcement"), true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome");
    }, 2500); // Slightly longer to allow TalkBack to finish announcement
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.centerContent}>
        {/* FIX: Combined logo into a single accessibility element */}
        <View
          style={[styles.logoOuterCircle, { backgroundColor: colors.primary }]}
          accessible={true}
          accessibilityLabel={t("welcome.logoLabel")}
          accessibilityRole="image"
          importantForAccessibility="yes"
        >
          <View style={[styles.logoInnerCircle, { backgroundColor: colors.background }]}>
            <Feather 
              name="camera" 
              size={60 * PixelRatio.getFontScale()} 
              color={colors.text} 
              importantForAccessibility="no-hide-descendants" 
            />
          </View>
        </View>

        <AccessibleText 
          style={[styles.title, { color: colors.text }]} 
          accessibilityRole="header" 
          level={1}
        >
          {t("welcome.appName")}
        </AccessibleText>

        <AccessibleText 
          style={[styles.subtitle, { color: colors.secondary }]} 
          accessibilityRole="text"
        >
          {t("welcome.tagline")}
        </AccessibleText>

        {/* FIX: Added ActivityIndicator for standard Android busy state feedback */}
        <ActivityIndicator 
          size="large" 
          color={colors.primary} 
          style={{ marginVertical: 20 }}
          accessible={true}
          accessibilityLabel={t("common.loading")}
        />

        <AccessibleText
          style={[styles.loadingText, { color: colors.secondary }]}
          accessibilityRole="text"
          // FIX: Live region ensures the user knows the state is active
          accessibilityLiveRegion="polite"
        >
          {t("common.loading")}
        </AccessibleText>
      </View>
    </View>
  );
};

export default LoadingScreen;

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerContent: { alignItems: "center", width: '100%' },
  logoOuterCircle: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 20 
  },
  logoInnerCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    marginTop: 20,
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 16, 
    marginTop: 8, 
    marginBottom: 30,
    textAlign: 'center'
  },
  loadingText: { 
    fontSize: 16,
    fontWeight: '600'
  },
});
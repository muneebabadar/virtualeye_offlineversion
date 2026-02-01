import { Link } from "expo-router";
import { StyleSheet, PixelRatio } from "react-native";
import { useTranslation } from "react-i18next"; // Added for localization

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function ModalScreen() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      {/* FIX: Localized Title */}
      <ThemedText 
        type="title" 
        accessibilityRole="header" 
        accessibilityLabel={t("modal.title")}
      >
        {t("modal.title")}
      </ThemedText>

      {/* FIX: Improved Touch Target and Localized Accessibility Attributes */}
      <Link
        href="/"
        dismissTo
        style={styles.link}
        accessibilityRole="link"
        accessibilityLabel={t("modal.backHomeLabel")}
        accessibilityHint={t("modal.backHomeHint")}
      >
        <ThemedText type="link">{t("modal.backHome")}</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    // FIX: Dynamic padding based on font scale
    padding: 20 * PixelRatio.getFontScale() 
  },
  link: { 
    marginTop: 15, 
    paddingVertical: 15,
    paddingHorizontal: 20,
    // FIX: Android Standard Touch Target
    minHeight: 48, 
    justifyContent: 'center'
  },
});
import React, { useEffect } from "react";
import { Pressable, StyleSheet, View, I18nManager } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { useAccessibility } from "@/contexts/AccessibilityContext";

type AccessibleHeadersProps = {
  title: string;
};

export function AccessibleHeaders({ title }: AccessibleHeadersProps) {
  const router = useRouter();
  const colors = useAccessibleColors();
  const { speak, hapticFeedback } = useAccessibility();

  // Announce screen title for screen readers
  useEffect(() => {
    speak?.(title, true);
  }, [title]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.primary,
          flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
        },
      ]}
      accessibilityRole="header"
    >
      {/* Back button */}
      <Pressable
        onPress={() => {
          hapticFeedback?.("light");
          speak?.("Back", true);
          router.back();
        }}
        hitSlop={20}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={styles.backButton}
      >
        <Feather
          name={I18nManager.isRTL ? "arrow-right" : "arrow-left"}
          size={28}
          color={colors.textInverse}
        />
      </Pressable>

      {/* Title */}
      <AccessibleText
        level={1}
        style={[
          styles.title,
          {
            color: colors.textInverse,
            textAlign: I18nManager.isRTL ? "right" : "left",
          },
        ]}
      >
        {title}
      </AccessibleText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 96,
    alignItems: "center",
    paddingTop: 36,
    paddingHorizontal: 20,
    gap: 12,
  },
  backButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    flex: 1,
  },
});

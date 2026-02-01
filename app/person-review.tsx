import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { I18nManager, Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

/** Choose readable text color (black/white) */
const onColor = (bg: string) => {
  const hex = (bg || "").replace("#", "");
  if (hex.length !== 6) return "#000000";
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  const toLin = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
  return L > 0.45 ? "#000000" : "#FFFFFF";
};

const PersonReviewScreen = () => {
  const router = useRouter();
  const { speak, hapticFeedback } = useAccessibility();
  const colors = useAccessibleColors();
  const { t } = useTranslation();

  const params = useLocalSearchParams<{ name?: string; count?: string }>();
  const personName = (params.name ?? t("personReview.defaultName")).toString();
  const photosCount = Number(params.count ?? "5");

  const onPrimary = useMemo(() => onColor(colors.primary), [colors.primary]);
  const onCard = useMemo(() => onColor(colors.card), [colors.card]);
  const onSuccess = useMemo(() => onColor(colors.success), [colors.success]);

  /** Screen announcement */
  useEffect(() => {
    speak?.(
      t("personReview.announcement", {
        name: personName,
        count: photosCount,
      }),
      true
    );
  }, [personName, photosCount]);

  const handleSave = () => {
    hapticFeedback?.("success");
    speak?.(
      t("personReview.saved", { name: personName }),
      true
    );
    router.replace("/person-registration" as any);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Pressable
          onPress={() => {
            hapticFeedback?.("light");
            speak?.(t("common.goBack"), true);
            router.back();
          }}
          style={styles.backButton}
          hitSlop={{ top: 24, bottom: 24, left: 24, right: 24 }}
          accessible
          accessibilityLabel={t("common.back")}
          accessibilityHint={t("personReview.backHint")}
        >
          <Feather name= {I18nManager.isRTL ? "arrow-right" : "arrow-left"} size={28} color={onPrimary} />
        </Pressable>

        <AccessibleText style={[styles.headerTitle, { color: onPrimary }]} level={1} 
        accessibilityRole="header">
          {t("personReview.title")}
        </AccessibleText>
      </View>

      <View style={styles.content}>
        {/* Accessible summary card */}
        <View
          style={[styles.nameCardOuter, { borderColor: colors.primary }]}
          accessible
          accessibilityRole="text"
          accessibilityLabel={t("personReview.summary", {
            name: personName,
            count: photosCount,
          })}
        >
          <View style={[styles.nameCardInner, { backgroundColor: colors.card }]} accessible={false}>
            <AccessibleText style={[styles.nameText, { color: onCard }]}>
              {personName}
            </AccessibleText>

            <AccessibleText style={[styles.countText, { color: onCard }]}>
              {t("personReview.photos", { count: photosCount })}
            </AccessibleText>
          </View>
        </View>

        <AccessibleText style={[styles.description, { color: colors.text }]}>
          {t("personReview.description")}
        </AccessibleText>

        <AccessibleButton
          onPress={handleSave}
          accessibilityLabel={t("personReview.saveLabel", { name: personName })}
          accessibilityHint={t("personReview.saveHint")}
          style={[styles.saveButton, { backgroundColor: colors.success, borderColor: colors.success }]}
        >
          <AccessibleText style={{ color: onSuccess, fontSize: 18, fontWeight: "700" }}>
            {t("personReview.save")}
          </AccessibleText>
        </AccessibleButton>
      </View>
    </View>
  );
};

export default PersonReviewScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    minHeight: 120,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop:40,
    gap: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: "700" ,flexShrink:1,textAlign:I18nManager.isRTL ? 'right' : 'left'},

  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  nameCardOuter: {
    borderRadius: 18,
    borderWidth: 3,
    padding: 4,
    marginBottom: 28,
    width: "100%",
    minHeight: 120,
  },
  nameCardInner: {
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  nameText: { fontSize: 24, fontWeight: "700", marginBottom: 6 ,lineHeight:I18nManager.isRTL ? 36 : 30,},
  countText: { fontSize: 16

   },

  description: { fontSize: 16, textAlign: "center", marginBottom: 30 },

  saveButton: {
    borderRadius: 18,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 56,
    paddingVertical: 16,
  },
});

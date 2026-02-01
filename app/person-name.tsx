import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  I18nManager,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";
import { AccessibleHeaders } from "@/components/AccessibleHeaders";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";

const PersonNameScreen = () => {
  const router = useRouter();
  const { speak, hapticFeedback } = useAccessibility();
  const colors = useAccessibleColors();
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [hasError, setHasError] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    speak?.(t("personName.announcement"), true);
  }, []);

  const handleContinue = () => {
    const trimmed = name.trim();

    if (!trimmed) {
      setHasError(true);
      speak?.(t("personName.emptyError"), true);
      hapticFeedback?.("error");
      inputRef.current?.focus();
      return;
    }

    setHasError(false);
    hapticFeedback?.("medium");
    speak?.(t("personName.saving", { name: trimmed }), true);

    router.replace({
      pathname: "/person-review",
      params: { name: trimmed },
    } as any);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Accessible reusable header */}
        <AccessibleHeaders title={t("personRegistration.title")} />

        <View style={styles.content}>
          <AccessibleText
            level={2}
            style={[styles.title, { color: colors.text }]}
          >
            {t("personName.title")}
          </AccessibleText>

          <AccessibleText
            style={[styles.subtitle, { color: colors.text }]}
          >
            {t("personName.instruction")}
          </AccessibleText>

          <View
            style={[
              styles.inputWrapper,
              {
                borderColor: hasError ? colors.danger : colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  color: colors.text,
                  textAlign: I18nManager.isRTL ? "right" : "left",
                },
              ]}
              placeholder={t("personName.placeholder")}
              placeholderTextColor={colors.textLight || "#666"}
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (hasError) setHasError(false);
              }}
              accessibilityLabel={t("personName.instruction")}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              importantForAccessibility="yes"
            />
          </View>

          <AccessibleButton
            title={t("personName.continue")}
            onPress={handleContinue}
            accessibilityLabel={t("personName.continue")}
            style={styles.button}
            variant="primary"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 12,
    marginBottom: 30,
  },
  input: {
    minHeight: 56,
    fontSize: 20,
  },
  button: {
    minHeight: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PersonNameScreen;

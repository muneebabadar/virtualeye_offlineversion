// import { AccessibleButton } from "@/components/AccessibleButton";
// import { AccessibleText } from "@/components/AccessibleText";
// import { useAccessibility } from "@/contexts/AccessibilityContext";
// import { useAccessibleColors } from "@/hooks/useAccessibleColors";
// import { useRouter } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
//   TextInput,
//   View,
// } from "react-native";
// import { useTranslation } from "react-i18next";

// /** Choose readable text color (black/white) based on background */
// const onColor = (bg: string) => {
//   const hex = (bg || "").replace("#", "");
//   if (hex.length !== 6) return "#000000";
//   const r = parseInt(hex.slice(0, 2), 16) / 255;
//   const g = parseInt(hex.slice(2, 4), 16) / 255;
//   const b = parseInt(hex.slice(4, 6), 16) / 255;
//   const toLin = (c: number) =>
//     c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
//   const L = 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
//   return L > 0.45 ? "#000000" : "#FFFFFF";
// };

// const SetupScreen = () => {
//   const [email, setEmail] = useState("");
//   const router = useRouter();
//   const {
//     speak,
//     hapticFeedback,
//     language,
//     setLanguage,
//     isHighContrastEnabled,
//     toggleHighContrast,
//   } = useAccessibility();
//   const colors = useAccessibleColors();
//   const { t, i18n } = useTranslation();

//   const onPrimary = useMemo(() => onColor(colors.primary), [colors.primary]);
//   const onCard = useMemo(() => onColor(colors.card), [colors.card]);
//   const onBackground = useMemo(
//     () => onColor(colors.background),
//     [colors.background]
//   );

//   /** Initial screen announcement */
//   useEffect(() => {
//     speak?.(
//       t("setup.announcement", {
//         defaultValue:
//           "Setup screen. Choose your language and enter your email.",
//       }),
//       true
//     );
//   }, [i18n.language]);

//   /** Announce language change */
//   useEffect(() => {
//     speak?.(
//       language === "ur"
//         ? "زبان اردو میں تبدیل ہو گئی"
//         : "Language changed to English",
//       true
//     );
//   }, [language]);

//   const handleLanguageSelect = (selectedLanguage: "en" | "ur") => {
//     hapticFeedback?.("success");
//     i18n.changeLanguage(selectedLanguage);
//     setLanguage(selectedLanguage);
//   };

//   const handleGetStarted = () => {
//     hapticFeedback?.("success");
//     speak?.(
//       t("setup.starting", {
//         defaultValue: "Starting V-EYE application",
//       }),
//       true
//     );
//     router.replace("/features");
//   };

//   return (
//     <KeyboardAvoidingView
//       style={[styles.root, { backgroundColor: colors.background }]}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 12 : 0}
//     >
//       <ScrollView
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="handled"
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Decorative header bar */}
//         <View
//           style={[styles.topBar, { backgroundColor: colors.primary }]}
//           accessible={false}
//         />

//         {/* Language card */}
//         <View
//           style={[
//             styles.card,
//             { backgroundColor: colors.card, borderColor: colors.border },
//           ]}
//         >
//           <AccessibleText
//             style={[styles.cardTitle, { color: onCard }]}
//             level={2}
//           >
//             {t("setup.languageSupport", {
//               defaultValue: "Language Support",
//             })}
//           </AccessibleText>

//           <View style={styles.row}>
//             <AccessibleButton
//               title={t("common.english", { defaultValue: "English" })}
//               onPress={() => handleLanguageSelect("en")}
//               accessibilityLabel="English"
//               accessibilityHint={t("setup.selectEnglish", {
//                 defaultValue: "Select English as the application language",
//               })}
//               style={[
//                 styles.languageButton,
//                 {
//                   backgroundColor:
//                     language === "en" ? colors.primary : colors.card,
//                   borderColor: colors.border,
//                 },
//               ]}
//               textStyle={{
//                 color: language === "en" ? onPrimary : onCard,
//               }}
//             />

//             <AccessibleButton
//               title={t("common.urdu", { defaultValue: "Urdu" })}
//               onPress={() => handleLanguageSelect("ur")}
//               accessibilityLabel="Urdu"
//               accessibilityHint={t("setup.selectUrdu", {
//                 defaultValue: "Select Urdu as the application language",
//               })}
//               style={[
//                 styles.languageButton,
//                 {
//                   backgroundColor:
//                     language === "ur" ? colors.primary : colors.card,
//                   borderColor: colors.border,
//                 },
//               ]}
//               textStyle={{
//                 color: language === "ur" ? onPrimary : onCard,
//               }}
//             />
//           </View>
//         </View>

//         {/* Accessibility card */}
//         <View
//           style={[
//             styles.card,
//             { backgroundColor: colors.card, borderColor: colors.border },
//           ]}
//         >
//           <AccessibleText
//             style={[styles.cardTitle, { color: onCard }]}
//             level={2}
//           >
//             {t("setup.accessibilityOptions", {
//               defaultValue: "Accessibility Options",
//             })}
//           </AccessibleText>

//           <View style={styles.accessibilityRow}>
//             <AccessibleText style={[styles.label, { color: onCard }]}>
//               {t("setup.highContrast", {
//                 defaultValue: "High Contrast Mode",
//               })}
//             </AccessibleText>

//             <AccessibleButton
//               title={
//                 isHighContrastEnabled
//                   ? t("common.enabled", { defaultValue: "Enabled" })
//                   : t("common.disabled", { defaultValue: "Disabled" })
//               }
//               onPress={() => {
//                 hapticFeedback?.("medium");
//                 toggleHighContrast();
//                 speak?.(
//                   isHighContrastEnabled
//                     ? "High contrast mode disabled"
//                     : "High contrast mode enabled",
//                   true
//                 );
//               }}
//               accessibilityLabel="High contrast mode"
//               accessibilityHint={t("setup.toggleContrast", {
//                 defaultValue:
//                   "Toggle high contrast color scheme for better visibility",
//               })}
//               style={[
//                 styles.toggleButton,
//                 {
//                   backgroundColor: isHighContrastEnabled
//                     ? colors.success
//                     : colors.secondary,
//                   borderColor: colors.border,
//                 },
//               ]}
//               textStyle={{
//                 color: onColor(
//                   isHighContrastEnabled
//                     ? colors.success
//                     : colors.secondary
//                 ),
//               }}
//             />
//           </View>
//         </View>

//         {/* Email section */}
//         <View style={styles.emailSection}>
//           <AccessibleText
//             style={[styles.sectionTitle, { color: onBackground }]}
//             level={2}
//           >
//             {t("setup.enterEmail", {
//               defaultValue: "Enter Your Email",
//             })}
//           </AccessibleText>

//           <AccessibleText
//             style={[styles.sectionSubtitle, { color: onBackground }]}
//           >
//             {t("setup.emailDesc", {
//               defaultValue:
//                 "We'll use this to save your person recognition data on your device.",
//             })}
//           </AccessibleText>

//           <AccessibleText
//             nativeID="emailLabel"
//             style={{ position: "absolute", left: -9999 }}
//           >
//             Email address
//           </AccessibleText>

//           <View
//             style={[
//               styles.inputWrapper,
//               { borderColor: colors.border, backgroundColor: colors.card },
//             ]}
//           >
//             <TextInput
//               style={[styles.input, { color: onCard }]}
//               placeholder={t("setup.emailPlaceholder", {
//                 defaultValue: "your.email@example.com",
//               })}
//               placeholderTextColor={
//                 onCard === "#000000" ? "#555555" : "#CCCCCC"
//               }
//               keyboardType="email-address"
//               value={email}
//               onChangeText={setEmail}
//               accessibilityLabelledBy="emailLabel"
//               accessibilityHint={t("setup.emailHint", {
//                 defaultValue: "Enter your email address for data storage",
//               })}
//               autoCapitalize="none"
//               autoCorrect={false}
//             />
//           </View>
//         </View>

//         <AccessibleButton
//           title={t("common.getStarted", { defaultValue: "Get Started" })}
//           onPress={handleGetStarted}
//           accessibilityLabel="Get started"
//           accessibilityHint={t("setup.startHint", {
//             defaultValue: "Navigate to the main features screen",
//           })}
//           style={[
//             styles.getStartedButton,
//             { backgroundColor: colors.primary, borderColor: colors.border },
//           ]}
//           textStyle={{ color: onPrimary }}
//         />
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// };

// export default SetupScreen;


// const styles = StyleSheet.create({
//   root: { flex: 1 },
//   scrollContent: { paddingHorizontal: 28, paddingTop: 70, paddingBottom: 40 },

//   topBar: {
//     height: 80,
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//     width: "100%",
//     marginBottom: 18,
//   },

//   card: {
//     width: "100%",
//     borderRadius: 18,
//     borderWidth: 2,
//     padding: 22,
//     marginBottom: 20,
//   },
//   cardTitle: { fontSize: 22, fontWeight: "700", marginBottom: 18 },

//   row: { flexDirection: "row", gap: 16 },
//   languageButton: {
//     flex: 1,
//     borderRadius: 14,
//     paddingVertical: 20,
//     alignItems: "center",
//     borderWidth: 2,
//     minHeight: 56,
//   },

//   accessibilityRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
//   label: { fontSize: 18, fontWeight: "600" },
//   toggleButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 2, minHeight: 48 },

//   emailSection: { width: "100%", marginTop: 6, marginBottom: 22 },
//   sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
//   sectionSubtitle: { fontSize: 16, marginBottom: 16 },

//   inputWrapper: { borderRadius: 16, borderWidth: 2, paddingHorizontal: 16 },
//   input: { height: 50, fontSize: 18 },

//   getStartedButton: {
//     width: "100%",
//     borderRadius: 18,
//     paddingVertical: 20,
//     alignItems: "center",
//     borderWidth: 2,
//     minHeight: 56,
//   },
// });

import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  I18nManager,
} from "react-native";
import { useTranslation } from "react-i18next";

/** Choose readable text color (black/white) based on background */
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

const SetupScreen = () => {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const { speak, hapticFeedback, isHighContrastEnabled, toggleHighContrast } =
    useAccessibility();
  const colors = useAccessibleColors();
  const { t, i18n } = useTranslation();

  const onPrimary = useMemo(() => onColor(colors.primary), [colors.primary]);
  const onCard = useMemo(() => onColor(colors.card), [colors.card]);
  const onBackground = useMemo(
    () => onColor(colors.background),
    [colors.background]
  );

  /** Initial screen announcement */
  useEffect(() => {
    speak?.(t("setup.announcement"), true);
  }, [i18n.language]);

const handleLanguageSelect = async (lang: "en" | "ur") => {
  if (i18n.language === lang) return;

  hapticFeedback?.("success");

  await i18n.changeLanguage(lang);

  setTimeout(() => {
    speak?.(
      lang === "ur"
        ? "زبان اردو میں تبدیل ہو گئی"
        : "Language changed to English",
      true
    );
  }, 300);
};


  const handleGetStarted = () => {
    hapticFeedback?.("success");
    speak?.(t("setup.startApp"), true);
    router.replace("/features");
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
        {/* Decorative header */}
        <View
          style={[styles.topBar, { backgroundColor: colors.primary }]}
          accessible={false}
        />

        {/* Language card */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <AccessibleText style={[styles.cardTitle, { color: onCard }]} level={2}>
            {t("setup.languageSupport")}
          </AccessibleText>

          <View
            style={[
              styles.row,
              { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
            ]}
          >
            <AccessibleButton
              title={t("common.english")}
              onPress={() => handleLanguageSelect("en")}
              style={[
                styles.languageButton,
                {
                  backgroundColor:
                    i18n.language === "en"
                      ? colors.primary
                      : colors.card,
                  borderColor: colors.border,
                },
              ]}
              textStyle={{
                color: i18n.language === "en" ? onPrimary : onCard,
              }}
            />

            <AccessibleButton
              title={t("common.urdu")}
              onPress={() => handleLanguageSelect("ur")}
              accessibilityLabel="اردو منتخب کریں"
              style={[
                styles.languageButton,
                {
                  backgroundColor:
                    i18n.language === "ur"
                      ? colors.primary
                      : colors.card,
                  borderColor: colors.border,
                },
              ]}
              textStyle={{
                color: i18n.language === "ur" ? onPrimary : onCard,
              }}
            />
          </View>
        </View>

        {/* Accessibility Options */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.accessibilityRow,
              { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
            ]}
          >
            <AccessibleText style={[styles.label, { color: onCard }]}>
              {t("setup.highContrast")}
            </AccessibleText>

            <AccessibleButton
              title={
                isHighContrastEnabled
                  ? t("common.enabled")
                  : t("common.disabled")
              }
              onPress={() => {
                hapticFeedback?.("medium");
                toggleHighContrast();
                speak?.(
                  isHighContrastEnabled
                    ? t("common.disabled")
                    : t("common.enabled"),
                  true
                );
              }}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isHighContrastEnabled
                    ? colors.success
                    : colors.secondary,
                  borderColor: colors.border,
                },
              ]}
              textStyle={{
                color: onColor(
                  isHighContrastEnabled
                    ? colors.success
                    : colors.secondary
                ),
              }}
            />
          </View>
        </View>

        {/* Email Section */}
        <View style={styles.emailSection}>
          <AccessibleText
            style={[
              styles.sectionTitle,
              {
                color: onBackground,
                textAlign: I18nManager.isRTL ? "right" : "left",
              },
            ]}
            level={2}
          >
            {t("setup.enterEmail")}
          </AccessibleText>

          <View
            style={[
              styles.inputWrapper,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <TextInput
              style={[
                styles.input,
                {
                  color: onCard,
                  textAlign: I18nManager.isRTL ? "right" : "left",
                },
              ]}
              placeholder={t("setup.emailPlaceholder")}
              placeholderTextColor={
                onCard === "#000000" ? "#555555" : "#CCCCCC"
              }
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              accessibilityLabel={t("setup.enterEmail")}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        <AccessibleButton
          title={t("common.getStarted")}
          onPress={handleGetStarted}
          style={[
            styles.getStartedButton,
            { backgroundColor: colors.primary, borderColor: colors.border },
          ]}
          textStyle={{ color: onPrimary }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
  topBar: {
    height: 60,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    width: "100%",
    marginBottom: 18,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 2,
    padding: 22,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 22, fontWeight: "700", marginBottom: 18 },
  row: { gap: 16 },
  languageButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 2,
    minHeight: 60,
  },
  accessibilityRow: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: { fontSize: 18, fontWeight: "600" },
  toggleButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    minHeight: 48,
  },
  emailSection: { width: "100%", marginTop: 6, marginBottom: 22 },
  sectionTitle: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 2,
    paddingHorizontal: 16,
    marginTop: 10,
  },
  input: { height: 56, fontSize: 18 },
  getStartedButton: {
    width: "100%",
    borderRadius: 18,
    paddingVertical: 20,
    alignItems: "center",
    borderWidth: 2,
    minHeight: 60,
  },
});

export default SetupScreen;

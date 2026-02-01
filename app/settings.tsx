// import React, { useEffect } from "react";
// import {
//   View,
//   StyleSheet,
//   ScrollView,
//   I18nManager,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { useTranslation } from "react-i18next";

// import { AccessibleButton } from "@/components/AccessibleButton";
// import { AccessibleText } from "@/components/AccessibleText";
// import { useAccessibility } from "@/contexts/AccessibilityContext";
// import { useAccessibleColors } from "@/hooks/useAccessibleColors";

// const SettingsScreen = () => {
//   const router = useRouter();
//   const { t, i18n } = useTranslation();
//   const {
//     speak,
//     hapticFeedback,
//     isHighContrastEnabled,
//     toggleHighContrast,
//   } = useAccessibility();

//   const colors = useAccessibleColors();
//   const onPrimary = "#FFFFFF";
//   const onCard = colors.text;

//   useEffect(() => {
//     speak?.(t("settings.announcement"), true);
//   }, [i18n.language]);

// const handleLanguageSelect = (selected: "en" | "ur") => {
//   hapticFeedback?.("success");
//   i18n.changeLanguage(selected);

//   speak?.(
//     selected === "ur"
//       ? t("settings.urduActive")
//       : t("settings.englishActive"),
//     true
//   );
// };

// const handleToggle = () => {
//     hapticFeedback?.("medium");
//     toggleHighContrast();
    
//     // Announce the change immediately so visually impaired users know it worked
//     speak?.(
//       isHighContrastEnabled 
//         ? t("settings.contrastOff") 
//         : t("settings.contrastOn"), 
//       true
//     );
//   };
  
//   return (
//     <ScrollView
//       contentContainerStyle={[
//         styles.root,
//         { backgroundColor: colors.background },
//       ]}
//       showsVerticalScrollIndicator={false}
//     >
//       <AccessibleText
//         style={[
//           styles.header,
//           {
//             color: colors.primary,
//             textAlign: I18nManager.isRTL ? "right" : "left",
//           },
//         ]}
//         level={1}
//       >
//         {t("settings.title")}
//       </AccessibleText>

//       {/* Language Support */}
//       <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
//         <AccessibleText style={[styles.cardTitle, { color: onCard }]} level={2}>
//           {t("settings.languageSupport")}
//         </AccessibleText>

//         <View style={[styles.row, { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }]}>
//           {(["en", "ur"] as const).map(code => (
//             <AccessibleButton
//               key={code}
//               title={t(code === "en" ? "common.english" : "common.urdu")}
//               onPress={() => handleLanguageSelect(code)}
//               accessibilityLabel={t(code === "en" ? "common.english" : "common.urdu")}
//               style={[
//                 styles.languageButton,
//                 {
//                   backgroundColor: language === code ? colors.primary : colors.card,
//                   borderColor: colors.border,
//                 },
//               ]}
//               textStyle={{ color: language === code ? onPrimary : onCard }}
//             />
//           ))}
//         </View>
//       </View>

//       {/* High Contrast */}
//       <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
//         <View style={[styles.accessibilityRow, { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }]}>
//           <AccessibleText style={[styles.label, { color: onCard }]}>
//             {t("settings.highContrast")}
//           </AccessibleText>

//           <AccessibleButton
//             title={isHighContrastEnabled ? t("common.enabled") : t("common.disabled")}
//             onPress={() => {
//               toggleHighContrast();
//               hapticFeedback?.("medium");
//             }}
//             style={[
//               styles.toggleButton,
//               {
//                 backgroundColor: isHighContrastEnabled
//                   ? colors.success
//                   : colors.secondary,
//               },
//             ]}
//             textStyle={{ color: onPrimary }}
//           />
//         </View>
//       </View>

//       <AccessibleButton
//   title={isHighContrastEnabled ? t("common.enabled") : t("common.disabled")}
//   onPress={handleToggle}
//   accessibilityRole="switch" // Critical for Android TalkBack
//   accessibilityState={{ checked: isHighContrastEnabled }} // Announces "Checked" or "Not Checked"
//   style={[
//     styles.toggleButton,
//     { backgroundColor: isHighContrastEnabled ? colors.success : colors.secondary }
//   ]}
//   textStyle={{ color: onPrimary }}
// />
//     </ScrollView>
//   );
// };

// export default SettingsScreen;

// const styles = StyleSheet.create({
//   root: { flexGrow: 1, padding: 24 },
//   header: { fontSize: 28, fontWeight: "800", marginBottom: 24 },
//   card: { marginBottom: 20, borderRadius: 18, borderWidth: 2, padding: 20 },
//   cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
//   row: { gap: 12 },
//   languageButton: {
//     flex: 1,
//     minHeight: 56,
//     borderRadius: 14,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//   },
//   accessibilityRow: { justifyContent: "space-between", alignItems: "center" },
//   label: { fontSize: 18, fontWeight: "600", flex: 1 },
//   toggleButton: { minHeight: 48, paddingHorizontal: 20, borderRadius: 12 },
//   backButton: {
//     minHeight: 56,
//     borderRadius: 16,
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 10,
//   },
// });


import React from "react";
import { View, StyleSheet, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
// import * as Updates from "expo-updates";
import { Platform } from "react-native";


import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";

const languages = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
];

const SettingsScreen = () => {
  const { t, i18n } = useTranslation();
  const colors = useAccessibleColors();

const changeLanguage = async (code: string) => {
  const isRTL = code === "ur";

  // 1️⃣ Change language
  await i18n.changeLanguage(code);

  // 2️⃣ Handle RTL
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);

    // 3️⃣ Reload safely
    if (Platform.OS === "web") {
      window.location.reload();
    } else {
      console.log("Restart app to apply RTL");
    }
  }
};


  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <AccessibleText style={styles.title} level={1}>
        {t("settings.language")}
      </AccessibleText>

      {languages.map((lang) => {
        const isSelected = i18n.language === lang.code;

        return (
          <AccessibleButton
            key={lang.code}
            onPress={() => changeLanguage(lang.code)}
            style={[
              styles.langButton,
              {
                backgroundColor: isSelected
                  ? colors.primary
                  : colors.secondary,
              },
            ]}
            accessibilityLabel={lang.label}
          >
            <AccessibleText
              style={{
                color: colors.textInverse,
                fontSize: 18,
                fontWeight: "700",
                textAlign: I18nManager.isRTL ? "right" : "left",
              }}
            >
              {lang.label}
            </AccessibleText>
          </AccessibleButton>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 24,
  },
  langButton: {
    minHeight:64,
    paddingVertical:14,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    alignItems:"center"
  },
});

export default SettingsScreen;


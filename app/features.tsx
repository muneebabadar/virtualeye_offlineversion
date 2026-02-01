// import { useRouter } from "expo-router";
// import React, { useEffect, useMemo, useState } from "react";
// import { StyleSheet, View, I18nManager } from "react-native";
// import { useTranslation } from "react-i18next";

// import { useAccessibility } from "@/contexts/AccessibilityContext";
// import { useAccessibleColors } from "@/hooks/useAccessibleColors";
// import { AccessibleButton } from "@/components/AccessibleButton";
// import { AccessibleText } from "@/components/AccessibleText";

// const FeaturesScreen: React.FC = () => {
//   const router = useRouter();
//   const { t, i18n } = useTranslation();
//   const {
//     speak,
//     stopSpeaking,
//     hapticFeedback,
//     isScreenReaderEnabled,
//   } = useAccessibility();
//   const colors = useAccessibleColors();

//   const [selectedMode, setSelectedMode] = useState<string | null>(null);

//   /** 🔊 Screen announcement */
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       speak?.(t("welcome.announcement"), true);
//     }, 400);

//     return () => {
//       clearTimeout(timer);
//       stopSpeaking?.();
//     };
//   }, [i18n.language]);

//   /** 🧠 Localized modes */
//   const modes = useMemo(
//     () => [
//       {
//         id: "object-navigation",
//         title: t("welcome.object"),
//         route: "/object-navigation",
//         description: t("welcome.objectDesc"),
//       },
//       {
//         id: "color-identification",
//         title: t("welcome.color"),
//         route: "/color-identification",
//         description: t("welcome.colorDesc"),
//       },
//       {
//         id: "currency-reader",
//         title: t("welcome.currency"),
//         route: "/currency-reader",
//         description: t("welcome.currencyDesc"),
//       },
//       {
//         id: "person-registration",
//         title: t("welcome.person"),
//         route: "/person-registration",
//         description: t("welcome.personDesc"),
//       },
//     ],
//     [i18n.language]
//   );

//   const handleModeSelect = (mode: (typeof modes)[0]) => {
//     hapticFeedback?.("medium");
//     speak?.(`${mode.title}. ${t("common.selected")}`, true);
//     setSelectedMode(mode.id);

//     setTimeout(() => {
//       router.push(mode.route as any);
//     }, 300);
//   };

//   const handleBack = () => {
//     hapticFeedback?.("light");
//     speak?.(t("common.back"), true);
//     router.replace("/setup")
//     // if (router.canGoBack()) {
//     //   router.back();
//     // }
//   };

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       {/* Header */}
//       <View
//         style={[styles.topBar, { backgroundColor: colors.primary }]}
//         accessibilityRole="header"
//       >
//         {/* 🔙 Back Button */}
//         <AccessibleButton
//           onPress={handleBack}
//           accessibilityLabel={t("common.back")}
//           style={[
//             styles.backButton,
//             {
//               left: I18nManager.isRTL ? undefined : 16,
//               right: I18nManager.isRTL ? 16 : undefined,
//             },
//           ]}
//         >
//           <AccessibleText
//             style={{ color: colors.textInverse, fontSize: 16 }}
//           >
//             {I18nManager.isRTL ? "→" : "←"} {t("common.back")}
//           </AccessibleText>
//         </AccessibleButton>

//         {/* Title */}
//         <AccessibleText
//           style={[styles.topTitle, { color: colors.textInverse }]}
//           level={1}
//         >
//           {t("common.modes")}
//         </AccessibleText>
//       </View>

//       {/* Modes */}
//       <View style={styles.centerArea}>
//         {modes.map((mode, index) => (
//           <View key={mode.id} style={styles.modeWrapper}>
//             <AccessibleButton
//               onPress={() => handleModeSelect(mode)}
//               accessibilityLabel={`${mode.title}. ${mode.description}`}
//               style={[
//                 styles.modeButton,
//                 {
//                   backgroundColor: colors.primary,
//                   borderColor:
//                     selectedMode === mode.id
//                       ? colors.textInverse
//                       : colors.primary,
//                   flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
//                 },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.modeTextContainer,
//                   {
//                     alignItems: I18nManager.isRTL
//                       ? "flex-end"
//                       : "flex-start",
//                   },
//                 ]}
//               >
//                 <AccessibleText
//                   level={2}
//                   style={[
//                     styles.modeTitle,
//                     {
//                       color: colors.textInverse,
//                       textAlign: I18nManager.isRTL ? "right" : "left",
//                     },
//                   ]}
//                 >
//                   {mode.title}
//                 </AccessibleText>

//                 <AccessibleText
//                   style={[
//                     styles.modeSub,
//                     {
//                       color: colors.textInverse,
//                       textAlign: I18nManager.isRTL ? "right" : "left",
//                     },
//                   ]}
//                 >
//                   {mode.description}
//                 </AccessibleText>
//               </View>
//             </AccessibleButton>

//             {isScreenReaderEnabled && (
//               <AccessibleText
//                 accessibilityLabel={`${t("common.mode")} ${
//                   index + 1
//                 } ${t("common.of")} ${modes.length}`}
//                 style={[
//                   styles.srModeNumber,
//                   {
//                     backgroundColor: colors.secondary,
//                     color: colors.textInverse,
//                     right: I18nManager.isRTL ? undefined : 12,
//                     left: I18nManager.isRTL ? 12 : undefined,
//                   },
//                 ]}
//               >
//                 {index + 1} / {modes.length}
//               </AccessibleText>
//             )}
//           </View>
//         ))}
//       </View>

//       Footer
//       <View style={[styles.footer, { borderColor: colors.border }]}>
//         <AccessibleButton
//           onPress={() => router.push("/settings")}
//           accessibilityLabel={t("settings.title")}
//           style={[
//             styles.settingsButton,
//             { backgroundColor: colors.secondary },
//           ]}
//         >
//           <AccessibleText
//             level={2}
//             style={{
//               color: colors.textInverse,
//               fontSize: 18,
//               fontWeight: "700",
//             }}
//           >
//             {t("settings.title")}
//           </AccessibleText>
//         </AccessibleButton>
//       </View>
//     </View>
//   );
// };

// export default FeaturesScreen;

// const styles = StyleSheet.create({
//   root: { flex: 1 },

//   topBar: {
//     minHeight: 100,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingTop: 40,
//   },

//   topTitle: {
//     fontSize: 24,
//     fontWeight: "800",
//   },

//   backButton: {
//     position: "absolute",
//     bottom: 20,
//     padding: 10,
//   },

//   centerArea: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingVertical: 20,
//   },

//   modeWrapper: { marginBottom: 16 },

//   modeButton: {
//     borderRadius: 20,
//     minHeight: 100,
//     paddingHorizontal: 20,
//     borderWidth: 2,
//     justifyContent: "center",
//   },

//   modeTextContainer: { flex: 1 },

//   modeTitle: {
//     fontSize: 20,
//     fontWeight: "800",
//     lineHeight: I18nManager.isRTL ? 30 : 24,
//   },

//   modeSub: {
//     fontSize: 15,
//     marginTop: 4,
//   },

//   srModeNumber: {
//     position: "absolute",
//     top: -8,
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 10,
//     overflow: "hidden",
//   },

//   footer: {
//     padding: 20,
//     borderTopWidth: 2,
//   },

//   settingsButton: {
//     height: 60,
//     borderRadius: 16,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";

import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";

const FeaturesScreen: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const {
    speak,
    stopSpeaking,
    hapticFeedback,
    isScreenReaderEnabled,
  } = useAccessibility();
  const colors = useAccessibleColors();

  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  /** 🔊 Screen announcement */
  useEffect(() => {
    const timer = setTimeout(() => {
      speak?.(t("welcome.announcement"), true);
    }, 400);

    return () => {
      clearTimeout(timer);
      stopSpeaking?.();
    };
  }, [i18n.language]);

  /** 🧠 Localized modes */
  const modes = useMemo(
    () => [
      {
        id: "object-navigation",
        title: t("welcome.object"),
        route: "/object-navigation",
        description: t("welcome.objectDesc"),
      },
      {
        id: "color-identification",
        title: t("welcome.color"),
        route: "/color-identification",
        description: t("welcome.colorDesc"),
      },
      {
        id: "currency-reader",
        title: t("welcome.currency"),
        route: "/currency-reader",
        description: t("welcome.currencyDesc"),
      },
      {
        id: "person-registration",
        title: t("welcome.person"),
        route: "/person-registration",
        description: t("welcome.personDesc"),
      },
    ],
    [i18n.language]
  );

  const handleModeSelect = (mode: (typeof modes)[0]) => {
    hapticFeedback?.("medium");
    speak?.(`${mode.title}. ${t("common.selected")}`, true);
    setSelectedMode(mode.id);

    setTimeout(() => {
      router.push(mode.route as any);
    }, 300);
  };

  const handleBack = () => {
    hapticFeedback?.("light");
    speak?.(t("common.back"), true);
    router.replace("/setup");
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[styles.topBar, { backgroundColor: colors.primary }]}
        accessibilityRole="header"
      >
        {/* 🔙 Back Button */}
        <AccessibleButton
          onPress={handleBack}
          accessibilityLabel={t("common.back")}
          style={[
            styles.backButton,
            {
              left: I18nManager.isRTL ? undefined : 16,
              right: I18nManager.isRTL ? 16 : undefined,
            },
          ]}
          title={`${I18nManager.isRTL ? "→" : "←"} ${t("common.back")}`}
          textStyle={{
            color: colors.textInverse,
            fontSize: 16,
          }}
        />

        {/* Title */}
        <AccessibleText
          style={[styles.topTitle, { color: colors.textInverse }]}
          level={1}
        >
          {t("common.modes")}
        </AccessibleText>
      </View>

      {/* Modes */}
      <View style={styles.centerArea}>
        {modes.map((mode, index) => (
          <View key={mode.id} style={styles.modeWrapper}>
            <AccessibleButton
              onPress={() => handleModeSelect(mode)}
              accessibilityLabel={`${mode.title}. ${mode.description}`}
              style={[
                styles.modeButton,
                {
                  backgroundColor: colors.primary,
                  borderColor:
                    selectedMode === mode.id
                      ? colors.textInverse
                      : colors.primary,
                  flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
                },
              ]}
            >
              <View
                style={[
                  styles.modeTextContainer,
                  {
                    alignItems: I18nManager.isRTL
                      ? "flex-end"
                      : "flex-start",
                  },
                ]}
              >
                <AccessibleText
                  level={2}
                  style={[
                    styles.modeTitle,
                    {
                      color: colors.textInverse,
                      textAlign: I18nManager.isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {mode.title}
                </AccessibleText>

                <AccessibleText
                  style={[
                    styles.modeSub,
                    {
                      color: colors.textInverse,
                      textAlign: I18nManager.isRTL ? "right" : "left",
                    },
                  ]}
                >
                  {mode.description}
                </AccessibleText>
              </View>
            </AccessibleButton>

            {isScreenReaderEnabled && (
              <AccessibleText
                accessibilityLabel={`${t("common.mode")} ${
                  index + 1
                } ${t("common.of")} ${modes.length}`}
                style={[
                  styles.srModeNumber,
                  {
                    backgroundColor: colors.secondary,
                    color: colors.textInverse,
                    right: I18nManager.isRTL ? undefined : 12,
                    left: I18nManager.isRTL ? 12 : undefined,
                  },
                ]}
              >
                {index + 1} / {modes.length}
              </AccessibleText>
            )}
          </View>
        ))}
      </View>

      {/* Footer – FIXED Settings Button */}
      <View style={[styles.footer, { borderColor: colors.border }]}>
        <AccessibleButton
          title={t("settings.title")}
          onPress={() => router.push("/settings")}
          accessibilityLabel={t("settings.title")}
          style={[
            styles.settingsButton,
            { backgroundColor: colors.secondary },
          ]}
          textStyle={{
            color: colors.primary, // ✅ visible text
            fontSize: 18,
            fontWeight: "700",
            textAlign: "center",
          }}
        />
      </View>
    </View>
  );
};

export default FeaturesScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },

  topTitle: {
    fontSize: 24,
    fontWeight: "800",
  },

  backButton: {
    position: "absolute",
    bottom: 20,
    padding: 10,
  },

  centerArea: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  modeWrapper: { marginBottom: 16 },

  modeButton: {
    borderRadius: 20,
    minHeight: 100,
    paddingHorizontal: 20,
    borderWidth: 2,
    justifyContent: "center",
  },

  modeTextContainer: { flex: 1 },

  modeTitle: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: I18nManager.isRTL ? 30 : 24,
  },

  modeSub: {
    fontSize: 15,
    marginTop: 4,
  },

  srModeNumber: {
    position: "absolute",
    top: -8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },

  footer: {
    padding: 20,
    borderTopWidth: 2,
  },

  settingsButton: {
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});

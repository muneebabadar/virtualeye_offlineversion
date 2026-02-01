import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

import en from "./locales/en.json";
import ur from "./locales/ur.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

// RTL handling
i18n.on("languageChanged", (lng) => {
  const isRTL = lng === "ur";
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    // App reload required on Android
  }

  // 🔎 DEBUG (remove later)
  console.log("[i18n] language changed to:", lng);
});

export default i18n;

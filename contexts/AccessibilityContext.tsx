// import * as Haptics from "expo-haptics";
// import * as Speech from "expo-speech";
// import React, {
//   createContext,
//   ReactNode,
//   useContext,
//   useEffect,
//   useState,
// } from "react";
// import { AccessibilityInfo } from "react-native";
// import i18n from "@/src/i18n";
// type HapticType =
//   | "light"
//   | "medium"
//   | "heavy"
//   | "success"
//   | "error"
//   | "warning";


// interface AccessibilityContextType {
//   speak: (text: string, immediate?: boolean) => void;
//   stopSpeaking: () => void;
//   isScreenReaderEnabled: boolean;
//   hapticFeedback: (
//     type?: "light" | "medium" | "heavy" | "success" | "error" | "warning"
//   ) => void;
//   isSpeaking: boolean;
//   isHighContrastEnabled: boolean;
//   toggleHighContrast: () => void;
// }

// const AccessibilityContext =
//   createContext<AccessibilityContextType | undefined>(undefined);

// export const AccessibilityProvider = ({
//   children,
// }: {
//   children: ReactNode;
// }) => {
//   const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);

//   // Detect screen reader
//   useEffect(() => {
//     AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
//   }, []);

//   // 🔁 Stop speech whenever language changes (CRITICAL)
//   useEffect(() => {
//     Speech.stop();
//     setIsSpeaking(false);
//   }, [i18n.language]);

//   const speak = async (text: string, immediate = false) => {
//     if (!text) return;

//     try {
//       if (immediate) {
//         await Speech.stop();
//       }

//       const langCode = i18n.language === "ur" ? "ur-PK" : "en-US";

//       setIsSpeaking(true);

//       Speech.speak(text, {
//         language: langCode,
//         rate: langCode === "ur-PK" ? 0.85 : 0.95,
//         pitch: 1.0,
//         onDone: () => setIsSpeaking(false),
//         onStopped: () => setIsSpeaking(false),
//         onError: () => setIsSpeaking(false),
//       });
//     } catch (e) {
//       setIsSpeaking(false);
//     }
//   };

//   const stopSpeaking = async () => {
//     await Speech.stop();
//     setIsSpeaking(false);
//   };

//   const toggleHighContrast = () => {
//     setIsHighContrastEnabled((prev) => !prev);
//   };
// const hapticFeedback = (type: HapticType = "medium") => {
//   const map: Record<HapticType, Haptics.ImpactFeedbackStyle> = {
//     light: Haptics.ImpactFeedbackStyle.Light,
//     medium: Haptics.ImpactFeedbackStyle.Medium,
//     heavy: Haptics.ImpactFeedbackStyle.Heavy,
//     success: Haptics.ImpactFeedbackStyle.Medium,
//     error: Haptics.ImpactFeedbackStyle.Heavy,
//     warning: Haptics.ImpactFeedbackStyle.Medium,
//   };

//   Haptics.impactAsync(map[type]);
// };


//   return (
//     <AccessibilityContext.Provider
//       value={{
//         speak,
//         stopSpeaking,
//         isScreenReaderEnabled,
//         hapticFeedback,
//         isSpeaking,
//         isHighContrastEnabled,
//         toggleHighContrast,
//       }}
//     >
//       {children}
//     </AccessibilityContext.Provider>
//   );
// };

// export const useAccessibility = () => {
//   const ctx = useContext(AccessibilityContext);
//   if (!ctx) {
//     throw new Error("useAccessibility must be used within AccessibilityProvider");
//   }
//   return ctx;
// };



import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AccessibilityInfo, Platform } from "react-native";
import i18n from "@/src/i18n";

type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "success"
  | "error"
  | "warning";

interface AccessibilityContextType {
  speak: (text: string, immediate?: boolean) => void;
  stopSpeaking: () => void;
  isScreenReaderEnabled: boolean;
  hapticFeedback: (
    type?: "light" | "medium" | "heavy" | "success" | "error" | "warning"
  ) => void;
  isSpeaking: boolean;
  isHighContrastEnabled: boolean;
  toggleHighContrast: () => void;
  urduVoiceAvailable: boolean; // NEW: Track if Urdu is available
}

const AccessibilityContext =
  createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isHighContrastEnabled, setIsHighContrastEnabled] = useState(false);
  const [urduVoiceAvailable, setUrduVoiceAvailable] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [preferredUrduLanguage, setPreferredUrduLanguage] = useState<string | null>(null);

  // Check available voices on mount
  useEffect(() => {
    checkUrduVoiceAvailability();
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
  }, []);

  // Stop speech whenever language changes (critical)
  useEffect(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, [i18n.language]);

  // Check if Urdu voice is available on device
  const checkUrduVoiceAvailability = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const languages = [...new Set(voices.map(v => v.language))];
      setAvailableLanguages(languages);

      // Check for Urdu voices (ur-PK, ur-IN, or just "ur")
      const urduVoices = voices.filter(v =>
        v.language.toLowerCase().startsWith("ur")
      );
      const hasUrdu = urduVoices.length > 0;

      setUrduVoiceAvailable(hasUrdu);

      if (!hasUrdu) {
        console.warn("No Urdu TTS voice found on device. Falling back to English.");
        setPreferredUrduLanguage(null);
      } else {
        // Prefer ur-PK if available, else ur-IN, else first ur*
        const urPk = urduVoices.find(v => v.language.toLowerCase() === "ur-pk");
        const urIn = urduVoices.find(v => v.language.toLowerCase() === "ur-in");
        const preferred = urPk?.language ?? urIn?.language ?? urduVoices[0]?.language ?? null;
        setPreferredUrduLanguage(preferred);
      }
    } catch (error) {
      console.error("Error checking voices:", error);
      setUrduVoiceAvailable(false);
      setPreferredUrduLanguage(null);
    }
  };

  // Speak text with improved Urdu support
  const speak = async (text: string, immediate = false) => {
    if (!text) return;

    try {
      if (immediate) {
        await Speech.stop();
      }

      const isUrdu = i18n.language === "ur";

      // Choose a supported language; fallback to English if Urdu is missing
      let langCode = "en-US";
      if (isUrdu) {
        langCode = preferredUrduLanguage ?? "en-US";
      } else if (availableLanguages.includes("en-US")) {
        langCode = "en-US";
      } else if (availableLanguages.length > 0) {
        langCode = availableLanguages[0];
      }

      setIsSpeaking(true);

      const speechOptions: Speech.SpeechOptions = {
        language: langCode,
        rate: isUrdu ? 0.75 : 0.95,
        pitch: 1.0,
        onDone: () => {
          setIsSpeaking(false);
        },
        onStopped: () => {
          setIsSpeaking(false);
        },
        onError: (error) => {
          setIsSpeaking(false);
          console.error("Speech error:", error);
        },
      };

      Speech.speak(text, speechOptions);

    } catch (e) {
      console.error("Speech exception:", e);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = async () => {
    await Speech.stop();
    setIsSpeaking(false);
  };

  const toggleHighContrast = () => {
    setIsHighContrastEnabled((prev) => !prev);
  };

  const hapticFeedback = (type: HapticType = "medium") => {
    const map: Record<HapticType, Haptics.ImpactFeedbackStyle> = {
      light: Haptics.ImpactFeedbackStyle.Light,
      medium: Haptics.ImpactFeedbackStyle.Medium,
      heavy: Haptics.ImpactFeedbackStyle.Heavy,
      success: Haptics.ImpactFeedbackStyle.Medium,
      error: Haptics.ImpactFeedbackStyle.Heavy,
      warning: Haptics.ImpactFeedbackStyle.Medium,
    };

    Haptics.impactAsync(map[type]);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        speak,
        stopSpeaking,
        isScreenReaderEnabled,
        hapticFeedback,
        isSpeaking,
        isHighContrastEnabled,
        toggleHighContrast,
        urduVoiceAvailable,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return ctx;
};

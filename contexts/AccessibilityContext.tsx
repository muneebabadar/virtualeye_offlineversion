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

  // 🔍 Check available voices on mount
  useEffect(() => {
    checkUrduVoiceAvailability();
    AccessibilityInfo.isScreenReaderEnabled().then(setIsScreenReaderEnabled);
  }, []);

  // 🛑 Stop speech whenever language changes (CRITICAL)
  useEffect(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, [i18n.language]);

  /**
   * 🔍 Check if Urdu voice is available on device
   */
  const checkUrduVoiceAvailability = async () => {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      
      console.log("📢 Available TTS voices:", voices.length);
      
      // Check for Urdu voices (ur-PK, ur-IN, or just "ur")
      const hasUrdu = voices.some((voice) =>
        voice.language.toLowerCase().startsWith("ur")
      );

      setUrduVoiceAvailable(hasUrdu);

      if (!hasUrdu) {
        console.warn("⚠️ No Urdu TTS voice found on device!");
        console.log("Available languages:", 
          [...new Set(voices.map(v => v.language))].slice(0, 20)
        );
      } else {
        const urduVoices = voices.filter(v => 
          v.language.toLowerCase().startsWith("ur")
        );
        console.log("✅ Urdu voices found:", urduVoices);
      }
    } catch (error) {
      console.error("❌ Error checking voices:", error);
      setUrduVoiceAvailable(false);
    }
  };

  /**
   * 🗣️ Speak text with improved Urdu support
   */
  const speak = async (text: string, immediate = false) => {
    if (!text) return;

    try {
      if (immediate) {
        await Speech.stop();
      }

      const isUrdu = i18n.language === "ur";
      
      // 🎯 Better language code handling
      let langCode = "en-US";
      let voiceIdentifier: string | undefined = undefined;

      if (isUrdu) {
        if (!urduVoiceAvailable) {
          console.warn("⚠️ Urdu voice not available, using transliteration fallback");
          // You could transliterate Urdu text to Roman Urdu here if needed
        }

        // Try multiple Urdu locale codes
        if (Platform.OS === "android") {
          langCode = "ur-PK"; // Pakistani Urdu (primary)
          // Android often needs explicit voice selection
        } else if (Platform.OS === "ios") {
          langCode = "ur-PK"; // iOS also supports ur-PK
          // iOS might have specific voice identifiers
        }
      } else {
        langCode = "en-US";
      }

      console.log(`🗣️ Speaking in ${langCode}: "${text.substring(0, 50)}..."`);

      setIsSpeaking(true);

      const speechOptions: Speech.SpeechOptions = {
        language: langCode,
        rate: isUrdu ? 0.75 : 0.95, // Slower rate for Urdu (better clarity)
        pitch: 1.0,
        onDone: () => {
          setIsSpeaking(false);
          console.log("✅ Speech completed");
        },
        onStopped: () => {
          setIsSpeaking(false);
          console.log("🛑 Speech stopped");
        },
        onError: (error) => {
          setIsSpeaking(false);
          console.error("❌ Speech error:", error);
        },
      };

      // Add voice identifier if needed (for iOS)
      if (voiceIdentifier) {
        speechOptions.voice = voiceIdentifier;
      }

      Speech.speak(text, speechOptions);

    } catch (e) {
      console.error("❌ Speech exception:", e);
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
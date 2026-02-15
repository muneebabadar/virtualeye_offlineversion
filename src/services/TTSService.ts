// src/services/TTSService.ts
import Tts from 'react-native-tts';
import i18n from '@/src/i18n';

const setLanguage = async () => {
  const lang = i18n.language === 'ur' ? 'ur-PK' : 'en-US';
  try {
    await Tts.setDefaultLanguage(lang);
  } catch {
    // Fallback to English if Urdu TTS is unavailable
    await Tts.setDefaultLanguage('en-US');
  }
};

// Update language whenever app language changes
i18n.on('languageChanged', () => {
  setLanguage();
});

// Initialize once
setLanguage();

export const speak = async (text: string) => {
  if (!text) return;
  await setLanguage();
  Tts.stop(); // Stop previous speech so it doesn't overlap
  Tts.speak(text);
};

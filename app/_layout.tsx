import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AccessibilityProvider, useAccessibility } from '@/contexts/AccessibilityContext';
import { useColorScheme, ColorSchemeName } from 'react-native';
import React from 'react';

// A helper component to handle theme logic inside the Provider
// This allows us to use the useAccessibility hook which is only available inside AccessibilityProvider
function RootLayoutContent({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const { isHighContrastEnabled } = useAccessibility();

  // Determine theme: If High Contrast is on, we default to DarkTheme for better visibility
  const theme = isHighContrastEnabled || colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={theme}>
      <Stack screenOptions={{ headerShown: false
 }}>
        {/* Main Entry Points */}
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="setup" />
        <Stack.Screen name="features" />
        <Stack.Screen name="settings" />

        {/* Feature Screens */}
        <Stack.Screen name="object-navigation" />
        <Stack.Screen name="color-identification" />
        <Stack.Screen name="currency-reader" />
        
        {/* Registration Flow */}
        <Stack.Screen name="person-registration" />
        <Stack.Screen name="person-capture" />
        <Stack.Screen name="person-name" />
        <Stack.Screen name="person-review" />

        {/* Tabs and Modals */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="modal" 
          options={{ 
            presentation: 'modal', 
            headerShown: true,
            title: 'Information' 
          }} 
        />
      </Stack>
      
      {/* FIX: For Android Accessibility, the status bar must contrast with the header.
        If High Contrast is on, we force light icons on the dark header.
      */}
      <StatusBar style={isHighContrastEnabled ? "light" : "auto"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  // Get the system color scheme (light/dark)
  const colorScheme = useColorScheme();

  return (
    <AccessibilityProvider>
      <RootLayoutContent colorScheme={colorScheme} />
    </AccessibilityProvider>
  );
}
import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { Feather } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, TouchableOpacity, View, PixelRatio } from "react-native";
import { useTranslation } from "react-i18next";

const PersonCaptureScreen = () => {
  const router = useRouter();
  const { speak, hapticFeedback } = useAccessibility();
  const colors = useAccessibleColors();
  const { t } = useTranslation();

  const [permission, requestPermission] = useCameraPermissions();
  const [count, setCount] = useState(0);

  // FIX: Using PixelRatio to ensure text scales correctly for low-vision users
  const fontScale = PixelRatio.getFontScale();

  useEffect(() => {
    speak?.(t("personCapture.announcement"), true);
    if (!permission) requestPermission();
  }, [permission]);

  const handleCapture = () => {
    hapticFeedback?.("heavy"); // Stronger haptic for "shutter" feel
    const next = count + 1;
    setCount(next);

    speak?.(t("personCapture.photoCaptured", { count: next }), true);

    if (next >= 5) {
      speak?.(t("personCapture.completed"), true);
      router.replace({
        pathname: "/person-name",
        params: { count: String(next) },
      });
    }
  };

  const renderCamera = () => {
    if (!permission) return <View />;
    if (!permission.granted) {
      return (
        <View style={[styles.permissionCenterOverlay, { backgroundColor: colors.background }]}>
          <AccessibleButton
            title={t("personCapture.allowCamera")}
            onPress={requestPermission}
            variant="primary"
          />
        </View>
      );
    }

    return (
      <View style={[styles.cameraFrameOuter, { borderColor: colors.primary }]}>
        <CameraView 
          style={styles.camera} 
          facing="front"
          // FIX: Labeling the camera feed for TalkBack
          accessible={true}
          accessibilityLabel={t("personCapture.liveFeedLabel")}
        />
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <AccessibleText style={[styles.topTitle, { color: colors.textInverse }]} level={1}>
          {t("personCapture.title")}
        </AccessibleText>
      </View>

      <View style={styles.content}>
        <AccessibleText style={[styles.instructions, { color: colors.text, fontSize: 16 * fontScale }]}>
          {t("personCapture.instructions")}
        </AccessibleText>

        {renderCamera()}

        <AccessibleText
          style={[styles.counterText, { color: colors.text, fontSize: 16 * fontScale }]}
          accessibilityRole="header"
          level={2}
        >
          {t("personCapture.counter", { count })}
        </AccessibleText>

        <View style={styles.captureWrapper}>
          <TouchableOpacity
            style={[
              styles.captureButton,
              { backgroundColor: colors.primary, borderColor: colors.border },
            ]}
            onPress={handleCapture}
            // FIX: Larger hitSlop for easier blind interaction
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t("personCapture.captureLabel", { count: count + 1 })}
            accessibilityHint={t("personCapture.captureHint")}
          >
            <Feather name="camera" size={40} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    minHeight: 100, // FIX: Adaptive height
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 40,
  },
  topTitle: { fontSize: 24, fontWeight: "800" },
  content: { flex: 1, paddingHorizontal: 20, paddingBottom: 30 },
  instructions: { textAlign: "center", marginBottom: 12 },
  cameraFrameOuter: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  camera: { flex: 1 },
  permissionCenterOverlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  counterText: { fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  captureWrapper: { paddingBottom: 10 },
  captureButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    elevation: 4, // Android shadow for visual depth
  },
});

export default PersonCaptureScreen;
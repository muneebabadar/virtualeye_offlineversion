import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { 
  ActivityIndicator, 
  Alert, 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  I18nManager, 
  PixelRatio 
} from "react-native";
import { checkApiHealth, detectObjects } from "../services/detectionApi";

// FIX 7006: Define the shape of a detection object
interface Detection {
  class: string;
  confidence: number;
}

const ObjectDetectionScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { speak, hapticFeedback } = useAccessibility();
  const colors = useAccessibleColors();

  const [permission, requestPermission] = useCameraPermissions();
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<string>("");
  const [apiConnected, setApiConnected] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  // FIX 2339: Explicitly type the camera ref
  const cameraRef = useRef<CameraView>(null);

  // FIX 2322: Explicitly type the interval ref to handle numbers (Interval IDs)
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    speak?.(t("objectDetection.screenIntro"), true);
    checkConnection();
  }, []);

  useEffect(() => {
    if (isAutoDetecting && apiConnected) {
      detectionIntervalRef.current = setInterval(captureObjects, 2000);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, [isAutoDetecting, apiConnected]);

  const checkConnection = async () => {
    const isConnected = await checkApiHealth();
    setApiConnected(isConnected);

    if (!isConnected) {
      Alert.alert(
        t("objectDetection.apiNotConnected"),
        t("objectDetection.apiNotConnected")
      );
    }
  };

  const captureObjects = async () => {
    // FIX 2339: Added proper null check for TypeScript
    if (!cameraRef.current || isDetecting || !apiConnected) return;

    setIsDetecting(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (!photo?.uri) throw new Error();

      const result = await detectObjects(photo.uri, 0.3);

      if (result.detections?.length) {
        // FIX 7006: Properly typed reduce function
        const best = result.detections.reduce((a: Detection, b: Detection) =>
          a.confidence > b.confidence ? a : b
        );

        if (lastDetection !== best.class) {
          setLastDetection(best.class);
          speak?.(best.class, true);
          hapticFeedback?.("success");
        }
      } else {
        setLastDetection("");
      }
    } catch (err) {
      speak?.(t("objectDetection.detectionFailed"), true);
      hapticFeedback?.("error");
    } finally {
      setIsDetecting(false);
    }
  };

  const toggleAuto = () => {
    if (!apiConnected) {
      speak?.(t("objectDetection.apiNotConnected"), true);
      return;
    }

    const next = !isAutoDetecting;
    setIsAutoDetecting(next);
    hapticFeedback?.("medium");

    speak?.(
      next
        ? t("objectDetection.startDetection")
        : t("objectDetection.stopDetection"),
      true
    );

    if (!next) setLastDetection("");
  };

  const renderCamera = () => {
    if (!permission) return <View />;

    if (!permission.granted) {
      return (
        <View style={[styles.permissionCenter, { backgroundColor: colors.background }]}>
          <AccessibleButton
            title={t("objectDetection.allowCamera")}
            onPress={requestPermission}
            variant="primary"
          />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />

        {/* Status Overlay - RTL Aware */}
        <View
          style={[
            styles.statusOverlay, 
            { 
              backgroundColor: colors.card, 
              borderColor: colors.border,
              flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' 
            }
          ]}
          accessible
          accessibilityLabel={`${t("objectDetection.apiStatus")}: ${apiConnected ? t("objectDetection.connected") : t("objectDetection.disconnected")}`}
        >
          <View
            style={[
              styles.statusDot,
              { 
                backgroundColor: apiConnected ? colors.success : colors.danger,
                borderRadius: apiConnected ? 7 : 0 // Square for disconnected
              },
            ]}
          />
          <AccessibleText style={{ color: colors.text, flex: 1, textAlign: I18nManager.isRTL ? 'right' : 'left' }}>
            {apiConnected ? t("objectDetection.connected") : t("objectDetection.disconnected")}
          </AccessibleText>

          <TouchableOpacity
            onPress={checkConnection}
            style={styles.refreshButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            accessible
            accessibilityRole="button"
            accessibilityLabel={t("objectDetection.refreshConnection")}
          >
            <AccessibleText style={{ fontSize: 24 }}>🔄</AccessibleText>
          </TouchableOpacity>
        </View>

        {/* Live Region for Scanning Feedback */}
        {isAutoDetecting && (
          <View 
            style={[styles.detectingIndicator, { backgroundColor: colors.primary }]}
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator color={colors.textInverse} size="large" />
            <AccessibleText style={{ color: colors.textInverse, marginLeft: 12, fontWeight: '700' }}>
              {t("objectDetection.scanning")}
            </AccessibleText>
          </View>
        )}

        {/* Result Overlay */}
        {lastDetection !== "" && (
          <View 
            style={[styles.resultBox, { backgroundColor: colors.primary, borderColor: colors.textInverse, borderWidth: 2 }]}
            accessibilityRole="alert"
          >
            <AccessibleText 
              style={{ color: colors.textInverse, fontSize: 32, textAlign: 'center' }}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {lastDetection}
            </AccessibleText>
          </View>
        )}

        <View style={styles.toggleContainer}>
          <AccessibleButton
            title={isAutoDetecting ? t("objectDetection.stopDetection") : t("objectDetection.startDetection")}
            onPress={toggleAuto}
            disabled={!apiConnected}
            accessibilityRole="switch"
            accessibilityState={{ checked: isAutoDetecting }}
            style={[
              styles.toggleButton,
              isAutoDetecting && { backgroundColor: colors.danger },
              !apiConnected && { backgroundColor: colors.disabled },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <AccessibleText style={{ color: colors.textInverse, fontSize: 24, fontWeight: '800' }} accessibilityRole="header">
          {t("objectDetection.title")}
        </AccessibleText>
      </View>

      <View style={{ flex: 1 }}>{renderCamera()}</View>

      <View style={[styles.bottomBar, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
        <AccessibleButton
          title={t("objectDetection.modes")}
          onPress={() => {
            setIsAutoDetecting(false);
            router.push("/features");
          }}
          style={styles.bottomButton}
        />

        <AccessibleButton
          title={I18nManager.isRTL ? "انگریزی" : "ENG"}
          onPress={() => speak?.(t("objectDetection.languageEnglish"), true)}
          style={styles.bottomButton}
        />
      </View>
    </View>
  );
};

export default ObjectDetectionScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { minHeight: 100, justifyContent: "center", alignItems: "center", paddingTop: 30 },
  camera: { flex: 1 },
  permissionCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    zIndex: 10,
  },
  statusDot: { width: 14, height: 14, marginRight: 10 },
  refreshButton: { minWidth: 48, minHeight: 48, alignItems: "center", justifyContent: "center" },
  detectingIndicator: {
    position: "absolute",
    top: 110,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
  },
  resultBox: {
    position: "absolute",
    top: "35%",
    left: 20,
    right: 20,
    padding: 30,
    borderRadius: 24,
    elevation: 5,
  },
  toggleContainer: { position: "absolute", bottom: 40, left: 20, right: 20, alignItems: "center" },
  toggleButton: { width: '100%', paddingVertical: 22, borderRadius: 32 },
  bottomBar: { padding: 16, gap: 12 },
  bottomButton: { flex: 1, minHeight: 64 },
});
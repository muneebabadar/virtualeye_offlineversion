import { AccessibleButton } from "@/components/AccessibleButton";
import { AccessibleText } from "@/components/AccessibleText";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useAccessibleColors } from "@/hooks/useAccessibleColors";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity, View, I18nManager, PixelRatio } from "react-native";
import { checkApiHealth, detectCurrency } from "../services/detectionApi";

const CurrencyReaderScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { speak, hapticFeedback } = useAccessibility();
  const colors = useAccessibleColors();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<string>("");
  const [apiConnected, setApiConnected] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);

  const cameraRef = useRef<CameraView>(null);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initial Announcement
  useEffect(() => {
    speak?.(t("currencyReader.announcement"), true);
    checkConnection();
  }, []);

  // Interval Logic
  useEffect(() => {
    if (isAutoDetecting && apiConnected) {
      detectionIntervalRef.current = setInterval(captureCurrency, 2500);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    }
    return () => { if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current); };
  }, [isAutoDetecting, apiConnected]);

  const checkConnection = async () => {
    const isConnected = await checkApiHealth();
    setApiConnected(isConnected);
    if (!isConnected) {
      Alert.alert(t("objectDetection.apiNotConnected"), t("objectDetection.apiNotConnected"));
    }
  };

  const captureCurrency = async () => {
    if (!cameraRef.current || isDetecting || !apiConnected) return;
    setIsDetecting(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) throw new Error();

      const result = await detectCurrency(photo.uri, 0.5);
      if (result.detections?.length > 0) {
        const best = result.detections.reduce((a: any, b: any) => a.confidence > b.confidence ? a : b);
        if (lastDetection !== best.class) {
          setLastDetection(best.class);
          hapticFeedback?.("success");
          speak?.(best.class, true);
        }
      } else {
        setLastDetection("");
      }
    } catch (e) {
       // Silent fail in auto-mode to avoid spamming "failed"
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
    speak?.(next ? t("objectDetection.startDetection") : t("objectDetection.stopDetection"), true);
  };

  const renderCamera = () => {
    if (!permission?.granted) {
      return (
        <View style={styles.permissionCenter}>
          <AccessibleButton title={t("personCapture.allowCamera")} onPress={requestPermission} />
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView style={styles.camera} facing="back" ref={cameraRef} accessible={true} accessibilityLabel={t("personCapture.liveFeedLabel")} />

        {/* Connection Status Overlay */}
        <View style={[styles.statusOverlay, { backgroundColor: colors.card, borderColor: colors.border, flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}
          accessible accessibilityLabel={`${t("objectDetection.connected")}: ${apiConnected ? t("connected") : t("disconnected")}`}>
          <View style={[styles.statusDot, { backgroundColor: apiConnected ? colors.success : colors.danger }]} />
          <AccessibleText style={{ color: colors.text, flex: 1, textAlign: I18nManager.isRTL ? 'right' : 'left' }}>
            {apiConnected ? t("objectDetection.connected") : t("objectDetection.disconnected")}
          </AccessibleText>
          <TouchableOpacity onPress={checkConnection} style={styles.refreshButton} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} accessibilityRole="button" accessibilityLabel={t("objectDetection.refreshConnection")}>
            <AccessibleText style={{ fontSize: 24 }}>🔄</AccessibleText>
          </TouchableOpacity>
        </View>

        {/* Scanning Live Region */}
        {isAutoDetecting && (
          <View style={[styles.detectingIndicator, { backgroundColor: colors.primary }]} accessibilityLiveRegion="polite">
            <ActivityIndicator size="small" color={colors.textInverse} />
            <AccessibleText style={{ color: colors.textInverse, marginLeft: 8, fontWeight: '700' }}>{t("objectDetection.scanning")}</AccessibleText>
          </View>
        )}

        {/* Detection Result Box */}
        {lastDetection !== "" && (
          <View style={[styles.resultContainer, { backgroundColor: colors.primary, borderColor: colors.textInverse, borderWidth: 2 }]} accessibilityRole="alert">
            <AccessibleText style={{ color: colors.textInverse, fontSize: 32, textAlign: 'center' }} adjustsFontSizeToFit numberOfLines={1}>
              {lastDetection}
            </AccessibleText>
          </View>
        )}

        <View style={styles.toggleOverlay}>
          <AccessibleButton
            title={isAutoDetecting ? t("objectDetection.stopDetection") : t("objectDetection.startDetection")}
            onPress={toggleAuto}
            disabled={!apiConnected}
            accessibilityRole="switch"
            accessibilityState={{ checked: isAutoDetecting }}
            style={[styles.toggleButton, isAutoDetecting && { backgroundColor: colors.danger }]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <AccessibleText style={{ color: colors.textInverse, fontSize: 24, fontWeight: '800' }} accessibilityRole="header">{t("welcome.currency")}</AccessibleText>
      </View>
      <View style={{ flex: 1 }}>{renderCamera()}</View>
      <View style={[styles.bottomBar, { flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row' }]}>
        <AccessibleButton title={t("common.modes")} onPress={() => router.push("/features")} style={styles.bottomButton} />
        <AccessibleButton title={I18nManager.isRTL ? "اردو" : "ENG"} onPress={() => {}} style={styles.bottomButton} />
      </View>
    </View>
  );
};

// ... Styles remain mostly similar but using minHeights/paddings for scaling ...

export default CurrencyReaderScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  permissionCenter: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    padding: 20 
  },

  topBar: {
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop:30,
  },
  topTitle: { fontSize: 24, fontWeight: "800" },

  cameraContainer: { flex: 1 },
  camera: { flex: 1 },

  permissionCenterOverlay: { flex: 1, alignItems: "center", justifyContent: "center" },
  permissionButton: { paddingHorizontal: 24, paddingVertical: 16, borderRadius: 16, borderWidth: 1 },

  statusOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  statusText: { fontSize: 14, flex: 1 },

  // FIX: guaranteed >= 48dp
  refreshButton: {
    width: 48,
    height: 48,
    minWidth: 48,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  refreshText: { fontSize: 18 },

  detectingIndicator: {
    position: "absolute",
    top: 78,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
  },
  detectingIndicatorText: { fontSize: 14, marginLeft: 8, fontWeight: "700" },

  resultContainer: {
    position: "absolute",
    top: "40%",
    left: 30,
    right: 30,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 2,
  },
  resultText: { fontSize: 32, textAlign: "center", fontWeight: "800" },

  toggleOverlay: { position: "absolute", bottom: 30, left: 0, right: 0, alignItems: "center" },
  toggleButton: {
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    minWidth: 280,
    minHeight: 56,
    alignItems: "center",
  },

  bottomBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 },
  bottomButton: { flex: 1, height: 80, borderRadius: 18, marginHorizontal: 6, alignItems: "center", justifyContent: "center" },
});

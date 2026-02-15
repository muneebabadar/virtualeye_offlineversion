import { AccessibleButton } from "@/components/AccessibleButton"
import { AccessibleText } from "@/components/AccessibleText"
import { useAccessibility } from "@/contexts/AccessibilityContext"
import { useAccessibleColors } from "@/hooks/useAccessibleColors"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import { useTranslation } from "react-i18next"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
  I18nManager,
} from "react-native"
import { Alert, NativeModules } from "react-native"
import { preprocessImage } from "@/src/utils/imageUtils"


const CURRENCY_LABELS: Record<number, string> = {
  0: "10 Rupees",
  1: "100 Rupees",
  2: "1000 Rupees",
  3: "20 Rupees",
  4: "50 Rupees",
  5: "500 Rupees",
  6: "5000 Rupees",
  7: "75 Rupees",
}
const CURRENCY_MODEL_SIZE = 416
const MIN_CONFIDENCE = 0.5
const DEBUG_DETECTIONS = true

const getCenterSquareCrop = (width?: number, height?: number) => {
  if (!width || !height) return null
  const size = Math.max(1, Math.min(width, height))
  const originX = Math.max(0, Math.min(width - size, (width - size) / 2))
  const originY = Math.max(0, Math.min(height - size, (height - size) / 2))
  if (originX + size > width || originY + size > height) return null
  return { originX, originY, width: size, height: size }
}

const mapBoxToPreview = (
  box: number[],
  preview: { width: number; height: number },
  modelSize: number
) => {
  const square = Math.min(preview.width, preview.height)
  const offsetX = (preview.width - square) / 2
  const offsetY = (preview.height - square) / 2
  const scale = square / modelSize

  const left = Math.max(0, Math.min(preview.width, offsetX + box[0] * scale))
  const top = Math.max(0, Math.min(preview.height, offsetY + box[1] * scale))
  const right = Math.max(0, Math.min(preview.width, offsetX + box[2] * scale))
  const bottom = Math.max(0, Math.min(preview.height, offsetY + box[3] * scale))
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  }
}

const CurrencyReaderScreen = () => {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const { speak, hapticFeedback } = useAccessibility()
  const colors = useAccessibleColors()
  const [isLoadingModel, setIsLoadingModel] = useState(true)
  const [isSupported, setIsSupported] = useState(true)
  const [lastError, setLastError] = useState("")

  const [permission, requestPermission] = useCameraPermissions()
  const [isDetecting, setIsDetecting] = useState(false)
  const [lastDetection, setLastDetection] = useState<string>("")
  const [lastDebug, setLastDebug] = useState<string>("")
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  // DEBUG_OVERLAY: bounding boxes state (remove for production)
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 })
  const [debugDetections, setDebugDetections] = useState<
    Array<{ box: number[]; score: number; classId: number }>
  >([])

  const cameraRef = useRef<CameraView>(null)
  const detectionServiceRef = useRef<{
    load: () => Promise<void>
    detect: (input: Float32Array, confidence?: number) => Promise<
      Array<{ box: number[]; score: number; classId: number }>
    >
    runRaw: (input: Float32Array) => Promise<unknown>
  } | null>(null)
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initial announcement + load model
  useEffect(() => {
    const loadModel = async () => {
      try {
        speak?.(t("currencyReader.announcement"), true)
        setIsLoadingModel(true)
        const hasTflite = !!NativeModules?.Tflite
        if (!hasTflite) {
          setIsSupported(false)
          return
        }

        const { default: CurrencyDetectionService } = await import(
          "@/src/services/CurrencyDetectionService"
        )
        await CurrencyDetectionService.load()
        detectionServiceRef.current = CurrencyDetectionService
        setLastError("")
      } catch {
        Alert.alert(t("common.error"), t("currencyReader.modelLoadFailed"))
        setLastError(t("currencyReader.modelLoadFailed"))
      } finally {
        setIsLoadingModel(false)
      }
    }

    loadModel()
  }, [])


  // Auto detection loop (offline)
  useEffect(() => {
    if (isAutoDetecting && !isLoadingModel) {
      detectionIntervalRef.current = setInterval(captureCurrency, 800)
    } else if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
        detectionIntervalRef.current = null
      }
    }
  }, [isAutoDetecting, isLoadingModel])

  const captureCurrency = async () => {
    if (!cameraRef.current || isDetecting) return
    if (!detectionServiceRef.current) return
    setIsDetecting(true)

    let inputTensor: Float32Array | null = null
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        shutterSound: false,
        skipProcessing: true,
      })
      if (!photo?.uri) return

      const crop = getCenterSquareCrop(photo.width, photo.height)
      inputTensor = await preprocessImage(photo.uri, 416, 416, false, crop ?? undefined)
      const detections = await detectionServiceRef.current.detect(inputTensor, MIN_CONFIDENCE)
      const best = detections.length
        ? detections.reduce((a, b) => (a.score >= b.score ? a : b))
        : null

      if (best) {
        const label = CURRENCY_LABELS[best.classId]
        setLastDebug(
          `classId=${best.classId} conf=${best.score.toFixed(3)}`
        )
        // DEBUG_OVERLAY: draw only the best box (remove for production)
        setDebugDetections([best])
        if (DEBUG_DETECTIONS) {
          console.log("[currency] preview", previewSize, "model", CURRENCY_MODEL_SIZE)
          console.log("[currency] raw box", best.box, "score", best.score, "class", best.classId)
          if (previewSize.width && previewSize.height) {
            const mapped = mapBoxToPreview(best.box, previewSize, CURRENCY_MODEL_SIZE)
            console.log("[currency] mapped box", mapped)
          }
        }

        if (label) {
          if (lastDetection !== label) {
            setLastDetection(label)
            hapticFeedback?.("success")
            speak?.(label, true)
          }
        } else {
          setLastDetection("")
        }
      } else {
        setLastDetection("")
        // DEBUG_OVERLAY: clear boxes when nothing detected
        setDebugDetections([])
      }

    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("common.error", "Error")
      setLastError(message)
      if (detectionServiceRef.current && inputTensor) {
        try {
          const outputs = await detectionServiceRef.current.runRaw(inputTensor)
          const debug = Array.isArray(outputs)
            ? outputs.map((o) => (o as any)?.length ?? "n/a").join(",")
            : "non-array outputs"
          setLastDebug(`outputs=[${debug}]`)
        } catch {}
      }
    } finally {
      setIsDetecting(false)
    }
  }

  const toggleAuto = () => {
    const next = !isAutoDetecting
    setIsAutoDetecting(next)
    hapticFeedback?.("medium")
    speak?.(
      next
        ? t("currencyReader.startDetection", "Start Detection")
        : t("currencyReader.stopDetection", "Stop Detection"),
      true
    )
  }

  const toggleLanguage = async () => {
    const nextLang = i18n.language === "ur" ? "en" : "ur"
    await i18n.changeLanguage(nextLang)
    speak?.(
      nextLang === "ur"
        ? t("common.languageChangedUrdu", "زبان اردو میں تبدیل کر دی گئی ہے")
        : t("common.languageChangedEnglish", "Language set to English"),
      true
    )
  }

  const renderCamera = () => {
    if (isLoadingModel) {
      return (
        <View style={styles.permissionCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AccessibleText style={{ marginTop: 12, color: colors.text }}>
            {t("currencyReader.loadingModel")}
          </AccessibleText>
        </View>
      )
    }

    if (!isSupported) {
      return (
        <View style={styles.permissionCenter}>
          <AccessibleText style={{ color: colors.text, textAlign: "center" }}>
            {t(
              "currencyReader.notSupported",
              "Currency detection requires a custom dev build (Expo Go does not include TFLite)."
            )}
          </AccessibleText>
          <AccessibleButton
            title={t("common.modes")}
            onPress={() => router.push("/features")}
            style={styles.bottomButton}
          />
        </View>
      )
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={styles.camera}
          facing="back"
          ref={cameraRef}
          accessible
          accessibilityLabel={t("personCapture.liveFeedLabel")}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout
            // Use actual camera preview size for box scaling
            setPreviewSize({ width, height })
          }}
        />
        {/* DEBUG_OVERLAY: bounding boxes + probability (remove for production) */}
        <View pointerEvents="none" style={styles.debugOverlay}>
          {debugDetections.map((det, index) => {
            if (!previewSize.width || !previewSize.height) return null
            const mapped = mapBoxToPreview(det.box, previewSize, CURRENCY_MODEL_SIZE)
            const label = CURRENCY_LABELS[det.classId] ?? `Class ${det.classId}`
            return (
              <View
                key={`${det.classId}-${index}`}
                style={[
                  styles.debugBox,
                  {
                    left: mapped.left,
                    top: mapped.top,
                    width: mapped.width,
                    height: mapped.height,
                  },
                ]}
              >
                <AccessibleText style={styles.debugLabel}>
                  {label} {det.score.toFixed(2)}
                </AccessibleText>
              </View>
            )
          })}
        </View>

        {isAutoDetecting && (
          <View
            style={[styles.detectingIndicator, { backgroundColor: colors.primary }]}
            accessibilityLiveRegion="polite"
          >
            <ActivityIndicator size="small" color={colors.textInverse} />
            <AccessibleText
              style={{ color: colors.textInverse, marginLeft: 8, fontWeight: "700" }}
            >
              {t("objectDetection.scanning")}
            </AccessibleText>
          </View>
        )}

        {lastDetection !== "" && (
          <View
            style={[
              styles.resultContainer,
              {
                backgroundColor: colors.primary,
                borderColor: colors.textInverse,
                borderWidth: 2,
              },
            ]}
            accessibilityRole="alert"
          >
            <AccessibleText
              style={{
                color: colors.textInverse,
                fontSize: 32,
                textAlign: "center",
              }}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {lastDetection}
            </AccessibleText>
          </View>
        )}

        {lastDetection === "" && (lastError !== "" || lastDebug !== "") && (
          <View
            style={[
              styles.resultContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.text,
                borderWidth: 1,
              },
            ]}
            accessibilityRole="alert"
          >
            <AccessibleText
              style={{
                color: colors.text,
                fontSize: 16,
                textAlign: "center",
              }}
            >
              {lastError || t("common.error", "Error")}
            </AccessibleText>
            {lastDebug !== "" && (
              <AccessibleText
                style={{
                  color: colors.text,
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 6,
                }}
              >
                {lastDebug}
              </AccessibleText>
            )}
          </View>
        )}

        <View style={styles.toggleOverlay}>
          <AccessibleButton
            title={
              isAutoDetecting
                ? t("currencyReader.stopDetection", "Stop Detection")
                : t("currencyReader.startDetection", "Start Detection")
            }
            onPress={toggleAuto}
            accessibilityRole="switch"
            accessibilityState={{ checked: isAutoDetecting }}
            style={[
              styles.toggleButton,
              isAutoDetecting && { backgroundColor: colors.danger },
            ]}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <AccessibleText
          style={{ color: colors.textInverse, fontSize: 24, fontWeight: "800" }}
          accessibilityRole="header"
        >
          {t("welcome.currency")}
        </AccessibleText>
      </View>

      <View style={{ flex: 1 }}>{renderCamera()}</View>

      <View
        style={[
          styles.bottomBar,
          { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
        ]}
      >
        <AccessibleButton
          title={t("common.modes")}
          onPress={() => router.push("/features")}
          style={styles.bottomButton}
        />
        <AccessibleButton
          title={i18n.language === "ur" ? "اردو" : "ENG"}
          onPress={toggleLanguage}
          style={styles.bottomButton}
        />
      </View>
    </View>
  )
}

export default CurrencyReaderScreen

const styles = StyleSheet.create({
  root: { flex: 1 },

  permissionCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  topBar: {
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingTop: 30,
  },

  camera: { flex: 1 },
  // DEBUG_OVERLAY: styles for bounding box debug UI (remove for production)
  debugOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  debugBox: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "#00FF88",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  debugLabel: {
    color: "#00FF88",
    backgroundColor: "rgba(0,0,0,0.6)",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },

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

  resultContainer: {
    position: "absolute",
    top: "40%",
    left: 30,
    right: 30,
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
  },

  toggleOverlay: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  toggleButton: {
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    minWidth: 280,
    minHeight: 56,
    alignItems: "center",
  },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  bottomButton: {
    flex: 1,
    height: 80,
    borderRadius: 18,
    marginHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
})

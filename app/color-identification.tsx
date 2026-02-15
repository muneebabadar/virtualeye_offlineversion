import { AccessibleButton } from "@/components/AccessibleButton"
import { AccessibleText } from "@/components/AccessibleText"
import { useAccessibility } from "@/contexts/AccessibilityContext"
import { useAccessibleColors } from "@/hooks/useAccessibleColors"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ActivityIndicator, I18nManager, StyleSheet, View } from "react-native"
import { preprocessImage } from "@/src/utils/imageUtils"

type ColorResult = {
  name: string
  hex: string
}

const FALLBACK_COLORS = {
  background: "#000000",
  primary: "#1f2937",
  text: "#ffffff",
  textInverse: "#ffffff",
  card: "#111827",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
  disabled: "#6b7280",
}

const DOWNSAMPLE_SIZE = 32
const DETECTION_INTERVAL = 2000
const SPEECH_COOLDOWN = 2500

const toHex = (n: number) => n.toString(16).padStart(2, "0")

const BIN_COUNT = 8
const BIN_SIZE = 256 / BIN_COUNT

const dominantColor = (pixels: Float32Array): [number, number, number] => {
  const bins = new Map<number, { count: number; r: number; g: number; b: number }>()

  for (let i = 0; i < pixels.length; i += 3) {
    const r = Math.round(pixels[i] * 255)
    const g = Math.round(pixels[i + 1] * 255)
    const b = Math.round(pixels[i + 2] * 255)

    const rBin = Math.min(BIN_COUNT - 1, Math.floor(r / BIN_SIZE))
    const gBin = Math.min(BIN_COUNT - 1, Math.floor(g / BIN_SIZE))
    const bBin = Math.min(BIN_COUNT - 1, Math.floor(b / BIN_SIZE))
    const key = (rBin << 16) | (gBin << 8) | bBin

    const entry = bins.get(key)
    if (entry) {
      entry.count += 1
      entry.r += r
      entry.g += g
      entry.b += b
    } else {
      bins.set(key, { count: 1, r, g, b })
    }
  }

  let best: { count: number; r: number; g: number; b: number } | null = null
  for (const entry of bins.values()) {
    if (!best || entry.count > best.count) {
      best = entry
    }
  }

  if (!best) return [0, 0, 0]
  return [
    Math.round(best.r / best.count),
    Math.round(best.g / best.count),
    Math.round(best.b / best.count),
  ]
}

const rgbToHsl = (r: number, g: number, b: number) => {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  return { h, s, l }
}

const simpleColorName = (rgb: [number, number, number]) => {
  const [r, g, b] = rgb
  const { h, s, l } = rgbToHsl(r, g, b)

  if (s < 0.15) {
    if (l < 0.15) return "Black"
    if (l > 0.85) return "White"
    return l < 0.5 ? "Dark Gray" : "Light Gray"
  }

  let base = "Blue"
  if (h >= 345 || h < 15) base = "Red"
  else if (h < 35) base = l < 0.4 ? "Brown" : "Orange"
  else if (h < 60) base = "Yellow"
  else if (h < 150) base = "Green"
  else if (h < 200) base = "Cyan"
  else if (h < 250) base = "Blue"
  else if (h < 290) base = "Purple"
  else if (h < 345) base = "Pink"

  const shade = l < 0.35 ? "Dark" : l > 0.7 ? "Light" : ""
  return shade ? `${shade} ${base}` : base
}

const detectColorOffline = async (uri: string): Promise<ColorResult> => {
  const pixels = await preprocessImage(uri, DOWNSAMPLE_SIZE, DOWNSAMPLE_SIZE)
  const [r, g, b] = dominantColor(pixels)
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`
  const name = simpleColorName([r, g, b])

  return { name, hex }
}

const ColorIdentificationScreen = () => {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const { speak, hapticFeedback } = useAccessibility()

  const hookColors = useAccessibleColors()
  const colors = useMemo(() => hookColors ?? FALLBACK_COLORS, [hookColors])

  const [permission, requestPermission] = useCameraPermissions()
  const [isDetecting, setIsDetecting] = useState(false)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [detectedColor, setDetectedColor] = useState("")
  const [colorHex, setColorHex] = useState("")
  const [lastError, setLastError] = useState("")

  const cameraRef = useRef<CameraView>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSpokenAt = useRef(0)
  const lastSpokenKey = useRef("")

  useEffect(() => {
    speak?.(t("color.announcement", "Color Identification mode."), true)
  }, [])

  useEffect(() => {
    if (isAutoDetecting) {
      intervalRef.current = setInterval(captureColor, DETECTION_INTERVAL)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAutoDetecting])

  const speakIfNew = (name: string, hex: string) => {
    const now = Date.now()
    const key = `${name}|${hex}`
    if (key !== lastSpokenKey.current && now - lastSpokenAt.current > SPEECH_COOLDOWN) {
      lastSpokenKey.current = key
      lastSpokenAt.current = now
      hapticFeedback?.("success")
      speak?.(t("color.detected", "Detected {{color}}", { color: name }), true)
    }
  }

  const captureColor = async () => {
    if (!cameraRef.current || isDetecting) return
    setIsDetecting(true)

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.6,
        base64: false,
        exif: false,
        shutterSound: false,
        skipProcessing: true,
      })
      if (!photo?.uri) return

      const result = await detectColorOffline(photo.uri)
      setDetectedColor(result.name)
      setColorHex(result.hex)
      setLastError("")
      speakIfNew(result.name, result.hex)
    } catch {
      setLastError(t("color.failed", "Detection failed. Please try again."))
      if (!isAutoDetecting) {
        hapticFeedback?.("error")
        speak?.(t("color.failed", "Detection failed. Please try again."), true)
      }
    } finally {
      setIsDetecting(false)
    }
  }

  const toggleAutoDetection = () => {
    if (!permission?.granted) {
      hapticFeedback?.("error")
      speak?.(t("common.cameraPermissionNeeded", "Camera permission is required."), true)
      return
    }

    const next = !isAutoDetecting
    setIsAutoDetecting(next)
    hapticFeedback?.("medium")
    speak?.(
      next ? t("color.scanningStart", "Scanning started") : t("color.scanningStop", "Scanning stopped"),
      true
    )

    if (!next) {
      setDetectedColor("")
      setColorHex("")
      setLastError("")
      lastSpokenKey.current = ""
    }
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

  if (!permission?.granted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
          <AccessibleText style={[styles.topTitle, { color: colors.textInverse }]} level={1}>
            {t("color.title", "Color Identification")}
          </AccessibleText>
        </View>

        <View style={styles.permissionCenter}>
          <AccessibleText style={{ color: colors.text }}>
            {t("common.cameraPermissionNeeded", "Camera permission is required.")}
          </AccessibleText>

          <AccessibleButton
            title={t("common.allowCamera", "Allow Camera")}
            onPress={requestPermission}
            accessibilityLabel={t("common.allowCamera", "Allow Camera")}
            accessibilityHint={t("common.allowCameraHint", "Grants camera access to detect colors")}
            style={[styles.permissionButton, { borderColor: colors.text }]}
          />

          <AccessibleButton
            title={t("common.modes", "Modes")}
            onPress={() => router.push("/features")}
            style={styles.permissionButton}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <AccessibleText style={[styles.topTitle, { color: colors.textInverse }]} level={1}>
          {t("color.title", "Color Identification")}
        </AccessibleText>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />

        {isAutoDetecting && (
          <View style={[styles.detectingIndicator, { backgroundColor: colors.warning }]}>
            <ActivityIndicator size="small" color={colors.textInverse} />
            <AccessibleText style={[styles.detectingIndicatorText, { color: colors.textInverse }]}>
              {t("color.scanning", "Scanning...")}
            </AccessibleText>
          </View>
        )}

        {detectedColor !== "" && (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.colorSwatch,
                { backgroundColor: colorHex || "#000000" },
              ]}
              accessible
              accessibilityLabel={t("color.sample", "Color sample")}
            />
            <AccessibleText style={styles.resultText}>
              {detectedColor.toUpperCase()}
            </AccessibleText>
            {!!colorHex && <AccessibleText style={styles.hexText}>{colorHex}</AccessibleText>}
          </View>
        )}

        {lastError !== "" && detectedColor === "" && (
          <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
            <AccessibleText style={[styles.errorText, { color: colors.text }]}>
              {lastError}
            </AccessibleText>
          </View>
        )}

        <View style={styles.toggleOverlay}>
          <AccessibleButton
            title={
              isAutoDetecting
                ? t("common.stopDetection", "Stop Detection")
                : t("common.startDetection", "Start Detection")
            }
            onPress={toggleAutoDetection}
            disabled={false}
            style={[
              styles.toggleButton,
              isAutoDetecting && { backgroundColor: colors.danger },
            ]}
            accessibilityLabel={
              isAutoDetecting
                ? t("common.stopDetection", "Stop Detection")
                : t("common.startDetection", "Start Detection")
            }
            accessibilityHint={t("color.toggleHint", "Starts or stops automatic detection")}
          />
        </View>
      </View>

      <View
        style={[
          styles.bottomBar,
          { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
        ]}
      >
        <AccessibleButton
          title={t("common.modes", "Modes")}
          onPress={() => {
            setIsAutoDetecting(false)
            hapticFeedback?.("light")
            speak?.(t("common.goingToModes", "Navigating to modes"), true)
            router.push("/features")
          }}
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

export default ColorIdentificationScreen

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  topTitle: { fontSize: 24, fontWeight: "800" },

  cameraContainer: { flex: 1 },
  camera: { flex: 1 },

  permissionCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 220,
    alignItems: "center",
    justifyContent: "center",
  },

  detectingIndicator: {
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 8,
  },
  detectingIndicatorText: { fontSize: 14, marginLeft: 8, fontWeight: "600" },

  resultContainer: {
    position: "absolute",
    top: "35%",
    left: 30,
    right: 30,
    padding: 24,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  errorContainer: {
    position: "absolute",
    top: "35%",
    left: 30,
    right: 30,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
  },
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  resultText: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  hexText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
    color: "#CCCCCC",
  },

  toggleOverlay: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toggleButton: {
    paddingVertical: 18,
    paddingHorizontal: 44,
    borderRadius: 30,
    minWidth: 280,
    alignItems: "center",
    justifyContent: "center",
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

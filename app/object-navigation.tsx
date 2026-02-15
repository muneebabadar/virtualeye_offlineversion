// import { AccessibleButton } from "@/components/AccessibleButton"
// import { AccessibleText } from "@/components/AccessibleText"
// import { useAccessibility } from "@/contexts/AccessibilityContext"
// import { useAccessibleColors } from "@/hooks/useAccessibleColors"
// import { CameraView, useCameraPermissions } from "expo-camera"
// import { useRouter } from "expo-router"
// import { useTranslation } from "react-i18next"
// import React, { useEffect, useRef, useState } from "react"
// import {
//   ActivityIndicator,
//   I18nManager,
//   StyleSheet,
//   View,
// } from "react-native"

// import ObjectDetectionService from "@/src/services/ObjectDetectionService"
// import { preprocessImage } from "@/src/utils/imageUtils"

// /* =======================
//    CONFIG (POWER SAFE)
// ======================= */
// const IMAGE_SIZE = 640
// const DETECTION_INTERVAL = 2500
// const SPEECH_COOLDOWN = 3000

// /* =======================
//    LABEL MAP
// ======================= */
// const OBJECT_LABELS: Record<number, string> = {
//   0: "person",
//   1: "bicycle",
//   2: "car",
//   3: "motorcycle",
//   5: "bus",
//   7: "truck",
// }

// /* =======================
//    SPATIAL HELPERS
// ======================= */
// const getDirection = (box: number[]) => {
//   const centerX = (box[0] + box[2]) / 2
//   const third = IMAGE_SIZE / 3

//   if (centerX < third) return "left"
//   if (centerX > third * 2) return "right"
//   return "center"
// }

// const getDistance = (box: number[]) => {
//   const boxArea = (box[2] - box[0]) * (box[3] - box[1])
//   const imageArea = IMAGE_SIZE * IMAGE_SIZE
//   const ratio = boxArea / imageArea

//   if (ratio > 0.25) return "very close"
//   if (ratio > 0.12) return "near"
//   if (ratio > 0.05) return "medium"
//   return "far"
// }

// /* =======================
//    SCREEN
// ======================= */
// const ObjectNavigationScreen = () => {
//   const router = useRouter()
//   const { t, i18n } = useTranslation()
//   const { speak, hapticFeedback } = useAccessibility()
//   const colors = useAccessibleColors()

//   const [permission, requestPermission] = useCameraPermissions()
//   const [isDetecting, setIsDetecting] = useState(false)
//   const [isAutoDetecting, setIsAutoDetecting] = useState(false)
//   const [lastDetection, setLastDetection] = useState("")

//   const cameraRef = useRef<CameraView>(null)
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
//   const lastSpokenAt = useRef(0)

//   /* Load model once */
//   useEffect(() => {
//     speak?.(t("objectNav.announcement"), true)
//     ObjectDetectionService.load()
//   }, [i18n.language])

//   /* Auto loop */
//   useEffect(() => {
//     if (isAutoDetecting) {
//       intervalRef.current = setInterval(captureObjects, DETECTION_INTERVAL)
//     } else {
//       if (intervalRef.current) clearInterval(intervalRef.current)
//     }

//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current)
//     }
//   }, [isAutoDetecting])

//   const speakIfNew = (msg: string) => {
//     const now = Date.now()
//     if (msg !== lastDetection && now - lastSpokenAt.current > SPEECH_COOLDOWN) {
//       lastSpokenAt.current = now
//       setLastDetection(msg)
//       speak?.(msg, true)
//       hapticFeedback?.("success")
//     }
//   }

//   const captureObjects = async () => {
//     if (!cameraRef.current || isDetecting) return
//     setIsDetecting(true)

//     try {
//       const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
//       if (!photo?.uri) return

//       const input = await preprocessImage(photo.uri, IMAGE_SIZE, IMAGE_SIZE)
//       const detections = await ObjectDetectionService.detect(input, 0.25)

//       if (!detections.length) {
//         setLastDetection("")
//         return
//       }

//       const best = detections[0]
//       const label = OBJECT_LABELS[best.classId] ?? "object"
//       const direction = getDirection(best.box)
//       const distance = getDistance(best.box)

//       if (distance === "far") return // power + noise reduction

//       const message =
//         label === "person"
//           ? `Person ${direction}, ${distance}`
//           : `${label} ${direction}, ${distance}`

//       speakIfNew(message)
//     } catch {
//       // silent
//     } finally {
//       setIsDetecting(false)
//     }
//   }

//   const toggleAutoDetect = () => {
//     const next = !isAutoDetecting
//     setIsAutoDetecting(next)
//     hapticFeedback?.("medium")
//     speak?.(
//       next ? t("objectNav.started") : t("objectNav.stopped"),
//       true
//     )
//   }

//   /* Permissions */
//   if (!permission?.granted) {
//     return (
//       <View style={styles.permissionCenter}>
//         <AccessibleButton
//           title={t("objectNav.allowCamera")}
//           onPress={requestPermission}
//         />
//       </View>
//     )
//   }

//   return (
//     <View style={[styles.root, { backgroundColor: colors.background }]}>
//       <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
//         <AccessibleText
//           accessibilityRole="header"
//           style={{ color: colors.textInverse, fontSize: 24, fontWeight: "800" }}
//         >
//           {t("objectNav.title")}
//         </AccessibleText>
//       </View>

//       <View style={{ flex: 1 }}>
//         <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />

//         {isAutoDetecting && (
//           <View style={[styles.scanning, { backgroundColor: colors.primary }]}>
//             <ActivityIndicator color={colors.textInverse} />
//             <AccessibleText style={{ color: colors.textInverse }}>
//               {t("objectNav.scanning")}
//             </AccessibleText>
//           </View>
//         )}

//         {lastDetection !== "" && (
//           <View style={[styles.result, { backgroundColor: colors.primary }]}>
//             <AccessibleText
//               accessibilityRole="summary"
//               style={{ color: colors.textInverse, fontSize: 28, fontWeight: "800" }}
//             >
//               {lastDetection}
//             </AccessibleText>
//           </View>
//         )}

//         <View style={styles.toggleOverlay}>
//           <AccessibleButton
//             title={
//               isAutoDetecting
//                 ? t("objectNav.stopped")
//                 : t("objectNav.started")
//             }
//             onPress={toggleAutoDetect}
//             style={[
//               styles.toggleButton,
//               isAutoDetecting && { backgroundColor: colors.danger },
//             ]}
//           />
//         </View>
//       </View>

//       <View
//         style={[
//           styles.bottomBar,
//           { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" },
//         ]}
//       >
//         <AccessibleButton
//           title={t("common.modes")}
//           onPress={() => router.push("/features")}
//           style={styles.bottomButton}
//         />
//         <AccessibleButton
//           title={I18nManager.isRTL ? "اردو" : "ENG"}
//           onPress={() => {}}
//           style={styles.bottomButton}
//         />
//       </View>
//     </View>
//   )
// }

// export default ObjectNavigationScreen

// /* =======================
//    STYLES
// ======================= */
// const styles = StyleSheet.create({
//   root: { flex: 1 },

//   topBar: {
//     minHeight: 110,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingTop: 30,
//     borderBottomLeftRadius: 12,
//     borderBottomRightRadius: 12,
//   },

//   permissionCenter: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 20,
//   },

//   scanning: {
//     position: "absolute",
//     top: 80,
//     left: 20,
//     right: 20,
//     padding: 12,
//     borderRadius: 14,
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 10,
//   },

//   result: {
//     position: "absolute",
//     top: "40%",
//     left: 30,
//     right: 30,
//     padding: 30,
//     borderRadius: 20,
//     alignItems: "center",
//   },

//   toggleOverlay: {
//     position: "absolute",
//     bottom: 30,
//     left: 0,
//     right: 0,
//     alignItems: "center",
//   },

//   toggleButton: {
//     minWidth: 280,
//     minHeight: 56,
//     borderRadius: 30,
//     paddingVertical: 18,
//     alignItems: "center",
//   },

//   bottomBar: {
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     gap: 10,
//   },

//   bottomButton: {
//     flex: 1,
//     height: 80,
//     borderRadius: 18,
//     alignItems: "center",
//     justifyContent: "center",
//   },
// })
import { AccessibleButton } from "@/components/AccessibleButton"
import { AccessibleText } from "@/components/AccessibleText"
import { useAccessibility } from "@/contexts/AccessibilityContext"
import { useAccessibleColors } from "@/hooks/useAccessibleColors"
import { CameraView, useCameraPermissions } from "expo-camera"
import { useRouter } from "expo-router"
import React, { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { ActivityIndicator, Alert, I18nManager, NativeModules, StyleSheet, View } from "react-native"

import { preprocessImage } from "@/src/utils/imageUtils"

/* =======================
   CONFIG (POWER SAFE)
======================= */
const IMAGE_SIZE = 640
const DETECTION_INTERVAL = 2500
const SPEECH_COOLDOWN = 3000
const DEBUG_MODEL = true
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

/* =======================
   LABEL MAP
======================= */
const OBJECT_LABELS: Record<number, string> = {
  0: "person",
  1: "bicycle",
  2: "car",
  3: "motorcycle",
  5: "bus",
  7: "truck",
}

/* =======================
   SPATIAL HELPERS
======================= */
const getDirection = (box: number[]) => {
  const centerX = (box[0] + box[2]) / 2
  const third = IMAGE_SIZE / 3

  if (centerX < third) return "left"
  if (centerX > third * 2) return "right"
  return "center"
}

const getDistance = (box: number[]) => {
  const boxArea = (box[2] - box[0]) * (box[3] - box[1])
  const imageArea = IMAGE_SIZE * IMAGE_SIZE
  const ratio = boxArea / imageArea

  if (ratio > 0.25) return "very close"
  if (ratio > 0.12) return "near"
  if (ratio > 0.05) return "medium"
  return "far"
}

/* =======================
   SCREEN
======================= */
const ObjectNavigationScreen = () => {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const { speak, hapticFeedback } = useAccessibility()
  const colors = useAccessibleColors()

  const [permission, requestPermission] = useCameraPermissions()
  const [isLoadingModel, setIsLoadingModel] = useState(true)
  const [isSupported, setIsSupported] = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isAutoDetecting, setIsAutoDetecting] = useState(false)
  const [lastDetection, setLastDetection] = useState("")
  const [lastError, setLastError] = useState("")
  const [lastDebug, setLastDebug] = useState("")
  // DEBUG_OVERLAY: bounding boxes state (remove for production)
  const [previewSize, setPreviewSize] = useState({ width: 0, height: 0 })
  const [debugDetections, setDebugDetections] = useState<
    Array<{ box: number[]; score: number; classId: number }>
  >([])

  const cameraRef = useRef<CameraView>(null)
  const detectionServiceRef = useRef<{
    load: () => Promise<void>
    detect: (input: Float32Array, confidence?: number) => Promise<
      Array<{
        box: number[]
        score: number
        classId: number
      }>
    >
    runRaw: (input: Float32Array) => Promise<unknown>
  } | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastSpokenAt = useRef(0)
  const lastDebugAt = useRef(0)

  /* Lazy-load model (avoid native module crash in Expo Go) */
  useEffect(() => {
    const loadModel = async () => {
      try {
        speak?.(t("objectNav.announcement"), true)
        setIsLoadingModel(true)
        const hasTflite = !!NativeModules?.Tflite
        if (!hasTflite) {
          setIsSupported(false)
          return
        }

        const { default: ObjectDetectionService } = await import(
          "@/src/services/ObjectDetectionService"
        )
        await ObjectDetectionService.load()
        detectionServiceRef.current = ObjectDetectionService
        setLastError("")
      } catch {
        // model load failed
        Alert.alert(t("common.error"), t("objectNav.modelLoadFailed"))
        setLastError(t("objectNav.modelLoadFailed"))
      } finally {
        setIsLoadingModel(false)
      }
    }
    loadModel()
  }, [i18n.language])

  /* Auto-detection loop */
  useEffect(() => {
    if (isAutoDetecting && !isLoadingModel) {
      intervalRef.current = setInterval(captureObjects, 800)
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
  }, [isAutoDetecting, isLoadingModel])

  const speakIfNew = (msg: string) => {
    const now = Date.now()
    if (msg !== lastDetection && now - lastSpokenAt.current > SPEECH_COOLDOWN) {
      lastSpokenAt.current = now
      setLastDetection(msg)
      speak?.(msg, true)
      hapticFeedback?.("success")
    }
  }

  const captureObjects = async () => {
    if (!cameraRef.current || isDetecting || isLoadingModel) return
    if (!detectionServiceRef.current) return
    setIsDetecting(true)

    let inputTensor: Float32Array | null = null
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        shutterSound: false,
        skipProcessing: true,
      })
      if (!photo?.uri) return

      const crop = getCenterSquareCrop(photo.width, photo.height)
      inputTensor = await preprocessImage(photo.uri, IMAGE_SIZE, IMAGE_SIZE, false, crop ?? undefined)
      const detections = await detectionServiceRef.current.detect(inputTensor, MIN_CONFIDENCE)

      if (!detections.length) {
        setLastDetection("")
        // DEBUG_OVERLAY: clear boxes when nothing detected
        setDebugDetections([])
        if (DEBUG_MODEL && detectionServiceRef.current) {
          const now = Date.now()
          if (now - lastDebugAt.current > 5000) {
            lastDebugAt.current = now
            const outputs = await detectionServiceRef.current.runRaw(inputTensor)
            const debug = Array.isArray(outputs)
              ? outputs.map((o) => (o as any)?.length ?? "n/a").join(",")
              : "non-array outputs"
            setLastDebug(`outputs=[${debug}]`)
          }
        }
        return
      }

      const best = detections.reduce((a, b) => (a.score >= b.score ? a : b))
      // DEBUG_OVERLAY: draw only the best box (remove for production)
      setDebugDetections([best])
      if (DEBUG_DETECTIONS) {
        console.log("[object] preview", previewSize, "model", IMAGE_SIZE)
        console.log("[object] raw box", best.box, "score", best.score, "class", best.classId)
        if (previewSize.width && previewSize.height) {
          const mapped = mapBoxToPreview(best.box, previewSize, IMAGE_SIZE)
          console.log("[object] mapped box", mapped)
        }
      }
      const label = OBJECT_LABELS[best.classId] ?? "object"
      const direction = getDirection(best.box)
      const distance = getDistance(best.box)

      if (distance === "far") return // power + noise reduction

      const message =
        label === "person"
          ? `Person ${direction}, ${distance}`
          : `${label} ${direction}, ${distance}`

      speakIfNew(message)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("common.error", "Error")
      setLastError(message)
      if (DEBUG_MODEL && detectionServiceRef.current) {
        try {
          const now = Date.now()
          if (now - lastDebugAt.current > 5000 && inputTensor) {
            lastDebugAt.current = now
            const outputs = await detectionServiceRef.current.runRaw(inputTensor)
            const debug = Array.isArray(outputs)
              ? outputs.map((o) => (o as any)?.length ?? "n/a").join(",")
              : "non-array outputs"
            setLastDebug(`outputs=[${debug}]`)
          }
        } catch {}
      }
    } finally {
      setIsDetecting(false)
    }
  }

  const toggleAutoDetect = () => {
    const next = !isAutoDetecting
    setIsAutoDetecting(next)
    hapticFeedback?.("medium")
      speak?.(
        next ? t("objectNav.started") : t("objectNav.stopped"),
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

  /* Permissions */
  if (!permission?.granted) {
    return (
      <View style={styles.permissionCenter}>
        <AccessibleButton
          title={t("objectNav.allowCamera")}
          onPress={requestPermission}
        />
      </View>
    )
  }

  /* Show loader while model is loading */
  if (isLoadingModel) {
    return (
      <View style={[styles.permissionCenter, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <AccessibleText>Loading object detection model...</AccessibleText>
      </View>
    )
  }

  if (!isSupported) {
    return (
      <View style={[styles.permissionCenter, { backgroundColor: colors.background }]}>
        <AccessibleText style={{ color: colors.text, textAlign: "center" }}>
          {t(
            "objectNav.notSupported",
            "Object navigation requires a custom dev build (Expo Go does not include TFLite)."
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
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { backgroundColor: colors.primary }]}>
        <AccessibleText
          accessibilityRole="header"
          style={{ color: colors.textInverse, fontSize: 24, fontWeight: "800" }}
        >
          {t("objectNav.title")}
        </AccessibleText>
      </View>

      <View style={{ flex: 1 }}>
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
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
            const mapped = mapBoxToPreview(det.box, previewSize, IMAGE_SIZE)
            const label = OBJECT_LABELS[det.classId] ?? `Class ${det.classId}`
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
          <View style={[styles.scanning, { backgroundColor: colors.primary }]}>
            <ActivityIndicator color={colors.textInverse} />
            <AccessibleText style={{ color: colors.textInverse }}>
              {t("objectNav.scanning")}
            </AccessibleText>
          </View>
        )}

        {lastDetection !== "" && (
          <View style={[styles.result, { backgroundColor: colors.primary }]}>
            <AccessibleText
              accessibilityRole="summary"
              style={{ color: colors.textInverse, fontSize: 28, fontWeight: "800" }}
            >
              {lastDetection}
            </AccessibleText>
          </View>
        )}

        {lastDetection === "" && (lastError !== "" || (DEBUG_MODEL && lastDebug !== "")) && (
          <View style={[styles.result, { backgroundColor: colors.card }]}>
            <AccessibleText
              accessibilityRole="summary"
              style={{ color: colors.text, fontSize: 16, textAlign: "center" }}
            >
              {lastError || t("common.error", "Error")}
            </AccessibleText>
            {DEBUG_MODEL && lastDebug !== "" && (
              <AccessibleText
                accessibilityRole="summary"
                style={{ color: colors.text, fontSize: 14, textAlign: "center", marginTop: 6 }}
              >
                {lastDebug}
              </AccessibleText>
            )}
          </View>
        )}

        <View style={styles.toggleOverlay}>
          <AccessibleButton
            title={isAutoDetecting ? t("objectNav.stopped") : t("objectNav.started")}
            onPress={toggleAutoDetect}
            style={[styles.toggleButton, isAutoDetecting && { backgroundColor: colors.danger }]}
          />
        </View>
      </View>

      <View
        style={[styles.bottomBar, { flexDirection: I18nManager.isRTL ? "row-reverse" : "row" }]}
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

export default ObjectNavigationScreen

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    minHeight: 110,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  permissionCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  scanning: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    padding: 12,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
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
  result: {
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
    minWidth: 280,
    minHeight: 56,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  bottomButton: {
    flex: 1,
    height: 80,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
})

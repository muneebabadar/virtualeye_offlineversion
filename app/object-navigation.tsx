import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { 
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert
} from "react-native";
import * as Speech from "expo-speech";
import { detectObjects, checkApiHealth } from "../services/detectionApi";

const ObjectDetectionScreen = () => {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<string>("");
  const [apiConnected, setApiConnected] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const detectionIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (!permission) requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (isAutoDetecting && apiConnected) {
      detectionIntervalRef.current = setInterval(() => {
        captureObjects();
      }, 2000);
    } else {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [isAutoDetecting, apiConnected]);

  const checkConnection = async () => {
    const isConnected = await checkApiHealth();
    setApiConnected(isConnected);

    if (!isConnected) {
      Alert.alert(
        'API Not Connected',
        'Cannot connect to detection server. Make sure:\n' +
        '1. FastAPI server is running\n' +
        '2. Both devices are on same WiFi\n' +
        '3. IP address is correct in detectionApi.js'
      );
    }
  };

  const captureObjects = async () => {
    if (!cameraRef.current || isDetecting) return;
    if (!apiConnected) return;

    setIsDetecting(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (!photo?.uri) {
        throw new Error("Could not capture image");
      }

      const result = await detectObjects(photo.uri, 0.3);

      if (result.detections && result.detections.length > 0) {
        const best = result.detections.reduce((a: any, b: any) =>
          a.confidence > b.confidence ? a : b
        );

        const objectName = best.class || best.class || "Unknown object";

        if (lastDetection !== objectName) {
          setLastDetection(objectName);
          Speech.speak(objectName, {
            language: "en",
            pitch: 1.0,
            rate: 0.85,
          });
        }
      } else {
        if (lastDetection !== "") {
          setLastDetection("");
        }
      }
    } catch (error) {
      console.log("Detection error:", error);

      if (!isAutoDetecting) {
        Speech.speak("Detection failed");
        Alert.alert("Error", "Could not process the image");
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const toggleAuto = () => {
    if (!apiConnected) {
      Alert.alert("Error", "API not connected");
      return;
    }

    const next = !isAutoDetecting;
    setIsAutoDetecting(next);

    if (next) {
      Speech.speak("Object scanning started");
    } else {
      Speech.speak("Object scanning stopped");
      setLastDetection("");
    }
  };

  const renderCamera = () => {
    if (!permission) return <View />;

    if (!permission.granted) {
      return (
        <View style={styles.permissionCenter}>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={{ flex: 1 }}>
        <CameraView style={styles.camera} facing="back" ref={cameraRef} />

        <View style={styles.statusOverlay}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: apiConnected ? "#4CAF50" : "#F44336" },
            ]}
          />
          <Text style={styles.statusText}>
            {apiConnected ? "Connected" : "Disconnected"}
          </Text>
          <TouchableOpacity onPress={checkConnection}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        {isAutoDetecting && (
          <View style={styles.detectingIndicator}>
            <ActivityIndicator size="small" color="#f4b500" />
            <Text style={styles.detectingText}>Scanning...</Text>
          </View>
        )}

        {lastDetection !== "" && (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{lastDetection}</Text>
          </View>
        )}

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              isAutoDetecting && styles.toggleActive,
              !apiConnected && styles.toggleDisabled,
            ]}
            disabled={!apiConnected}
            onPress={toggleAuto}
          >
            <Text style={styles.toggleText}>
              {isAutoDetecting ? "⏸️ STOP" : "▶️ START"} DETECTION
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Object Detection</Text>
      </View>

      <View style={styles.cameraContainer}>{renderCamera()}</View>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            setIsAutoDetecting(false);
            router.push("/features");
          }}
        >
          <Text style={styles.bottomText}>MODES</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bottomButton}>
          <Text style={styles.bottomText}>ENG</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ObjectDetectionScreen;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020713" },
  topBar: {
    height: 120,
    backgroundColor: "#f4b500",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  title: { fontSize: 24, fontWeight: "800", color: "#000" },

  cameraContainer: { flex: 1 },
  camera: { flex: 1 },

  permissionCenter: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f4b500",
  },
  permissionText: { color: "#fff", fontSize: 16 },

  statusOverlay: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 12,
    borderRadius: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: { color: "#fff", flex: 1 },
  refreshIcon: { fontSize: 18 },

  detectingIndicator: {
    position: "absolute",
    top: 70,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "rgba(244,181,0,0.9)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  detectingText: { marginLeft: 8, fontWeight: "600", color: "#000" },

  resultBox: {
    position: "absolute",
    top: "40%",
    left: 30,
    right: 30,
    padding: 30,
    borderRadius: 20,
    backgroundColor: "rgba(244,181,0,0.95)",
    alignItems: "center",
  },
  resultText: {
    color: "#000",
    fontSize: 32,
    fontWeight: "800",
  },

  toggleContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toggleButton: {
    minWidth: 280,
    paddingVertical: 20,
    paddingHorizontal: 50,
    borderRadius: 30,
    backgroundColor: "#f4b500",
    alignItems: "center",
  },
  toggleActive: { backgroundColor: "#ff4444" },
  toggleDisabled: { backgroundColor: "#666", opacity: 0.5 },
  toggleText: { color: "#000", fontSize: 20, fontWeight: "800" },

  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#020713",
  },
  bottomButton: {
    flex: 1,
    height: 80,
    borderRadius: 18,
    marginHorizontal: 6,
    backgroundColor: "#f4b500",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomText: { fontWeight: "800", color: "#000", fontSize: 18 },
});

import { loadTensorflowModel } from 'react-native-fast-tflite'
import { nonMaxSuppression } from '../utils/mathUtils'
import { decodeYoloDetections } from '../utils/yoloDecoder'

interface Detection {
  box: number[] // [x1, y1, x2, y2]
  score: number
  classId: number
}

/**
 * ObjectDetectionService
 *
 * Loads YOLOv8 TFLite model fully offline.
 * Input: preprocessed Float32Array tensor
 * Output: bounding boxes, class IDs, and scores
 */
class ObjectDetectionService {
  private model: any = null

  async load() {
    this.model = await loadTensorflowModel(
      require('../../assets/models/yolov8n_int8.tflite')
    )
  }

  async detect(inputTensor: Float32Array, confidence = 0.3) {
    if (!this.model) {
      throw new Error('YOLO model not loaded')
    }

    // Run inference
    const outputs = await this.model.run([inputTensor])
    if (!outputs || (Array.isArray(outputs) && outputs.length === 0)) {
      throw new Error('YOLO model returned no outputs')
    }

    const first = (outputs as any)[0] as Float32Array | undefined
    if (first && first.length) {
      const detections = decodeYoloDetections(first, 640, confidence)
      return nonMaxSuppression(detections)
    }

    // Expecting YOLO outputs: [boxes, scores, classes]
    const [boxes, scores, classes] = outputs as [Float32Array, Float32Array, Float32Array]
    if (!boxes || !scores || !classes) {
      throw new Error('YOLO outputs missing expected tensors')
    }

    const detections: Detection[] = []

    for (let i = 0; i < scores.length; i++) {
      if (scores[i] >= confidence) {
        detections.push({
          box: Array.from(boxes.slice(i * 4, i * 4 + 4)),
          score: scores[i],
          classId: classes[i],
        })
      }
    }

    return nonMaxSuppression(detections)
  }

  async runRaw(inputTensor: Float32Array) {
    if (!this.model) {
      throw new Error('YOLO model not loaded')
    }
    return this.model.run([inputTensor])
  }
}

export default new ObjectDetectionService()

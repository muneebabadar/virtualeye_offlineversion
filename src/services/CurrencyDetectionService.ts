import { loadTensorflowModel } from 'react-native-fast-tflite'
import { nonMaxSuppression } from '../utils/mathUtils'
import { decodeYoloDetections } from '../utils/yoloDecoder'
/**
 * CurrencyDetectionService
 *
 * Runs an INT8 TFLite currency classifier fully offline.
 * Input: preprocessed Float32Array tensor
 * Output: predicted currency + confidence
 */
class CurrencyDetectionService {
  private model: any = null

  async load() {
    this.model = await loadTensorflowModel(
      require('../../assets/models/currency_best_float32.tflite')
    )
  }

  /**
   * Detect currency from image tensor (YOLO-style detection)
   */
  async detect(inputTensor: Float32Array, confidence = 0.25) {
    if (!this.model) {
      throw new Error('Currency model not loaded')
    }

    // Run inference
    const outputs = await this.model.run([inputTensor])
    const first = (outputs as any)[0] as Float32Array | undefined
    if (!first || first.length === 0) {
      throw new Error('Currency model returned no outputs')
    }

    const detections = decodeYoloDetections(first, 416, confidence)
    return nonMaxSuppression(detections)
  }

  async runRaw(inputTensor: Float32Array) {
    if (!this.model) {
      throw new Error('Currency model not loaded')
    }
    return this.model.run([inputTensor])
  }
}

export default new CurrencyDetectionService()

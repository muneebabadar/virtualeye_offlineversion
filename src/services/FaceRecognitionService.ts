import { loadTensorflowModel } from 'react-native-fast-tflite'
import { l2Distance } from '../utils/mathUtils'
import DatabaseService from './DatabaseService'

interface FaceEntry {
  id: string
  name: string
  embedding: number[]
}

class FaceRecognitionService {
  private model: any = null

  /** Load the TFLite FaceNet model */
  async load() {
    this.model = await loadTensorflowModel({
      url: 'mobilefacenet.tflite', // add to assets/models if you enable face recognition
    })
  }

  /** Get embedding vector (usually 128-D) from image tensor */
  async getEmbedding(inputTensor: Float32Array): Promise<Float32Array> {
    if (!this.model) throw new Error('Face model not loaded')

    const output = await this.model.run([inputTensor])
    const embedding = output[0] as Float32Array
    return embedding
  }

  /** Compare embedding with saved faces and return best match */
  async recognizeFace(embedding: Float32Array): Promise<FaceEntry | null> {
    const faces: FaceEntry[] = DatabaseService.getAllFaces()

    let bestMatch: FaceEntry | null = null
    let minDistance = Infinity

    for (const face of faces) {
      // Convert saved embedding (number[]) to Float32Array
      const faceEmbedding = new Float32Array(face.embedding)
      const dist = l2Distance(embedding, faceEmbedding)
      if (dist < minDistance) {
        minDistance = dist
        bestMatch = face
      }
    }

    return minDistance < 1.0 ? bestMatch : null
  }
}

export default new FaceRecognitionService()

import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV()

class DatabaseService {
  saveFace(name: string, embedding: Float32Array) {
    const data = {
      name,
      embedding: Array.from(embedding),
    }

    storage.set(`face:${name}`, JSON.stringify(data))
  }

  savePersonProfile(name: string, imageUris: string[]) {
    const data = {
      name,
      imageUris,
      savedAt: Date.now(),
    }

    storage.set(`person:${name}`, JSON.stringify(data))
  }

  getAllPersonProfiles() {
    const keys = storage.getAllKeys()
    return keys
      .filter(k => k.startsWith('person:'))
      .map(k => JSON.parse(storage.getString(k)!))
  }

  getAllFaces() {
    const keys = storage.getAllKeys()
    return keys
      .filter(k => k.startsWith('face:'))
      .map(k => JSON.parse(storage.getString(k)!))
  }
}

export default new DatabaseService()

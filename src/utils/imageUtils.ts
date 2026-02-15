/**
 * imageUtils.ts
 *
 * All image preprocessing logic lives here.
 * This replaces Python + OpenCV + NumPy preprocessing.
 */

import * as ImageManipulator from 'expo-image-manipulator'
import jpeg from 'jpeg-js'

/**
 * Resize image to model input size and return raw pixel data
 * Works for YOLO, FaceNet, currency model, etc.
 */
export async function preprocessImage(
  uri: string,
  width: number,
  height: number,
  normalize = true,
  crop?: { originX: number; originY: number; width: number; height: number }
): Promise<Float32Array> {
  // 1. Crop (optional) then resize image to model input
  const actions: ImageManipulator.Action[] = []
  if (crop) {
    actions.push({
      crop: {
        originX: Math.max(0, Math.floor(crop.originX)),
        originY: Math.max(0, Math.floor(crop.originY)),
        width: Math.max(1, Math.floor(crop.width)),
        height: Math.max(1, Math.floor(crop.height)),
      },
    })
  }
  actions.push({ resize: { width, height } })

  let resized: ImageManipulator.ImageResult
  try {
    resized = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      { format: ImageManipulator.SaveFormat.JPEG, base64: true }
    )
  } catch (err) {
    // If crop bounds are invalid for a given device/rotation, retry without crop.
    if (crop) {
      resized = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width, height } }],
        { format: ImageManipulator.SaveFormat.JPEG, base64: true }
      )
    } else {
      throw err
    }
  }

  // 2. Read pixels (Expo gives base64)
  const base64 = resized.base64
  if (!base64) {
    throw new Error('Failed to read image pixels')
  }

  const raw = base64ToUint8(base64)
  const decoded = jpeg.decode(raw, { useTArray: true })
  if (!decoded?.data) {
    throw new Error('Failed to decode image')
  }

  // 3. Convert RGBA -> RGB then normalize (optional)
  const rgb = rgbaToRgb(decoded.data as Uint8Array)
  if (!normalize) {
    const out = new Float32Array(rgb.length)
    for (let i = 0; i < rgb.length; i++) {
      out[i] = rgb[i]
    }
    return out
  }
  return normalizeRGB(rgb)
}

/**
 * Convert base64 string to Uint8Array
 */
function base64ToUint8(base64: string): Uint8Array {
  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  // Hermes-safe fallback
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '')
  const len = cleaned.length
  const padding = cleaned.endsWith('==') ? 2 : cleaned.endsWith('=') ? 1 : 0
  const outLen = (len * 3) / 4 - padding
  const bytes = new Uint8Array(outLen)

  let buffer = 0
  let bits = 0
  let index = 0

  for (let i = 0; i < len; i++) {
    const c = cleaned[i]
    if (c === '=') break
    const value = alphabet.indexOf(c)
    if (value < 0) continue
    buffer = (buffer << 6) | value
    bits += 6
    if (bits >= 8) {
      bits -= 8
      bytes[index++] = (buffer >> bits) & 0xff
    }
  }

  return bytes
}

/**
 * Normalize RGB pixels to Float32Array
 * Input: Uint8Array [0–255]
 * Output: Float32Array [0–1]
 */
export function normalizeRGB(pixels: Uint8Array): Float32Array {
  const output = new Float32Array(pixels.length)

  for (let i = 0; i < pixels.length; i++) {
    output[i] = pixels[i] / 255.0
  }

  return output
}

/**
 * Convert RGBA → RGB (if camera gives RGBA)
 */
export function rgbaToRgb(rgba: Uint8Array): Uint8Array {
  const rgb = new Uint8Array((rgba.length / 4) * 3)

  let j = 0
  for (let i = 0; i < rgba.length; i += 4) {
    rgb[j++] = rgba[i]
    rgb[j++] = rgba[i + 1]
    rgb[j++] = rgba[i + 2]
  }

  return rgb
}

/**
 * Convert image to FaceNet input
 * FaceNet expects normalized [-1, 1]
 */
export function normalizeFaceNet(pixels: Uint8Array): Float32Array {
  const output = new Float32Array(pixels.length)

  for (let i = 0; i < pixels.length; i++) {
    output[i] = (pixels[i] - 127.5) / 128.0
  }

  return output
}

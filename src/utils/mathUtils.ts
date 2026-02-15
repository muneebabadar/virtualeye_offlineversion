interface Detection {
  box: number[] // [x1, y1, x2, y2]
  score: number
  classId: number
}

/**
 * Compute Intersection over Union (IoU) between two boxes
 */
function iou(boxA: number[], boxB: number[]) {
  const x1 = Math.max(boxA[0], boxB[0])
  const y1 = Math.max(boxA[1], boxB[1])
  const x2 = Math.min(boxA[2], boxB[2])
  const y2 = Math.min(boxA[3], boxB[3])

  const w = Math.max(0, x2 - x1)
  const h = Math.max(0, y2 - y1)
  const intersection = w * h

  const areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
  const areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])

  const union = areaA + areaB - intersection
  return union > 0 ? intersection / union : 0
}

/**
 * Non-Max Suppression
 *
 * Keeps the best boxes by removing overlapping ones
 */
export function nonMaxSuppression(
  detections: Detection[],
  iouThreshold = 0.5
) {
  // Sort by score descending
  detections.sort((a, b) => b.score - a.score)

  const results: Detection[] = []

  while (detections.length > 0) {
    const best = detections.shift()!
    results.push(best)

    // Remove boxes with high overlap
    detections = detections.filter(
      det => det.classId !== best.classId || iou(det.box, best.box) < iouThreshold
    )
  }

  return results
}

/**
 * Optional: L2 distance function for face embeddings / other use
 */
export function l2Distance(a: Float32Array, b: Float32Array) {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i]
    sum += diff * diff
  }
  return Math.sqrt(sum)
}
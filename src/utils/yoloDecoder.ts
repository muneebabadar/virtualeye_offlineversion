export type YoloDetection = {
  box: number[] // [x1, y1, x2, y2]
  score: number
  classId: number
}

type Layout = "pred_first" | "feat_first"

const PRED_CANDIDATES = [8400, 3549, 25200, 10647, 6300, 2100]

function pickPredCount(len: number) {
  for (const pred of PRED_CANDIDATES) {
    if (len % pred === 0) {
      const feat = len / pred
      if (feat >= 6 && feat <= 200) return { pred, feat }
    }
  }
  // Fallback: try feature=84 (YOLOv8 80 classes)
  if (len % 84 === 0) return { pred: len / 84, feat: 84 }
  return null
}

function getVal(
  data: Float32Array,
  pred: number,
  feat: number,
  predCount: number,
  featCount: number,
  layout: Layout
) {
  const idx =
    layout === "pred_first"
      ? pred * featCount + feat
      : feat * predCount + pred
  return data[idx]
}

function pickLayout(
  data: Float32Array,
  predCount: number,
  featCount: number,
  inputSize: number
): Layout {
  const samples = Math.min(50, predCount)
  const scoreLayout = (layout: Layout) => {
    let ok = 0
    for (let i = 0; i < samples; i++) {
      const x = getVal(data, i, 0, predCount, featCount, layout)
      const y = getVal(data, i, 1, predCount, featCount, layout)
      const w = getVal(data, i, 2, predCount, featCount, layout)
      const h = getVal(data, i, 3, predCount, featCount, layout)
      const vals = [x, y, w, h]
      if (vals.every(v => Number.isFinite(v))) {
        const maxVal = Math.max(...vals)
        if (maxVal <= inputSize * 2 || maxVal <= 2) ok++
      }
    }
    return ok
  }

  const a = scoreLayout("pred_first")
  const b = scoreLayout("feat_first")
  return a >= b ? "pred_first" : "feat_first"
}

export function decodeYoloDetections(
  output: Float32Array,
  inputSize: number,
  confidence = 0.25
): YoloDetection[] {
  const meta = pickPredCount(output.length)
  if (!meta) {
    throw new Error(`Unsupported YOLO output length=${output.length}`)
  }

  const { pred: predCount, feat: featCount } = meta
  const layout = pickLayout(output, predCount, featCount, inputSize)

  const detections: YoloDetection[] = []
  const classCount = Math.max(0, featCount - 4)

  for (let i = 0; i < predCount; i++) {
    const cx = getVal(output, i, 0, predCount, featCount, layout)
    const cy = getVal(output, i, 1, predCount, featCount, layout)
    const w = getVal(output, i, 2, predCount, featCount, layout)
    const h = getVal(output, i, 3, predCount, featCount, layout)

    if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(w) || !Number.isFinite(h)) {
      continue
    }

    let scale = 1
    if (Math.max(cx, cy, w, h) <= 2) {
      // normalized 0..1
      scale = inputSize
    }

    const x1 = (cx - w / 2) * scale
    const y1 = (cy - h / 2) * scale
    const x2 = (cx + w / 2) * scale
    const y2 = (cy + h / 2) * scale

    let bestScore = 0
    let bestClass = 0

    for (let c = 0; c < classCount; c++) {
      const score = getVal(output, i, 4 + c, predCount, featCount, layout)
      if (score > bestScore) {
        bestScore = score
        bestClass = c
      }
    }

    if (bestScore >= confidence) {
      detections.push({
        box: [x1, y1, x2, y2],
        score: bestScore,
        classId: bestClass,
      })
    }
  }

  return detections
}

export interface Segment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Net {
  id: string
  segments: Segment[]
  junctions: { x: number; y: number }[]
}

export type BodyKind =
  | 'ff'
  | 'mux'
  | 'terminal'
  | 'led-q'
  | 'led-serial'
  | 'arduino'
  | 'resistor'
  | 'led-fisico'
  | 'switch'
  | 'pulsador'

export interface Body {
  id: string
  kind: BodyKind
  rect: Rect
}

export interface LabelSpec {
  id: string
  x: number
  y: number
  text: string
  anchor: 'start' | 'middle' | 'end'
  fontSize: number
  inside?: string
  bind?: string
}

export interface Geometry {
  width: number
  height: number
  bodies: Body[]
  nets: Net[]
  labels: LabelSpec[]
}

export const CHAR_W_RATIO = 0.62
export const MIN_COLLINEAR_GAP = 20

export function labelBox(l: LabelSpec): Rect {
  const w = l.text.length * l.fontSize * CHAR_W_RATIO
  const h = l.fontSize
  const x = l.anchor === 'start' ? l.x : l.anchor === 'middle' ? l.x - w / 2 : l.x - w
  const y = l.y - 0.8 * l.fontSize
  return { x, y, w, h }
}

export function isOrthogonal(s: Segment): boolean {
  const horizontal = s.y1 === s.y2 && s.x1 !== s.x2
  const vertical = s.x1 === s.x2 && s.y1 !== s.y2
  return horizontal || vertical
}

function isHorizontal(s: Segment): boolean {
  return s.y1 === s.y2 && s.x1 !== s.x2
}

function isVertical(s: Segment): boolean {
  return s.x1 === s.x2 && s.y1 !== s.y2
}

export function collinearOverlap(a: Segment, b: Segment): number {
  if (isHorizontal(a) && isHorizontal(b) && a.y1 === b.y1) {
    const aMin = Math.min(a.x1, a.x2)
    const aMax = Math.max(a.x1, a.x2)
    const bMin = Math.min(b.x1, b.x2)
    const bMax = Math.max(b.x1, b.x2)
    return Math.min(aMax, bMax) - Math.max(aMin, bMin)
  }
  if (isVertical(a) && isVertical(b) && a.x1 === b.x1) {
    const aMin = Math.min(a.y1, a.y2)
    const aMax = Math.max(a.y1, a.y2)
    const bMin = Math.min(b.y1, b.y2)
    const bMax = Math.max(b.y1, b.y2)
    return Math.min(aMax, bMax) - Math.max(aMin, bMin)
  }
  return 0
}

export function collinearGap(a: Segment, b: Segment): number {
  const sameLine =
    (isHorizontal(a) && isHorizontal(b) && a.y1 === b.y1) || (isVertical(a) && isVertical(b) && a.x1 === b.x1)
  if (!sameLine) return Infinity
  const overlap = collinearOverlap(a, b)
  if (overlap > 0) return Infinity
  return -overlap
}

export function segmentEntersRectInterior(s: Segment, r: Rect): boolean {
  if (isHorizontal(s)) {
    if (!(r.y < s.y1 && s.y1 < r.y + r.h)) return false
    const minX = Math.min(s.x1, s.x2)
    const maxX = Math.max(s.x1, s.x2)
    const lo = Math.max(minX, r.x)
    const hi = Math.min(maxX, r.x + r.w)
    return hi - lo > 0
  }
  if (isVertical(s)) {
    if (!(r.x < s.x1 && s.x1 < r.x + r.w)) return false
    const minY = Math.min(s.y1, s.y2)
    const maxY = Math.max(s.y1, s.y2)
    const lo = Math.max(minY, r.y)
    const hi = Math.min(maxY, r.y + r.h)
    return hi - lo > 0
  }
  return false
}

export function segmentTouchesRect(s: Segment, r: Rect): boolean {
  if (isHorizontal(s)) {
    if (!(r.y <= s.y1 && s.y1 <= r.y + r.h)) return false
    const minX = Math.min(s.x1, s.x2)
    const maxX = Math.max(s.x1, s.x2)
    return minX <= r.x + r.w && maxX >= r.x
  }
  if (isVertical(s)) {
    if (!(r.x <= s.x1 && s.x1 <= r.x + r.w)) return false
    const minY = Math.min(s.y1, s.y2)
    const maxY = Math.max(s.y1, s.y2)
    return minY <= r.y + r.h && maxY >= r.y
  }
  return false
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

export function rectInside(a: Rect, b: Rect): boolean {
  return b.x <= a.x && a.x + a.w <= b.x + b.w && b.y <= a.y && a.y + a.h <= b.y + b.h
}

function rectFromPoint(x: number, y: number): Rect {
  return { x, y, w: 0, h: 0 }
}

export function validateGeometry(g: Geometry): string[] {
  const problemas: string[] = []
  const viewport: Rect = { x: 0, y: 0, w: g.width, h: g.height }

  const dentroDelViewport = (r: Rect) => rectInside(r, viewport)

  // V1: todo segmento es ortogonal
  for (const net of g.nets) {
    for (const seg of net.segments) {
      if (!isOrthogonal(seg)) {
        problemas.push(`V1: la red "${net.id}" tiene un segmento no ortogonal (${seg.x1},${seg.y1})-(${seg.x2},${seg.y2})`)
      }
    }
  }

  // V2 y V3: segmentos de redes distintas
  for (let i = 0; i < g.nets.length; i += 1) {
    for (let j = i + 1; j < g.nets.length; j += 1) {
      const netA = g.nets[i]
      const netB = g.nets[j]
      for (const segA of netA.segments) {
        for (const segB of netB.segments) {
          const overlap = collinearOverlap(segA, segB)
          if (overlap > 0) {
            problemas.push(`V2: las redes "${netA.id}" y "${netB.id}" tienen segmentos superpuestos`)
            continue
          }
          const gap = collinearGap(segA, segB)
          if (gap < MIN_COLLINEAR_GAP) {
            problemas.push(`V3: las redes "${netA.id}" y "${netB.id}" tienen un hueco colineal de ${gap} (< ${MIN_COLLINEAR_GAP})`)
          }
        }
      }
    }
  }

  // V4: ningún segmento entra al interior de ningún cuerpo
  for (const net of g.nets) {
    for (const seg of net.segments) {
      for (const body of g.bodies) {
        if (segmentEntersRectInterior(seg, body.rect)) {
          problemas.push(`V4: la red "${net.id}" atraviesa el cuerpo "${body.id}"`)
        }
      }
    }
  }

  // V5: extremos de segmento, cuerpos y labelBox dentro de [0,width]x[0,height]
  for (const net of g.nets) {
    for (const seg of net.segments) {
      if (!dentroDelViewport(rectFromPoint(seg.x1, seg.y1)) || !dentroDelViewport(rectFromPoint(seg.x2, seg.y2))) {
        problemas.push(`V5: la red "${net.id}" tiene un extremo fuera del viewBox`)
      }
    }
  }
  for (const body of g.bodies) {
    if (!dentroDelViewport(body.rect)) {
      problemas.push(`V5: el cuerpo "${body.id}" está fuera del viewBox`)
    }
  }
  for (const label of g.labels) {
    if (!dentroDelViewport(labelBox(label))) {
      problemas.push(`V5: la etiqueta "${label.id}" está fuera del viewBox`)
    }
  }

  // V6: etiquetas dentro o fuera de cuerpos, y sin tocar cables
  for (const label of g.labels) {
    const box = labelBox(label)
    if (label.inside) {
      const cuerpo = g.bodies.find((b) => b.id === label.inside)
      if (!cuerpo || !rectInside(box, cuerpo.rect)) {
        problemas.push(`V6: la etiqueta "${label.id}" no está contenida en el cuerpo "${label.inside}"`)
      }
    } else {
      for (const body of g.bodies) {
        if (rectsIntersect(box, body.rect)) {
          problemas.push(`V6: la etiqueta "${label.id}" se cruza con el cuerpo "${body.id}"`)
        }
      }
      for (const net of g.nets) {
        for (const seg of net.segments) {
          if (segmentTouchesRect(seg, box)) {
            problemas.push(`V6: la etiqueta "${label.id}" toca la red "${net.id}"`)
          }
        }
      }
    }
  }

  // V7: etiquetas entre sí
  for (let i = 0; i < g.labels.length; i += 1) {
    for (let j = i + 1; j < g.labels.length; j += 1) {
      if (rectsIntersect(labelBox(g.labels[i]), labelBox(g.labels[j]))) {
        problemas.push(`V7: las etiquetas "${g.labels[i].id}" y "${g.labels[j].id}" se encima`)
      }
    }
  }

  return problemas
}

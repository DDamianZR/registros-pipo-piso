import { describe, expect, it } from 'vitest'
import { labelBox, validateGeometry } from './geometry'
import type { Geometry, LabelSpec } from './geometry'

describe('labelBox', () => {
  it('GEO-01 produce las cajas esperadas para start, middle y end', () => {
    const base = { id: 'l', x: 100, y: 50, text: 'abcd', fontSize: 10 } as const

    const start: LabelSpec = { ...base, anchor: 'start' }
    expect(labelBox(start)).toEqual({ x: 100, y: 42, w: 24.8, h: 10 })

    const middle: LabelSpec = { ...base, anchor: 'middle' }
    expect(labelBox(middle)).toEqual({ x: 87.6, y: 42, w: 24.8, h: 10 })

    const end: LabelSpec = { ...base, anchor: 'end' }
    expect(labelBox(end)).toEqual({ x: 75.2, y: 42, w: 24.8, h: 10 })
  })
})

describe('validateGeometry', () => {
  it('GEO-02a detecta un segmento diagonal (V1)', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [],
      labels: [],
      nets: [{ id: 'n1', segments: [{ x1: 0, y1: 0, x2: 10, y2: 10 }], junctions: [] }],
    }
    expect(validateGeometry(g).some((m) => m.startsWith('V1:'))).toBe(true)
  })

  it('GEO-02b detecta dos horizontales encimados de redes distintas (V2)', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [],
      labels: [],
      nets: [
        { id: 'a', segments: [{ x1: 0, y1: 10, x2: 50, y2: 10 }], junctions: [] },
        { id: 'b', segments: [{ x1: 20, y1: 10, x2: 70, y2: 10 }], junctions: [] },
      ],
    }
    expect(validateGeometry(g).some((m) => m.startsWith('V2:'))).toBe(true)
  })

  it('GEO-02c detecta un hueco colineal de 10 (V3)', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [],
      labels: [],
      nets: [
        { id: 'a', segments: [{ x1: 0, y1: 10, x2: 20, y2: 10 }], junctions: [] },
        { id: 'b', segments: [{ x1: 30, y1: 10, x2: 50, y2: 10 }], junctions: [] },
      ],
    }
    expect(validateGeometry(g).some((m) => m.startsWith('V3:'))).toBe(true)
  })

  it('GEO-02d detecta un segmento que atraviesa un cuerpo (V4)', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [{ id: 'c1', kind: 'ff', rect: { x: 40, y: 0, w: 20, h: 20 } }],
      labels: [],
      nets: [{ id: 'a', segments: [{ x1: 0, y1: 10, x2: 100, y2: 10 }], junctions: [] }],
    }
    expect(validateGeometry(g).some((m) => m.startsWith('V4:'))).toBe(true)
  })

  it('GEO-02e detecta una etiqueta fuera del viewBox (V5)', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [],
      nets: [],
      labels: [{ id: 'l1', x: 200, y: 200, text: 'x', anchor: 'start', fontSize: 10 }],
    }
    expect(validateGeometry(g).some((m) => m.startsWith('V5:'))).toBe(true)
  })

  it('GEO-02f detecta una etiqueta sobre un cable (V6)', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [],
      nets: [{ id: 'a', segments: [{ x1: 0, y1: 50, x2: 100, y2: 50 }], junctions: [] }],
      labels: [{ id: 'l1', x: 40, y: 50, text: 'ab', anchor: 'start', fontSize: 10 }],
    }
    expect(validateGeometry(g).some((m) => m.startsWith('V6:'))).toBe(true)
  })

  it('GEO-02g detecta dos etiquetas encimadas (V7)', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [],
      nets: [],
      labels: [
        { id: 'l1', x: 10, y: 10, text: 'ab', anchor: 'start', fontSize: 10 },
        { id: 'l2', x: 12, y: 10, text: 'ab', anchor: 'start', fontSize: 10 },
      ],
    }
    expect(validateGeometry(g).some((m) => m.startsWith('V7:'))).toBe(true)
  })

  it('GEO-03 un cable que termina en el borde de un cuerpo no es un problema', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [{ id: 'c1', kind: 'ff', rect: { x: 40, y: 0, w: 20, h: 20 } }],
      labels: [],
      nets: [{ id: 'a', segments: [{ x1: 40, y1: 0, x2: 40, y2: 30 }], junctions: [] }],
    }
    expect(validateGeometry(g)).toEqual([])
  })

  it('GEO-04 un cruce perpendicular entre redes distintas no es un problema', () => {
    const g: Geometry = {
      width: 100,
      height: 100,
      bodies: [],
      labels: [],
      nets: [
        { id: 'a', segments: [{ x1: 0, y1: 10, x2: 100, y2: 10 }], junctions: [] },
        { id: 'b', segments: [{ x1: 50, y1: 0, x2: 50, y2: 50 }], junctions: [] },
      ],
    }
    expect(validateGeometry(g)).toEqual([])
  })
})

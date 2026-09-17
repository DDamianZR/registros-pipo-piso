import { bitAt } from '../../logic/bits'
import { muxOutputs } from '../../logic/registers'
import type { SimState } from '../../logic/simulator'
import type { Body, Geometry, LabelSpec, Net, Segment } from '../geometry/geometry'

export const STAGE_W = 200
export const MARGIN_L = 120
export const FF_W = 110
export const FF_H = 90
export const FF_TOP = 190

export const STAGES = [3, 2, 1, 0] as const

export const BUS_X_START = 40
export const BUS_X_END = 860

export function ffX(i: number): number {
  return MARGIN_L + (3 - i) * STAGE_W
}

function ffBody(i: number): Body {
  return { id: `ff${i}`, kind: 'ff', rect: { x: ffX(i), y: FF_TOP, w: FF_W, h: FF_H } }
}

function ffLabels(i: number): LabelSpec[] {
  const x0 = ffX(i)
  return [
    { id: `ff${i}-d`, x: x0 + 8, y: 218, text: 'D', anchor: 'start', fontSize: 10, inside: `ff${i}` },
    { id: `ff${i}-q`, x: x0 + 102, y: 218, text: 'Q', anchor: 'end', fontSize: 10, inside: `ff${i}` },
    {
      id: `ff${i}-bit`,
      x: x0 + 55,
      y: 244,
      text: '0',
      anchor: 'middle',
      fontSize: 26,
      inside: `ff${i}`,
      bind: `q${i}`,
    },
    { id: `ff${i}-clr`, x: x0 + 55, y: 274, text: 'CLR', anchor: 'middle', fontSize: 9, inside: `ff${i}` },
    { id: `ff${i}-nombre`, x: x0 + 55, y: 182, text: `FF${i}`, anchor: 'middle', fontSize: 11 },
  ]
}

function clkNet(): Net {
  const segments: Segment[] = [{ x1: BUS_X_START, y1: 330, x2: BUS_X_END, y2: 330 }]
  const junctions: { x: number; y: number }[] = []
  for (const i of STAGES) {
    const x0 = ffX(i)
    segments.push({ x1: x0 - 12, y1: 330, x2: x0 - 12, y2: 256 })
    segments.push({ x1: x0 - 12, y1: 256, x2: x0, y2: 256 })
    junctions.push({ x: x0 - 12, y: 330 })
  }
  return { id: 'clk', segments, junctions }
}

function clrNet(): Net {
  const segments: Segment[] = [{ x1: BUS_X_START, y1: 355, x2: BUS_X_END, y2: 355 }]
  const junctions: { x: number; y: number }[] = []
  for (const i of STAGES) {
    const x0 = ffX(i)
    segments.push({ x1: x0 + 55, y1: 355, x2: x0 + 55, y2: 280 })
    junctions.push({ x: x0 + 55, y: 355 })
  }
  return { id: 'clr', segments, junctions }
}

function busLabels(): LabelSpec[] {
  return [
    { id: 'clk-etiqueta', x: 40, y: 322, text: 'CLK', anchor: 'start', fontSize: 11 },
    { id: 'clr-etiqueta', x: 40, y: 371, text: 'CLR', anchor: 'start', fontSize: 11 },
  ]
}

// --- PIPO ---------------------------------------------------------------

function termDBodyPipo(i: number): Body {
  const x0 = ffX(i)
  return { id: `termD${i}`, kind: 'terminal', rect: { x: x0 - 56, y: 30, w: 32, h: 22 } }
}

function termDLabelsPipo(i: number): LabelSpec[] {
  const x0 = ffX(i)
  return [
    { id: `termD${i}-nombre`, x: x0 - 40, y: 24, text: `D${i}`, anchor: 'middle', fontSize: 11 },
    {
      id: `termD${i}-valor`,
      x: x0 - 40,
      y: 46,
      text: '0',
      anchor: 'middle',
      fontSize: 12,
      inside: `termD${i}`,
      bind: `d${i}`,
    },
  ]
}

function ledQBody(i: number): Body {
  const x0 = ffX(i)
  return { id: `ledQ${i}`, kind: 'led-q', rect: { x: x0 + 116, y: 281, w: 18, h: 18 } }
}

function ledQLabel(i: number): LabelSpec {
  const x0 = ffX(i)
  return { id: `ledQ${i}-etiqueta`, x: x0 + 111, y: 294, text: `Q${i}`, anchor: 'end', fontSize: 11 }
}

function dNetPipo(i: number): Net {
  const x0 = ffX(i)
  return {
    id: `d${i}`,
    segments: [
      { x1: x0 - 40, y1: 52, x2: x0 - 40, y2: 214 },
      { x1: x0 - 40, y1: 214, x2: x0, y2: 214 },
    ],
    junctions: [],
  }
}

function qNetPipo(i: number): Net {
  const x0 = ffX(i)
  return {
    id: `q${i}`,
    segments: [
      { x1: x0 + 110, y1: 214, x2: x0 + 125, y2: 214 },
      { x1: x0 + 125, y1: 214, x2: x0 + 125, y2: 281 },
    ],
    junctions: [],
  }
}

export function buildPipoGeometry(): Geometry {
  const bodies: Body[] = []
  const nets: Net[] = []
  const labels: LabelSpec[] = []

  for (const i of STAGES) {
    bodies.push(ffBody(i), termDBodyPipo(i), ledQBody(i))
    labels.push(...ffLabels(i), ...termDLabelsPipo(i), ledQLabel(i))
    nets.push(dNetPipo(i), qNetPipo(i))
  }

  nets.push(clkNet(), clrNet())
  labels.push(
    ...busLabels(),
    {
      id: 'leyenda',
      x: 40,
      y: 405,
      text: 'Carga paralela · salida paralela · reloj común · cruce sin punto = sin conexión',
      anchor: 'start',
      fontSize: 11,
    },
  )

  return { width: 960, height: 420, bodies, nets, labels }
}

// --- PISO ---------------------------------------------------------------

function muxBody(i: number): Body {
  const x0 = ffX(i)
  return { id: `mux${i}`, kind: 'mux', rect: { x: x0 - 66, y: 190, w: 40, h: 48 } }
}

function muxLabels(i: number): LabelSpec[] {
  const x0 = ffX(i)
  return [
    { id: `mux${i}-0`, x: x0 - 63, y: 205, text: '0', anchor: 'start', fontSize: 8, inside: `mux${i}` },
    { id: `mux${i}-1`, x: x0 - 63, y: 229, text: '1', anchor: 'start', fontSize: 8, inside: `mux${i}` },
    { id: `mux${i}-nombre`, x: x0 - 46, y: 218, text: 'MUX', anchor: 'middle', fontSize: 8, inside: `mux${i}` },
  ]
}

function muxValueLabel(i: number): LabelSpec {
  const x0 = ffX(i)
  return { id: `mux${i}-valor`, x: x0 - 13, y: 208, text: '0', anchor: 'middle', fontSize: 9, bind: `mux${i}` }
}

function termDBodyPiso(i: number): Body {
  const x0 = ffX(i)
  return { id: `termD${i}`, kind: 'terminal', rect: { x: x0 - 90, y: 30, w: 32, h: 22 } }
}

function termDLabelsPiso(i: number): LabelSpec[] {
  const x0 = ffX(i)
  return [
    { id: `termD${i}-nombre`, x: x0 - 74, y: 24, text: `D${i}`, anchor: 'middle', fontSize: 11 },
    {
      id: `termD${i}-valor`,
      x: x0 - 74,
      y: 46,
      text: '0',
      anchor: 'middle',
      fontSize: 12,
      inside: `termD${i}`,
      bind: `d${i}`,
    },
  ]
}

function dNetPiso(i: number): Net {
  const x0 = ffX(i)
  return {
    id: `d${i}`,
    segments: [
      { x1: x0 - 74, y1: 52, x2: x0 - 74, y2: 202 },
      { x1: x0 - 74, y1: 202, x2: x0 - 66, y2: 202 },
    ],
    junctions: [],
  }
}

function muxOutNet(i: number): Net {
  const x0 = ffX(i)
  return { id: `muxOut${i}`, segments: [{ x1: x0 - 26, y1: 214, x2: x0, y2: 214 }], junctions: [] }
}

function fbNet(i: number): Net {
  const x0 = ffX(i)
  return {
    id: `fb${i}`,
    segments: [
      { x1: x0 - 90, y1: 214, x2: x0 - 82, y2: 214 },
      { x1: x0 - 82, y1: 214, x2: x0 - 82, y2: 226 },
      { x1: x0 - 82, y1: 226, x2: x0 - 66, y2: 226 },
    ],
    junctions: [],
  }
}

function shldNet(): Net {
  const segments: Segment[] = [{ x1: BUS_X_START, y1: 300, x2: BUS_X_END, y2: 300 }]
  const junctions: { x: number; y: number }[] = []
  for (const i of STAGES) {
    const x0 = ffX(i)
    segments.push({ x1: x0 - 46, y1: 238, x2: x0 - 46, y2: 300 })
    junctions.push({ x: x0 - 46, y: 300 })
  }
  return { id: 'shld', segments, junctions }
}

export function buildPisoGeometry(): Geometry {
  const bodies: Body[] = []
  const nets: Net[] = []
  const labels: LabelSpec[] = []

  for (const i of STAGES) {
    bodies.push(ffBody(i), muxBody(i), termDBodyPiso(i))
    labels.push(...ffLabels(i), ...muxLabels(i), muxValueLabel(i), ...termDLabelsPiso(i))
    nets.push(dNetPiso(i), muxOutNet(i))
    if (i !== 3) {
      nets.push(fbNet(i))
    }
  }

  bodies.push({ id: 'termSerIn', kind: 'terminal', rect: { x: 4, y: 215, w: 32, h: 22 } })
  labels.push(
    { id: 'termSerIn-nombre', x: 20, y: 209, text: 'SER_IN', anchor: 'middle', fontSize: 10 },
    { id: 'termSerIn-valor', x: 20, y: 231, text: '0', anchor: 'middle', fontSize: 12, inside: 'termSerIn' },
  )
  nets.push({ id: 'serIn', segments: [{ x1: 36, y1: 226, x2: 54, y2: 226 }], junctions: [] })

  bodies.push({ id: 'ledSerOut', kind: 'led-serial', rect: { x: 891, y: 205, w: 18, h: 18 } })
  labels.push({ id: 'ledSerOut-etiqueta', x: 900, y: 240, text: 'SER_OUT', anchor: 'middle', fontSize: 11 })
  nets.push({ id: 'serOut', segments: [{ x1: 830, y1: 214, x2: 891, y2: 214 }], junctions: [] })

  nets.push(shldNet())
  labels.push({
    id: 'shld-etiqueta',
    x: 950,
    y: 292,
    text: 'SH/LD̅ = 1 (CORRIMIENTO)',
    anchor: 'end',
    fontSize: 11,
    bind: 'shldLabel',
  })

  nets.push(clkNet(), clrNet())
  labels.push(...busLabels())

  labels.push(
    {
      id: 'leyenda-1',
      x: 40,
      y: 400,
      text: 'Carga síncrona (SH/LD̅ = 0) · corrimiento hacia Q0 (SH/LD̅ = 1) · SER_OUT = Q0 · entra 0 por Q3',
      anchor: 'start',
      fontSize: 11,
    },
    {
      id: 'leyenda-2',
      x: 40,
      y: 416,
      text: 'MUX: entrada 0 = Dᵢ (carga), entrada 1 = etapa anterior (corrimiento) · cruce sin punto = sin conexión',
      anchor: 'start',
      fontSize: 11,
    },
  )

  return { width: 960, height: 430, bodies, nets, labels }
}

// --- Niveles y rutas activas ---------------------------------------------

export function netLevel(netId: string, state: SimState): 0 | 1 | null {
  const d = /^d(\d)$/.exec(netId)
  if (d) return bitAt(state.inputs, Number(d[1]))

  const q = /^q(\d)$/.exec(netId)
  if (q) return bitAt(state.q, Number(q[1]))

  const muxOut = /^muxOut(\d)$/.exec(netId)
  if (muxOut) return bitAt(muxOutputs(state.q, state.inputs, state.shLd), Number(muxOut[1]))

  const fb = /^fb(\d)$/.exec(netId)
  if (fb) return bitAt(state.q, Number(fb[1]) + 1)

  if (netId === 'serIn') return 0
  if (netId === 'serOut') return bitAt(state.q, 0)

  return null
}

export function netActive(netId: string, state: SimState): boolean {
  if (state.kind === 'PISO') {
    const d = /^d(\d)$/.exec(netId)
    if (d) return state.shLd === 0

    const fb = /^fb(\d)$/.exec(netId)
    if (fb) return state.shLd === 1

    if (netId === 'serIn') return state.shLd === 1
  }
  return true
}

export function bindText(key: string, state: SimState): string {
  const d = /^d(\d)$/.exec(key)
  if (d) return String(bitAt(state.inputs, Number(d[1])))

  const q = /^q(\d)$/.exec(key)
  if (q) return String(bitAt(state.q, Number(q[1])))

  const mux = /^mux(\d)$/.exec(key)
  if (mux) return String(bitAt(muxOutputs(state.q, state.inputs, state.shLd), Number(mux[1])))

  if (key === 'shldLabel') {
    return `SH/LD̅ = ${state.shLd} (${state.shLd === 1 ? 'CORRIMIENTO' : 'CARGA'})`
  }

  return ''
}

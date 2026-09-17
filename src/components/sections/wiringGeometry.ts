import type { Body, BodyKind, Geometry, LabelSpec, Net, Segment } from '../geometry/geometry'

export const ORDEN_FISICO = [
  'D12',
  'D11',
  'D10',
  'D9',
  'D8',
  'D7',
  'D6',
  'D5',
  'D4',
  'D3',
  'D2',
  'A0',
  'A1',
] as const

const LEDS = new Set(['D12', 'D11', 'D10', 'D9', 'D8'])
const PULSADORES = new Set(['D3', 'D2'])

export type TipoFila = 'led' | 'switch' | 'pulsador'

export function tipoDePin(pin: string): TipoFila {
  if (LEDS.has(pin)) return 'led'
  if (PULSADORES.has(pin)) return 'pulsador'
  return 'switch'
}

const TEXTOS_ELEMENTO: Record<string, string> = {
  D12: 'LED Q3',
  D11: 'LED Q2',
  D10: 'LED Q1',
  D9: 'LED Q0',
  D8: 'LED SER_OUT (amarillo)',
  D7: 'Switch D3 (ON = 1)',
  D6: 'Switch D2 (ON = 1)',
  D5: 'Switch D1 (ON = 1)',
  D4: 'Switch D0 (ON = 1)',
  A0: 'Switch SH/LD̅ (ON = CORRIMIENTO)',
  A1: 'Switch MODO (ON = PISO)',
  D3: 'Pulsador CLR (patas en diagonal)',
  D2: 'Pulsador CLK (patas en diagonal)',
}

const WIDTH = 900
const ROW_H = 40
const TOP = 60
const GND_X = 820
const RAIL_Y = TOP + ROW_H * ORDEN_FISICO.length
const HEIGHT = 650

function rowY(k: number): number {
  return TOP + ROW_H * k
}

export function buildWiringGeometry(): Geometry {
  const bodies: Body[] = []
  const nets: Net[] = []
  const labels: LabelSpec[] = []

  bodies.push({ id: 'arduino', kind: 'arduino', rect: { x: 20, y: 36, w: 130, h: 568 } })
  labels.push({ id: 'arduino-titulo', x: 85, y: 26, text: 'Arduino UNO / Nano', anchor: 'middle', fontSize: 12 })

  const gndSegments: Segment[] = []
  const gndJunctions: { x: number; y: number }[] = []

  ORDEN_FISICO.forEach((pin, k) => {
    const y = rowY(k)
    const tipo = tipoDePin(pin)

    labels.push({ id: `pin-${pin}`, x: 140, y: y + 4, text: pin, anchor: 'end', fontSize: 12, inside: 'arduino' })
    labels.push({
      id: `elemento-${pin}`,
      x: 640,
      y: y - 8,
      text: TEXTOS_ELEMENTO[pin],
      anchor: 'middle',
      fontSize: 11,
    })

    let gndStartX: number
    let kind: BodyKind
    let bodyId: string
    let bodyRect: { x: number; y: number; w: number; h: number }

    if (tipo === 'led') {
      nets.push({
        id: `sig${pin}`,
        segments: [
          { x1: 150, y1: y, x2: 300, y2: y },
          { x1: 360, y1: y, x2: 430, y2: y },
        ],
        junctions: [],
      })
      bodies.push({ id: `res${pin}`, kind: 'resistor', rect: { x: 300, y: y - 8, w: 60, h: 16 } })
      labels.push({ id: `res-${pin}`, x: 330, y: y - 12, text: '330 Ω', anchor: 'middle', fontSize: 10 })
      kind = 'led-fisico'
      bodyId = `led${pin}`
      bodyRect = { x: 430, y: y - 10, w: 24, h: 20 }
      gndStartX = 454
    } else if (tipo === 'switch') {
      nets.push({ id: `sig${pin}`, segments: [{ x1: 150, y1: y, x2: 420, y2: y }], junctions: [] })
      kind = 'switch'
      bodyId = `sw${pin}`
      bodyRect = { x: 420, y: y - 14, w: 40, h: 14 }
      gndStartX = 460
    } else {
      nets.push({ id: `sig${pin}`, segments: [{ x1: 150, y1: y, x2: 420, y2: y }], junctions: [] })
      kind = 'pulsador'
      bodyId = `bt${pin}`
      bodyRect = { x: 420, y: y - 16, w: 40, h: 16 }
      gndStartX = 460
    }

    bodies.push({ id: bodyId, kind, rect: bodyRect })
    gndSegments.push({ x1: gndStartX, y1: y, x2: GND_X, y2: y })
    gndJunctions.push({ x: GND_X, y })
  })

  labels.push({ id: 'gnd-pin', x: 140, y: RAIL_Y + 4, text: 'GND', anchor: 'end', fontSize: 12, inside: 'arduino' })

  gndSegments.push({ x1: GND_X, y1: rowY(0), x2: GND_X, y2: RAIL_Y })
  gndSegments.push({ x1: GND_X, y1: RAIL_Y, x2: 150, y2: RAIL_Y })
  nets.push({ id: 'gnd', segments: gndSegments, junctions: gndJunctions })

  labels.push({ id: 'riel-gnd', x: 814, y: 44, text: 'Riel GND común', anchor: 'end', fontSize: 11 })

  labels.push(
    {
      id: 'leyenda-1',
      x: 20,
      y: RAIL_Y + 40,
      text: 'Entradas con INPUT_PULLUP: abierto = HIGH = 0 lógico; ON o presionado = LOW = 1 lógico.',
      anchor: 'start',
      fontSize: 11,
    },
    {
      id: 'leyenda-2',
      x: 20,
      y: RAIL_Y + 58,
      text: 'LED: pin → 330 Ω → ánodo; cátodo → GND. Ningún switch va a 5 V. D13 = LED integrado «L».',
      anchor: 'start',
      fontSize: 11,
    },
  )

  return { width: WIDTH, height: HEIGHT, bodies, nets, labels }
}

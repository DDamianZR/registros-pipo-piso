import type { Bit } from './bits'
import { bitAt } from './bits'
import type { EventCode, HistoryEntry, SimKind } from './simulator'

export type SignalGroup = 'control' | 'entradas' | 'salidas'
export type SignalKind = 'level' | 'pulse'

export interface TimingSignal {
  id: string
  label: string
  group: SignalGroup
  kind: SignalKind
  values: Bit[]
}

export interface TimingSlot {
  step: number
  event: EventCode
  isClockEdge: boolean
  label: string
}

export interface TimingAnnotation {
  slotIndex: number
  text: string
}

export interface TimingTrace {
  slots: TimingSlot[]
  signals: TimingSignal[]
  annotations: TimingAnnotation[]
  windowStart: number
  windowEnd: number
}

const CLOCK_EVENTS: ReadonlySet<EventCode> = new Set(['CLK', 'CLK_CARGA', 'CLK_CORRIMIENTO'])
const STAGES = [3, 2, 1, 0] as const

function slotLabel(event: EventCode): string {
  if (event === 'CLK_CARGA') return 'CARGA'
  if (event === 'CLK_CORRIMIENTO') return 'CORR.'
  if (event === 'CLK') return 'CLK'
  if (event === 'CLR') return 'CLR'
  return ''
}

export function buildTimingTrace(
  history: HistoryEntry[],
  kind: SimKind,
  windowSize = 16,
): TimingTrace {
  const window = history.slice(-windowSize)

  const slots: TimingSlot[] = window.map((entry) => ({
    step: entry.step,
    event: entry.event,
    isClockEdge: CLOCK_EVENTS.has(entry.event),
    label: slotLabel(entry.event),
  }))

  const signals: TimingSignal[] = [
    {
      id: 'CLK',
      label: 'CLK',
      group: 'control',
      kind: 'pulse',
      values: window.map((entry) => (CLOCK_EVENTS.has(entry.event) ? 1 : 0)),
    },
    {
      id: 'CLR',
      label: 'CLR',
      group: 'control',
      kind: 'pulse',
      values: window.map((entry) => (entry.event === 'CLR' ? 1 : 0)),
    },
  ]

  if (kind === 'PISO') {
    signals.push({
      id: 'SH_LD',
      label: 'SH/LD̅',
      group: 'control',
      kind: 'level',
      values: window.map((entry) => entry.shLd),
    })
  }

  for (const i of STAGES) {
    signals.push({
      id: `D${i}`,
      label: `D${i}`,
      group: 'entradas',
      kind: 'level',
      values: window.map((entry) => bitAt(entry.inputs, i)),
    })
  }

  for (const i of STAGES) {
    signals.push({
      id: `Q${i}`,
      label: `Q${i}`,
      group: 'salidas',
      kind: 'level',
      values: window.map((entry) => bitAt(entry.q, i)),
    })
  }

  if (kind === 'PISO') {
    signals.push({
      id: 'SER_OUT',
      label: 'SER_OUT',
      group: 'salidas',
      kind: 'level',
      values: window.map((entry) => (entry.serOut ?? 0) as Bit),
    })
  }

  const annotations: TimingAnnotation[] =
    kind === 'PISO'
      ? window
          .map((entry, index) => ({ entry, index }))
          .filter(({ entry }) => entry.bitOnLine !== null)
          .map(({ entry, index }) => ({ slotIndex: index, text: `D${entry.bitOnLine}` }))
      : []

  return {
    slots,
    signals,
    annotations,
    windowStart: window.length > 0 ? window[0].step : 0,
    windowEnd: window.length > 0 ? window[window.length - 1].step : 0,
  }
}

import type { Bit, Nibble } from './bits'
import { toggleBit } from './bits'
import { nextPipo, nextPiso, serialOut } from './registers'

export type SimKind = 'PIPO' | 'PISO'

export type EventCode =
  | 'INICIO'
  | 'ENTRADA'
  | 'CONTROL'
  | 'CLK'
  | 'CLK_CARGA'
  | 'CLK_CORRIMIENTO'
  | 'CLR'

export interface HistoryEntry {
  step: number
  event: EventCode
  inputs: Nibble
  shLd: Bit
  q: Nibble
  serOut: Bit | null
  bitOnLine: number | null
}

export interface SimState {
  kind: SimKind
  inputs: Nibble
  shLd: Bit
  q: Nibble
  shiftsSinceLoad: number | null
  loadedWord: Nibble | null
  nextStep: number
  history: HistoryEntry[]
}

export type SimAction =
  | { type: 'TOGGLE_INPUT'; bit: number }
  | { type: 'SET_SH_LD'; value: Bit }
  | { type: 'CLOCK_PULSE' }
  | { type: 'CLEAR' }
  | { type: 'RESET_SIMULATION' }

export const HISTORY_LIMIT = 64

function bitOnLineFor(kind: SimKind, shiftsSinceLoad: number | null): number | null {
  if (kind !== 'PISO') return null
  return shiftsSinceLoad !== null && shiftsSinceLoad <= 3 ? shiftsSinceLoad : null
}

function serOutFor(kind: SimKind, q: Nibble): Bit | null {
  return kind === 'PISO' ? serialOut(q) : null
}

function withEvent(
  prev: SimState,
  event: EventCode,
  updates: Partial<Pick<SimState, 'inputs' | 'shLd' | 'q' | 'shiftsSinceLoad' | 'loadedWord'>>,
): SimState {
  const next: SimState = { ...prev, ...updates }
  const entry: HistoryEntry = {
    step: prev.nextStep,
    event,
    inputs: next.inputs,
    shLd: next.shLd,
    q: next.q,
    serOut: serOutFor(next.kind, next.q),
    bitOnLine: bitOnLineFor(next.kind, next.shiftsSinceLoad),
  }
  const history = [...prev.history, entry]
  return {
    ...next,
    nextStep: prev.nextStep + 1,
    history: history.length > HISTORY_LIMIT ? history.slice(history.length - HISTORY_LIMIT) : history,
  }
}

export function createInitialState(kind: SimKind): SimState {
  const base: SimState = {
    kind,
    inputs: 0,
    shLd: 0,
    q: 0,
    shiftsSinceLoad: null,
    loadedWord: null,
    nextStep: 0,
    history: [],
  }
  return withEvent(base, 'INICIO', {})
}

export function simulatorReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'TOGGLE_INPUT':
      return withEvent(state, 'ENTRADA', { inputs: toggleBit(state.inputs, action.bit) })

    case 'SET_SH_LD': {
      if (state.kind === 'PIPO') return state
      if (action.value === state.shLd) return state
      return withEvent(state, 'CONTROL', { shLd: action.value })
    }

    case 'CLOCK_PULSE': {
      if (state.kind === 'PIPO') {
        return withEvent(state, 'CLK', { q: nextPipo(state.q, state.inputs) })
      }
      if (state.shLd === 0) {
        return withEvent(state, 'CLK_CARGA', {
          q: nextPiso(state.q, state.inputs, 0),
          loadedWord: state.inputs,
          shiftsSinceLoad: 0,
        })
      }
      return withEvent(state, 'CLK_CORRIMIENTO', {
        q: nextPiso(state.q, state.inputs, 1),
        shiftsSinceLoad: state.shiftsSinceLoad === null ? null : state.shiftsSinceLoad + 1,
      })
    }

    case 'CLEAR':
      return withEvent(state, 'CLR', { q: 0, shiftsSinceLoad: null, loadedWord: null })

    case 'RESET_SIMULATION': {
      const base: SimState = {
        kind: state.kind,
        inputs: state.inputs,
        shLd: state.shLd,
        q: 0,
        shiftsSinceLoad: null,
        loadedWord: null,
        nextStep: 0,
        history: [],
      }
      return withEvent(base, 'INICIO', {})
    }

    default:
      return state
  }
}

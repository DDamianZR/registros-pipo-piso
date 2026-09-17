import { createInitialState, simulatorReducer } from './simulator'
import type { SimAction, SimKind, SimState } from './simulator'

export const PIPO_CANONICA: SimAction[] = [
  { type: 'TOGGLE_INPUT', bit: 3 },
  { type: 'TOGGLE_INPUT', bit: 1 },
  { type: 'CLOCK_PULSE' },
  { type: 'TOGGLE_INPUT', bit: 3 },
  { type: 'TOGGLE_INPUT', bit: 2 },
  { type: 'TOGGLE_INPUT', bit: 1 },
  { type: 'TOGGLE_INPUT', bit: 0 },
  { type: 'CLOCK_PULSE' },
]

export const PISO_CANONICA: SimAction[] = [
  { type: 'TOGGLE_INPUT', bit: 3 },
  { type: 'TOGGLE_INPUT', bit: 1 },
  { type: 'CLOCK_PULSE' },
  { type: 'SET_SH_LD', value: 1 },
  { type: 'CLOCK_PULSE' },
  { type: 'CLOCK_PULSE' },
  { type: 'CLOCK_PULSE' },
  { type: 'CLOCK_PULSE' },
]

export const PISO_1101: SimAction[] = [
  { type: 'TOGGLE_INPUT', bit: 3 },
  { type: 'TOGGLE_INPUT', bit: 2 },
  { type: 'TOGGLE_INPUT', bit: 0 },
  { type: 'CLOCK_PULSE' },
  { type: 'SET_SH_LD', value: 1 },
  { type: 'CLOCK_PULSE' },
  { type: 'CLOCK_PULSE' },
  { type: 'CLOCK_PULSE' },
  { type: 'CLOCK_PULSE' },
]

export function runSequence(kind: SimKind, actions: SimAction[]): SimState {
  return actions.reduce((state, action) => simulatorReducer(state, action), createInitialState(kind))
}

import { bitAt, toBitString } from './bits'
import { createInitialState, simulatorReducer } from './simulator'
import type { SimAction, SimKind, SimState } from './simulator'

export interface ProcedureStep {
  numero: number
  accion: string
  resultado: string
}

function describirAccion(action: SimAction, nuevo: SimState): string {
  switch (action.type) {
    case 'TOGGLE_INPUT': {
      const v = bitAt(nuevo.inputs, action.bit)
      return `D${action.bit} → ${v} (${v === 1 ? 'ON' : 'OFF'})`
    }
    case 'SET_SH_LD':
      return `SH/LD̅ → ${action.value} (${action.value === 1 ? 'CORRIMIENTO' : 'CARGA'})`
    case 'CLOCK_PULSE':
      return 'Pulso de reloj (CLK)'
    case 'CLEAR':
      return 'Pulso de borrado (CLR)'
    case 'RESET_SIMULATION':
      return 'Reiniciar (RESET)'
    default:
      return ''
  }
}

function describirResultado(kind: SimKind, nuevo: SimState): string {
  const q = toBitString(nuevo.q)
  return kind === 'PISO' ? `Q = ${q} · SER_OUT = ${nuevo.q & 1}` : `Q = ${q}`
}

export function describeSequence(kind: SimKind, actions: SimAction[]): ProcedureStep[] {
  let estado = createInitialState(kind)
  const pasos: ProcedureStep[] = []
  for (const action of actions) {
    const nuevo = simulatorReducer(estado, action)
    if (nuevo.history.length > estado.history.length) {
      pasos.push({
        numero: pasos.length + 1,
        accion: describirAccion(action, nuevo),
        resultado: describirResultado(kind, nuevo),
      })
    }
    estado = nuevo
  }
  return pasos
}

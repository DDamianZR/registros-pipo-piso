import { toBitString } from './bits'
import type { SimState } from './simulator'

export function nextHint(state: SimState): string {
  if (state.kind === 'PIPO') {
    if (state.history.length === 1) {
      return 'Configura D3–D0 con los interruptores y aplica un pulso de reloj.'
    }
    if (state.inputs !== state.q) {
      return `Las entradas cambiaron pero Q conserva «${toBitString(state.q)}». Aplica un pulso de reloj para cargarlas.`
    }
    return 'Q = D. Cambia alguna entrada para comprobar que Q se mantiene hasta el siguiente flanco.'
  }

  const { shiftsSinceLoad, shLd } = state

  if (shiftsSinceLoad === null && shLd === 1) {
    return 'Coloca SH/LD̅ en CARGA (0) y aplica un pulso para cargar la palabra.'
  }
  if (shiftsSinceLoad === null) {
    return 'Configura D3–D0 y aplica un pulso con SH/LD̅ en CARGA.'
  }
  if (shiftsSinceLoad <= 3 && shLd === 0) {
    return 'Palabra cargada. Cambia SH/LD̅ a CORRIMIENTO (1) para transmitir.'
  }
  if (shiftsSinceLoad <= 3 && shLd === 1) {
    return `SER_OUT presenta D${shiftsSinceLoad} (bit ${shiftsSinceLoad + 1} de 4). Aplica un pulso para desplazar.`
  }
  return 'Transmisión completa: el registro quedó vacío. Carga un nuevo valor.'
}

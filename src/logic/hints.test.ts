import { describe, expect, it } from 'vitest'
import { nextHint } from './hints'
import { simulatorReducer, createInitialState } from './simulator'
import type { SimAction, SimState } from './simulator'

function dispatch(state: SimState, action: SimAction): SimState {
  return simulatorReducer(state, action)
}

describe('nextHint · PIPO', () => {
  it('HINT-01: estado inicial sugiere configurar entradas', () => {
    const state = createInitialState('PIPO')
    expect(nextHint(state)).toMatch(/aplica un pulso de reloj/i)
  })

  it('HINT-02: entradas distintas de Q sugieren aplicar el reloj', () => {
    let state = createInitialState('PIPO')
    state = dispatch(state, { type: 'TOGGLE_INPUT', bit: 3 })
    expect(nextHint(state)).toMatch(/Q conserva/i)
  })

  it('HINT-03: Q = D sugiere cambiar una entrada', () => {
    let state = createInitialState('PIPO')
    state = dispatch(state, { type: 'TOGGLE_INPUT', bit: 3 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(nextHint(state)).toMatch(/Q = D/)
  })
})

describe('nextHint · PISO', () => {
  it('HINT-04: sin carga previa y SH/LD̅=1 sugiere volver a CARGA', () => {
    let state = createInitialState('PISO')
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    expect(nextHint(state)).toMatch(/CARGA \(0\)/)
  })

  it('HINT-05: sin carga previa y SH/LD̅=0 sugiere configurar D y cargar', () => {
    const state = createInitialState('PISO')
    expect(nextHint(state)).toMatch(/Configura D3–D0/)
  })

  it('HINT-06: palabra recién cargada con SH/LD̅=0 sugiere cambiar a CORRIMIENTO', () => {
    let state = createInitialState('PISO')
    state = dispatch(state, { type: 'TOGGLE_INPUT', bit: 3 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(nextHint(state)).toMatch(/CORRIMIENTO \(1\)/)
  })

  it('HINT-07: en transmisión sugiere aplicar el siguiente pulso', () => {
    let state = createInitialState('PISO')
    state = dispatch(state, { type: 'TOGGLE_INPUT', bit: 3 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    expect(nextHint(state)).toMatch(/SER_OUT presenta D0/)
  })

  it('HINT-08: transmisión completa sugiere cargar un nuevo valor', () => {
    let state = createInitialState('PISO')
    state = dispatch(state, { type: 'TOGGLE_INPUT', bit: 3 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    for (let i = 0; i < 4; i += 1) {
      state = dispatch(state, { type: 'CLOCK_PULSE' })
    }
    expect(nextHint(state)).toMatch(/Transmisión completa/)
  })
})

import { describe, expect, it } from 'vitest'
import { bitAt } from './bits'
import { createInitialState, simulatorReducer, type SimAction, type SimState } from './simulator'

function dispatch(state: SimState, action: SimAction): SimState {
  return simulatorReducer(state, action)
}

function setInputs(state: SimState, value: number): SimState {
  let next = state
  for (let i = 0; i <= 3; i += 1) {
    if (bitAt(next.inputs, i) !== bitAt(value, i)) {
      next = dispatch(next, { type: 'TOGGLE_INPUT', bit: i })
    }
  }
  return next
}

function last(state: SimState) {
  return state.history[state.history.length - 1]
}

describe('PIPO', () => {
  it('PIPO-01 estado inicial', () => {
    const state = createInitialState('PIPO')
    expect(state.q).toBe(0)
    expect(state.history).toHaveLength(1)
    expect(state.history[0]).toMatchObject({ step: 0, event: 'INICIO' })
  })

  it('PIPO-02 carga paralela', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b1010)
    expect(last(state).event).toBe('CLK')
  })

  it('PIPO-03 retención: D cambia sin CLK y Q no se altera', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    for (const bit of [3, 2, 1, 0]) {
      state = dispatch(state, { type: 'TOGGLE_INPUT', bit })
      expect(state.q).toBe(0b1010)
      expect(last(state).event).toBe('ENTRADA')
    }
    expect(state.inputs).toBe(0b0101)
  })

  it('PIPO-04 nueva carga', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = setInputs(state, 0b0101)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0101)
  })

  it('PIPO-05 idempotencia', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b0101)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0101)
  })

  it('PIPO-06 extremos', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b1111)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b1111)
    state = setInputs(state, 0b0000)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0000)
  })

  it('PIPO-07 un 1 que recorre posiciones', () => {
    let state = createInitialState('PIPO')
    for (const value of [0b0001, 0b0010, 0b0100, 0b1000]) {
      state = setInputs(state, value)
      state = dispatch(state, { type: 'CLOCK_PULSE' })
      expect(state.q).toBe(value)
    }
  })

  it('PIPO-08 CLR', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b1011)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLEAR' })
    expect(state.q).toBe(0)
    expect(state.inputs).toBe(0b1011)
    expect(last(state).event).toBe('CLR')
  })

  it('PIPO-09 CLR y recarga', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b1011)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLEAR' })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b1011)
  })

  it('PIPO-10 exhaustiva', () => {
    for (let v = 0; v <= 15; v += 1) {
      let state = createInitialState('PIPO')
      state = setInputs(state, v)
      state = dispatch(state, { type: 'CLOCK_PULSE' })
      expect(state.q).toBe(v)
    }
  })

  it('PIPO-11 reinicio', () => {
    let state = createInitialState('PIPO')
    state = setInputs(state, 0b1100)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = setInputs(state, 0b0011)
    state = dispatch(state, { type: 'RESET_SIMULATION' })
    expect(state.history).toHaveLength(1)
    expect(state.history[0].step).toBe(0)
    expect(state.q).toBe(0)
    expect(state.inputs).toBe(0b0011)
  })
})

describe('PISO', () => {
  it('PISO-01 carga', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b1010)
    expect(last(state)).toMatchObject({ event: 'CLK_CARGA', serOut: 0, bitOnLine: 0 })
    expect(state.shiftsSinceLoad).toBe(0)
  })

  it('PISO-02 primer corrimiento', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0101)
    expect(last(state)).toMatchObject({ event: 'CLK_CORRIMIENTO', serOut: 1, bitOnLine: 1 })
  })

  it('PISO-03 segundo corrimiento', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0010)
    expect(last(state)).toMatchObject({ event: 'CLK_CORRIMIENTO', serOut: 0, bitOnLine: 2 })
  })

  it('PISO-04 tercer corrimiento', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0001)
    expect(last(state)).toMatchObject({ event: 'CLK_CORRIMIENTO', serOut: 1, bitOnLine: 3 })
  })

  it('PISO-05 cuarto corrimiento (vaciado)', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    for (let i = 0; i < 4; i += 1) {
      state = dispatch(state, { type: 'CLOCK_PULSE' })
    }
    expect(state.q).toBe(0)
    expect(last(state)).toMatchObject({ event: 'CLK_CORRIMIENTO', serOut: 0, bitOnLine: null })
  })

  it('PISO-06 corrimiento extra', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    for (let i = 0; i < 5; i += 1) {
      state = dispatch(state, { type: 'CLOCK_PULSE' })
    }
    expect(state.q).toBe(0)
    expect(last(state).bitOnLine).toBeNull()
  })

  it('PISO-07 orden de salida', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    const ser: Array<number | null> = [last(state).serOut]
    for (let i = 0; i < 3; i += 1) {
      state = dispatch(state, { type: 'CLOCK_PULSE' })
      ser.push(last(state).serOut)
    }
    expect(ser).toEqual([0, 1, 0, 1])
  })

  it('PISO-08 palabra asimétrica', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1101)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    const qs: number[] = [state.q]
    const ser: Array<number | null> = [last(state).serOut]
    for (let i = 0; i < 4; i += 1) {
      state = dispatch(state, { type: 'CLOCK_PULSE' })
      qs.push(state.q)
      ser.push(last(state).serOut)
    }
    expect(qs).toEqual([0b1101, 0b0110, 0b0011, 0b0001, 0b0000])
    expect(ser).toEqual([1, 0, 1, 1, 0])
  })

  it('PISO-09 dirección del corrimiento', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b0001)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0000)
  })

  it('PISO-10 llegada del MSB', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1000)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0001)
    expect(last(state).serOut).toBe(1)
  })

  it('PISO-11 entradas tras carga no afectan el corrimiento', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = setInputs(state, 0b0110)
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0101)
  })

  it('PISO-12 carga repetida', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    for (let i = 0; i < 3; i += 1) {
      state = dispatch(state, { type: 'CLOCK_PULSE' })
      expect(state.q).toBe(0b1010)
      expect(state.shiftsSinceLoad).toBe(0)
    }
  })

  it('PISO-13 recarga a mitad', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 0 })
    state = setInputs(state, 0b1111)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b1111)
    expect(last(state)).toMatchObject({ event: 'CLK_CARGA', bitOnLine: 0 })
    expect(state.shiftsSinceLoad).toBe(0)
  })

  it('PISO-14 control sin reloj', () => {
    let state = createInitialState('PISO')
    const qBefore = state.q
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    expect(state.q).toBe(qBefore)
    expect(last(state).event).toBe('CONTROL')
  })

  it('PISO-15 CLR a mitad', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1010)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'CLEAR' })
    expect(state.q).toBe(0)
    expect(last(state).bitOnLine).toBeNull()
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0)
  })

  it('PISO-16 exhaustiva', () => {
    for (let v = 0; v <= 15; v += 1) {
      let state = createInitialState('PISO')
      state = setInputs(state, v)
      state = dispatch(state, { type: 'CLOCK_PULSE' })
      state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
      const ser: Array<number | null> = [last(state).serOut]
      for (let i = 0; i < 4; i += 1) {
        state = dispatch(state, { type: 'CLOCK_PULSE' })
        ser.push(last(state).serOut)
      }
      expect(ser).toEqual([bitAt(v, 0), bitAt(v, 1), bitAt(v, 2), bitAt(v, 3), 0])
    }
  })

  it('PISO-17 corrimiento sin carga', () => {
    let state = createInitialState('PISO')
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0)
    expect(last(state).bitOnLine).toBeNull()
  })

  it('PISO-18 sin cascada', () => {
    let state = createInitialState('PISO')
    state = setInputs(state, 0b1111)
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    state = dispatch(state, { type: 'SET_SH_LD', value: 1 })
    state = dispatch(state, { type: 'CLOCK_PULSE' })
    expect(state.q).toBe(0b0111)
  })
})

describe('determinismo y límite del historial', () => {
  it('SIM-DET: la misma secuencia produce el mismo estado', () => {
    const actions: SimAction[] = [
      { type: 'TOGGLE_INPUT', bit: 3 },
      { type: 'TOGGLE_INPUT', bit: 1 },
      { type: 'CLOCK_PULSE' },
      { type: 'SET_SH_LD', value: 1 },
      { type: 'CLOCK_PULSE' },
      { type: 'CLOCK_PULSE' },
      { type: 'CLEAR' },
    ]
    const run = () => actions.reduce((state, action) => dispatch(state, action), createInitialState('PISO'))
    expect(run()).toEqual(run())
  })

  it('SIM-LIM: el historial se limita a 64 entradas', () => {
    let state = createInitialState('PIPO')
    for (let i = 0; i < 100; i += 1) {
      state = dispatch(state, { type: 'TOGGLE_INPUT', bit: 0 })
    }
    expect(state.history).toHaveLength(64)
    expect(state.history[state.history.length - 1].step).toBe(100)
  })
})

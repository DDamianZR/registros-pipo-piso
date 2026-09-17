import { describe, expect, it } from 'vitest'
import { bitAt } from './bits'
import { buildTimingTrace } from './timing'
import { simulatorReducer } from './simulator'
import type { SimAction, SimState } from './simulator'
import { PISO_CANONICA, runSequence } from './vectors'

function dispatch(state: SimState, action: SimAction): SimState {
  return simulatorReducer(state, action)
}

describe('buildTimingTrace', () => {
  it('TIM-01: la secuencia PISO canónica produce 9 ranuras con pulsos CLK en 3,5,6,7,8', () => {
    const state = runSequence('PISO', PISO_CANONICA)
    const trace = buildTimingTrace(state.history, 'PISO')
    expect(trace.slots).toHaveLength(9)
    const clk = trace.signals.find((s) => s.id === 'CLK')!
    expect(clk.values).toEqual([0, 0, 0, 1, 0, 1, 1, 1, 1])
  })

  it('TIM-02: los niveles de Q coinciden con el historial bit a bit', () => {
    const state = runSequence('PISO', PISO_CANONICA)
    const trace = buildTimingTrace(state.history, 'PISO')
    for (const i of [3, 2, 1, 0] as const) {
      const signal = trace.signals.find((s) => s.id === `Q${i}`)!
      state.history.forEach((entry, index) => {
        expect(signal.values[index]).toBe(bitAt(entry.q, i))
      })
    }
  })

  it('TIM-03: en las ranuras 1 y 2, D cambia pero Q no', () => {
    const state = runSequence('PISO', PISO_CANONICA)
    const trace = buildTimingTrace(state.history, 'PISO')
    const d3 = trace.signals.find((s) => s.id === 'D3')!
    const d1 = trace.signals.find((s) => s.id === 'D1')!
    expect(d3.values[0]).toBe(0)
    expect(d3.values[1]).toBe(1)
    expect(d1.values[1]).toBe(0)
    expect(d1.values[2]).toBe(1)
    for (const i of [3, 2, 1, 0] as const) {
      const q = trace.signals.find((s) => s.id === `Q${i}`)!
      expect(q.values[0]).toBe(0)
      expect(q.values[1]).toBe(0)
      expect(q.values[2]).toBe(0)
    }
  })

  it('TIM-04: SER_OUT coincide con Q0 en todas las ranuras', () => {
    const state = runSequence('PISO', PISO_CANONICA)
    const trace = buildTimingTrace(state.history, 'PISO')
    const serOut = trace.signals.find((s) => s.id === 'SER_OUT')!
    const q0 = trace.signals.find((s) => s.id === 'Q0')!
    expect(serOut.values).toEqual(q0.values)
  })

  it('TIM-05: la ventana muestra las últimas 16 ranuras', () => {
    let state = runSequence('PIPO', [])
    for (let i = 0; i < 30; i += 1) {
      state = dispatch(state, { type: 'TOGGLE_INPUT', bit: 0 })
    }
    const trace = buildTimingTrace(state.history, 'PIPO')
    expect(trace.slots).toHaveLength(16)
    expect(trace.windowEnd).toBe(30)
    expect(trace.windowStart).toBe(15)
  })
})

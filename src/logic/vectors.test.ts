import { describe, expect, it } from 'vitest'
import { PIPO_CANONICA, PISO_1101, PISO_CANONICA, runSequence } from './vectors'

describe('vectores de referencia', () => {
  it('PIPO_CANONICA termina con Q=0101 y 9 pasos', () => {
    const state = runSequence('PIPO', PIPO_CANONICA)
    expect(state.q).toBe(0b0101)
    expect(state.history).toHaveLength(9)
  })

  it('PISO_CANONICA termina vacía tras 4 corrimientos y 9 pasos', () => {
    const state = runSequence('PISO', PISO_CANONICA)
    expect(state.q).toBe(0)
    expect(state.history).toHaveLength(9)
  })

  it('PISO_1101 recorre 1101→0110→0011→0001→0000', () => {
    const state = runSequence('PISO', PISO_1101)
    const qs = state.history.slice(-5).map((entry) => entry.q)
    expect(qs).toEqual([0b1101, 0b0110, 0b0011, 0b0001, 0b0000])
  })

  it('es determinista al ejecutarse dos veces', () => {
    expect(runSequence('PISO', PISO_CANONICA)).toEqual(runSequence('PISO', PISO_CANONICA))
    expect(runSequence('PIPO', PIPO_CANONICA)).toEqual(runSequence('PIPO', PIPO_CANONICA))
  })
})

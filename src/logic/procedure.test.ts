import { describe, expect, it } from 'vitest'
import { describeSequence } from './procedure'
import { PIPO_CANONICA, PISO_CANONICA, runSequence } from './vectors'

describe('describeSequence', () => {
  it('PROC-01 acciones de PIPO_CANONICA', () => {
    const pasos = describeSequence('PIPO', PIPO_CANONICA)
    expect(pasos.map((p) => p.accion)).toEqual([
      'D3 → 1 (ON)',
      'D1 → 1 (ON)',
      'Pulso de reloj (CLK)',
      'D3 → 0 (OFF)',
      'D2 → 1 (ON)',
      'D1 → 0 (OFF)',
      'D0 → 1 (ON)',
      'Pulso de reloj (CLK)',
    ])
  })

  it('PROC-02 acciones de PISO_CANONICA', () => {
    const pasos = describeSequence('PISO', PISO_CANONICA)
    expect(pasos.map((p) => p.accion)).toEqual([
      'D3 → 1 (ON)',
      'D1 → 1 (ON)',
      'Pulso de reloj (CLK)',
      'SH/LD̅ → 1 (CORRIMIENTO)',
      'Pulso de reloj (CLK)',
      'Pulso de reloj (CLK)',
      'Pulso de reloj (CLK)',
      'Pulso de reloj (CLK)',
    ])
  })

  it('PROC-03 resultados de PISO_CANONICA', () => {
    const pasos = describeSequence('PISO', PISO_CANONICA)
    expect(pasos[pasos.length - 1].resultado).toBe('Q = 0000 · SER_OUT = 0')
    expect(pasos[4].resultado).toBe('Q = 0101 · SER_OUT = 1')
  })

  it('PROC-04 coherencia con el número de filas del CSV', () => {
    const pipoPasos = describeSequence('PIPO', PIPO_CANONICA)
    const pisoPasos = describeSequence('PISO', PISO_CANONICA)
    expect(pipoPasos).toHaveLength(runSequence('PIPO', PIPO_CANONICA).history.length - 1)
    expect(pisoPasos).toHaveLength(runSequence('PISO', PISO_CANONICA).history.length - 1)
  })
})

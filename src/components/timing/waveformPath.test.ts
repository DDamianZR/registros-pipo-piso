import { describe, expect, it } from 'vitest'
import { highRuns, slotHeaderText, waveformPath } from './waveformPath'
import type { TimingSlot } from '../../logic/timing'

describe('highRuns', () => {
  it('TIM-06 detecta tramos de unos consecutivos', () => {
    expect(highRuns([0, 1, 1, 0, 1])).toEqual([
      { start: 1, end: 3 },
      { start: 4, end: 5 },
    ])
    expect(highRuns([])).toEqual([])
    expect(highRuns([1, 1])).toEqual([{ start: 0, end: 2 }])
  })
})

describe('slotHeaderText', () => {
  it('TIM-07 marca el flanco de reloj con ↑', () => {
    const flanco: TimingSlot = { step: 12, event: 'CLK', isClockEdge: true, label: 'CLK' }
    expect(slotHeaderText(flanco)).toBe('↑12')

    const entrada: TimingSlot = { step: 12, event: 'ENTRADA', isClockEdge: false, label: '' }
    expect(slotHeaderText(entrada)).toBe('12')
  })

  it('TIM-09 el texto del encabezado cabe en un SLOT_W de 44 hasta el paso 999', () => {
    const slot: TimingSlot = { step: 999, event: 'CLK', isClockEdge: true, label: 'CLK' }
    const texto = slotHeaderText(slot)
    expect(texto).toHaveLength(4)
    expect(texto.length * 11 * 0.62).toBeLessThanOrEqual(44)
  })
})

describe('waveformPath', () => {
  it('TIM-08 fija el trazo actual para una señal de nivel', () => {
    expect(waveformPath([0, 1], 'level', 44, 6, 22)).toBe('M 0 22 L 44 22 L 44 22 L 44 6 L 88 6')
  })
})

import { describe, expect, it } from 'vitest'
import { muxOutputs, nextPipo, nextPiso, serialOut } from './registers'

describe('nextPipo', () => {
  it('siempre adopta el valor de D, sin importar Q', () => {
    for (let q = 0; q <= 15; q += 1) {
      for (let d = 0; d <= 15; d += 1) {
        expect(nextPipo(q, d)).toBe(d)
      }
    }
  })
})

describe('nextPiso', () => {
  it('con SH/LD̅=0 carga D completo, sin importar Q', () => {
    for (let q = 0; q <= 15; q += 1) {
      expect(nextPiso(q, 0b0110, 0)).toBe(0b0110)
    }
  })

  it('con SH/LD̅=1 corre hacia Q0 y entra 0 por Q3', () => {
    expect(nextPiso(0b1010, 0, 1)).toBe(0b0101)
    expect(nextPiso(0b1111, 0, 1)).toBe(0b0111)
    expect(nextPiso(0b0001, 0, 1)).toBe(0)
  })
})

describe('serialOut', () => {
  it('devuelve el bit Q0', () => {
    expect(serialOut(0b1011)).toBe(1)
    expect(serialOut(0b1010)).toBe(0)
  })
})

describe('muxOutputs', () => {
  it('selecciona D en carga y el corrimiento en desplazamiento', () => {
    expect(muxOutputs(0b1010, 0b0110, 0)).toBe(0b0110)
    expect(muxOutputs(0b1010, 0b0110, 1)).toBe(0b0101)
  })
})

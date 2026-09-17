import { describe, expect, it } from 'vitest'
import { BIT_INDICES, DISPLAY_ORDER, bitAt, parseBitString, toBitString, toggleBit } from './bits'

describe('bitAt', () => {
  it('lee el bit correcto en cada posición', () => {
    expect(bitAt(0b1010, 3)).toBe(1)
    expect(bitAt(0b1010, 2)).toBe(0)
    expect(bitAt(0b1010, 1)).toBe(1)
    expect(bitAt(0b1010, 0)).toBe(0)
  })
})

describe('toggleBit', () => {
  it('invierte solo el bit indicado', () => {
    expect(toggleBit(0b0000, 3)).toBe(0b1000)
    expect(toggleBit(0b1000, 3)).toBe(0b0000)
    expect(toggleBit(0b1010, 0)).toBe(0b1011)
  })
})

describe('toBitString', () => {
  it('escribe la palabra del MSB al LSB', () => {
    expect(toBitString(10)).toBe('1010')
    expect(toBitString(0)).toBe('0000')
    expect(toBitString(15)).toBe('1111')
  })
})

describe('parseBitString', () => {
  it('interpreta la cadena del MSB al LSB', () => {
    expect(parseBitString('0101')).toBe(5)
    expect(parseBitString('1010')).toBe(10)
  })

  it('lanza un error con una cadena inválida', () => {
    expect(() => parseBitString('101')).toThrow()
    expect(() => parseBitString('10102')).toThrow()
    expect(() => parseBitString('abcd')).toThrow()
  })
})

describe('constantes de orden', () => {
  it('DISPLAY_ORDER y BIT_INDICES cubren los 4 bits', () => {
    expect(DISPLAY_ORDER).toEqual([3, 2, 1, 0])
    expect(BIT_INDICES).toEqual([0, 1, 2, 3])
  })
})

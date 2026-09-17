import type { Bit, Nibble } from './bits'

export const SER_IN: Bit = 0

export function nextPipo(_q: Nibble, d: Nibble): Nibble {
  return d & 0xf
}

export function muxOutputs(q: Nibble, d: Nibble, shLd: Bit): Nibble {
  return shLd ? (q >> 1) & 0b0111 : d & 0xf
}

export function nextPiso(q: Nibble, d: Nibble, shLd: Bit): Nibble {
  return muxOutputs(q, d, shLd)
}

export function serialOut(q: Nibble): Bit {
  return (q & 1) as Bit
}

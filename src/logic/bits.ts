export type Bit = 0 | 1
export type Nibble = number

export const DISPLAY_ORDER: readonly [3, 2, 1, 0] = [3, 2, 1, 0]
export const BIT_INDICES: readonly [0, 1, 2, 3] = [0, 1, 2, 3]

export function bitAt(value: number, index: number): Bit {
  return ((value >> index) & 1) as Bit
}

export function toggleBit(value: Nibble, index: number): Nibble {
  return (value ^ (1 << index)) & 0xf
}

export function toBitString(value: Nibble): string {
  return DISPLAY_ORDER.map((index) => bitAt(value, index)).join('')
}

export function parseBitString(text: string): Nibble {
  if (!/^[01]{4}$/.test(text)) {
    throw new Error(`Cadena de bits inválida: "${text}". Se esperan 4 caracteres 0/1.`)
  }
  let value = 0
  for (let position = 0; position < 4; position += 1) {
    const bitIndex = DISPLAY_ORDER[position]
    if (text[position] === '1') {
      value |= 1 << bitIndex
    }
  }
  return value
}

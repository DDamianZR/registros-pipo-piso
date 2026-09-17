import { describe, expect, it } from 'vitest'
import { buildTableRows, toCsv } from './table'
import { PIPO_CANONICA, PISO_CANONICA, runSequence } from './vectors'

function csvFromLines(lines: string[]): string {
  return `${lines.join('\r\n')}\r\n`
}

describe('buildTableRows', () => {
  it('TAB-01: una fila por entrada, pasos ascendentes', () => {
    const state = runSequence('PISO', PISO_CANONICA)
    const rows = buildTableRows(state.history, 'PISO')
    expect(rows).toHaveLength(state.history.length)
    rows.forEach((row, index) => expect(row.paso).toBe(index))
  })

  it('TAB-03: en PIPO, sh_ld, ser_out y bit_en_linea son guiones', () => {
    const state = runSequence('PIPO', PIPO_CANONICA)
    const rows = buildTableRows(state.history, 'PIPO')
    rows.forEach((row) => {
      expect(row.shLd).toBe('-')
      expect(row.serOut).toBe('-')
      expect(row.bitEnLinea).toBe('-')
    })
  })
})

describe('toCsv', () => {
  it('TAB-02: encabezado exacto', () => {
    const csv = toCsv([])
    expect(csv.split('\r\n')[0]).toBe('paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea')
  })

  it('TAB-04: CSV de PISO idéntico a la secuencia canónica', () => {
    const state = runSequence('PISO', PISO_CANONICA)
    const rows = buildTableRows(state.history, 'PISO')
    const csv = toCsv(rows)
    const expected = csvFromLines([
      'paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea',
      '0,PISO,INICIO,0,0000,0000,0,-',
      '1,PISO,ENTRADA,0,1000,0000,0,-',
      '2,PISO,ENTRADA,0,1010,0000,0,-',
      '3,PISO,CLK_CARGA,0,1010,1010,0,D0',
      '4,PISO,CONTROL,1,1010,1010,0,D0',
      '5,PISO,CLK_CORRIMIENTO,1,1010,0101,1,D1',
      '6,PISO,CLK_CORRIMIENTO,1,1010,0010,0,D2',
      '7,PISO,CLK_CORRIMIENTO,1,1010,0001,1,D3',
      '8,PISO,CLK_CORRIMIENTO,1,1010,0000,0,-',
    ])
    expect(csv).toBe(expected)
  })

  it('TAB-05: CSV de PIPO idéntico a la secuencia canónica', () => {
    const state = runSequence('PIPO', PIPO_CANONICA)
    const rows = buildTableRows(state.history, 'PIPO')
    const csv = toCsv(rows)
    const expected = csvFromLines([
      'paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea',
      '0,PIPO,INICIO,-,0000,0000,-,-',
      '1,PIPO,ENTRADA,-,1000,0000,-,-',
      '2,PIPO,ENTRADA,-,1010,0000,-,-',
      '3,PIPO,CLK,-,1010,1010,-,-',
      '4,PIPO,ENTRADA,-,0010,1010,-,-',
      '5,PIPO,ENTRADA,-,0110,1010,-,-',
      '6,PIPO,ENTRADA,-,0100,1010,-,-',
      '7,PIPO,ENTRADA,-,0101,1010,-,-',
      '8,PIPO,CLK,-,0101,0101,-,-',
    ])
    expect(csv).toBe(expected)
  })

  it('agrega BOM cuando se solicita', () => {
    const csv = toCsv([], { bom: true })
    expect(csv.startsWith('\uFEFF')).toBe(true)
  })
})

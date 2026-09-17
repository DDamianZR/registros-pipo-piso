import { toBitString } from './bits'
import type { EventCode, HistoryEntry, SimKind } from './simulator'

export interface TableRow {
  paso: number
  modo: SimKind
  evento: EventCode
  shLd: string
  d3d0: string
  q3q0: string
  serOut: string
  bitEnLinea: string
  observacion: string
}

const CSV_HEADER = 'paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea'

function buildObservation(entry: HistoryEntry): string {
  switch (entry.event) {
    case 'INICIO':
      return 'Estado inicial: Q = 0000.'
    case 'ENTRADA':
      return `D = ${toBitString(entry.inputs)}. Sin flanco: Q se mantiene en ${toBitString(entry.q)}.`
    case 'CONTROL': {
      const modoTexto = entry.shLd === 0 ? 'CARGA' : 'CORRIMIENTO'
      return `SH/LD̅ = ${entry.shLd} (${modoTexto}). Q no cambia hasta el próximo flanco.`
    }
    case 'CLK':
      return `Carga paralela: Q ← D = ${toBitString(entry.q)}.`
    case 'CLK_CARGA':
      return `Carga paralela: Q ← D = ${toBitString(entry.q)}. SER_OUT presenta D0.`
    case 'CLK_CORRIMIENTO':
      return entry.bitOnLine !== null
        ? `Corrimiento hacia Q0 (entra 0 por Q3). SER_OUT presenta D${entry.bitOnLine}.`
        : 'Corrimiento: registro vacío, SER_OUT = 0.'
    case 'CLR':
      return 'Borrado asíncrono: Q = 0000.'
    default:
      return ''
  }
}

export function buildTableRows(history: HistoryEntry[], kind: SimKind): TableRow[] {
  return history.map((entry) => ({
    paso: entry.step,
    modo: kind,
    evento: entry.event,
    shLd: kind === 'PIPO' ? '-' : String(entry.shLd),
    d3d0: toBitString(entry.inputs),
    q3q0: toBitString(entry.q),
    serOut: kind === 'PIPO' ? '-' : String(entry.serOut ?? 0),
    bitEnLinea: kind === 'PIPO' ? '-' : entry.bitOnLine !== null ? `D${entry.bitOnLine}` : '-',
    observacion: buildObservation(entry),
  }))
}

export function toCsv(rows: TableRow[], options?: { bom?: boolean }): string {
  const lines = [
    CSV_HEADER,
    ...rows.map((row) =>
      [row.paso, row.modo, row.evento, row.shLd, row.d3d0, row.q3q0, row.serOut, row.bitEnLinea].join(','),
    ),
  ]
  const body = `${lines.join('\r\n')}\r\n`
  return options?.bom ? `\uFEFF${body}` : body
}

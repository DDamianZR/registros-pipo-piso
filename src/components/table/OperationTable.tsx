import { useEffect, useRef } from 'react'
import { buildTableRows, toCsv } from '../../logic/table'
import type { EventCode, HistoryEntry, SimAction, SimKind } from '../../logic/simulator'

interface OperationTableProps {
  history: HistoryEntry[]
  kind: SimKind
  dispatch: (action: SimAction) => void
}

const ETIQUETAS_EVENTO: Record<EventCode, string> = {
  INICIO: 'Inicio',
  ENTRADA: 'Cambio de entrada',
  CONTROL: 'Cambio SH/LD̅',
  CLK: 'Flanco ↑ (carga)',
  CLK_CARGA: 'Flanco ↑ (carga)',
  CLK_CORRIMIENTO: 'Flanco ↑ (corrimiento)',
  CLR: 'Borrado (CLR)',
}

const EVENTOS_RELOJ = new Set<EventCode>(['CLK', 'CLK_CARGA', 'CLK_CORRIMIENTO'])

function OperationTable({ history, kind, dispatch }: OperationTableProps) {
  const rows = buildTableRows(history, kind)
  const contenedorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = contenedorRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [rows.length])

  function exportarCsv() {
    const csv = toCsv(rows, { bom: true })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = kind === 'PIPO' ? 'tabla-pipo.csv' : 'tabla-piso.csv'
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="tabla-funcionamiento">
      <div className="tabla-funcionamiento__acciones">
        <button type="button" className="boton-pulso" onClick={exportarCsv}>
          Exportar CSV
        </button>
        <button type="button" className="boton-pulso" onClick={() => dispatch({ type: 'RESET_SIMULATION' })}>
          Reiniciar simulación
        </button>
      </div>

      <div className="tabla-funcionamiento__contenedor" ref={contenedorRef}>
        <table className="tabla-funcionamiento__tabla">
          <thead>
            <tr>
              <th>Paso</th>
              <th>Evento</th>
              {kind === 'PISO' && <th>SH/LD̅</th>}
              <th>CLK</th>
              <th>CLR</th>
              <th>D3 D2 D1 D0</th>
              <th>Q3 Q2 Q1 Q0</th>
              {kind === 'PISO' && <th>SER_OUT</th>}
              {kind === 'PISO' && <th>Bit en línea</th>}
              <th>Observación</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.paso} className="mono" aria-current={index === rows.length - 1 ? 'true' : undefined}>
                <td>{row.paso}</td>
                <td>{ETIQUETAS_EVENTO[row.evento]}</td>
                {kind === 'PISO' && <td>{row.shLd}</td>}
                <td>{EVENTOS_RELOJ.has(row.evento) ? '↑' : '—'}</td>
                <td>{row.evento === 'CLR' ? '↑' : '—'}</td>
                <td>{row.d3d0}</td>
                <td>{row.q3q0}</td>
                {kind === 'PISO' && <td>{row.serOut}</td>}
                {kind === 'PISO' && <td>{row.bitEnLinea}</td>}
                <td>{row.observacion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="tabla-funcionamiento__nota">Se conservan los últimos 64 pasos.</p>
    </div>
  )
}

export default OperationTable

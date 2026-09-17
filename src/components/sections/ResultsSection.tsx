import { buildTableRows } from '../../logic/table'
import { PIPO_CANONICA, PISO_CANONICA, runSequence } from '../../logic/vectors'
import type { SimKind } from '../../logic/simulator'
import { describeSequence } from '../../logic/procedure'
import EvidenceGallery from './EvidenceGallery'

function filasDe(kind: SimKind) {
  const acciones = kind === 'PIPO' ? PIPO_CANONICA : PISO_CANONICA
  const estado = runSequence(kind, acciones)
  return buildTableRows(estado.history, kind)
}

const pasosPipo = describeSequence('PIPO', PIPO_CANONICA)
const pasosPiso = describeSequence('PISO', PISO_CANONICA)

function ResultsSection() {
  const filasPipo = filasDe('PIPO')
  const filasPiso = filasDe('PISO')

  return (
    <>
      <h3>Secuencia de referencia PIPO</h3>
      <p>Secuencia ejecutada paso a paso:</p>
      <ol className="pasos-uso">
        {pasosPipo.map((paso) => (
          <li key={paso.numero}>
            {paso.accion}
            <br />
            <span className="mono">{paso.resultado}</span>
          </li>
        ))}
      </ol>
      <p>
        La tabla demuestra la captura simultánea de los 4 bits en el flanco de reloj y la retención de Q entre
        flancos, aunque D cambie mientras tanto.
      </p>
      <div className="tabla-resultados__contenedor">
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Paso</th>
              <th>Evento</th>
              <th>D3 D2 D1 D0</th>
              <th>Q3 Q2 Q1 Q0</th>
            </tr>
          </thead>
          <tbody>
            {filasPipo.map((row) => (
              <tr key={row.paso} className="mono">
                <td>{row.paso}</td>
                <td>{row.evento}</td>
                <td>{row.d3d0}</td>
                <td>{row.q3q0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Secuencia de referencia PISO</h3>
      <p>Secuencia ejecutada paso a paso:</p>
      <ol className="pasos-uso">
        {pasosPiso.map((paso) => (
          <li key={paso.numero}>
            {paso.accion}
            <br />
            <span className="mono">{paso.resultado}</span>
          </li>
        ))}
      </ol>
      <p>
        SER_OUT presenta los bits en orden LSB primero (0, 1, 0, 1 para 1010) y el registro queda vacío (0000) tras
        el cuarto corrimiento.
      </p>
      <div className="tabla-resultados__contenedor">
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Paso</th>
              <th>Evento</th>
              <th>SH/LD̅</th>
              <th>Q3 Q2 Q1 Q0</th>
              <th>SER_OUT</th>
              <th>Bit en línea</th>
            </tr>
          </thead>
          <tbody>
            {filasPiso.map((row) => (
              <tr key={row.paso} className="mono">
                <td>{row.paso}</td>
                <td>{row.evento}</td>
                <td>{row.shLd}</td>
                <td>{row.q3q0}</td>
                <td>{row.serOut}</td>
                <td>{row.bitEnLinea}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Checklist de validación física</h3>
      <ul>
        <li>Alimentación y prueba de lámparas al arrancar (los 5 LEDs encienden 0.5 s).</li>
        <li>Cada switch D3–D0 enciende el bit correcto en la fila "Cambio de entrada".</li>
        <li>20 pulsaciones del botón CLK producen exactamente 20 flancos registrados (antirrebote).</li>
        <li>CLR pone Q en 0000 de inmediato, sin necesidad de un pulso de reloj.</li>
        <li>La secuencia canónica por Monitor Serie coincide línea por línea con el CSV exportado de la web.</li>
      </ul>

      <EvidenceGallery />
    </>
  )
}

export default ResultsSection

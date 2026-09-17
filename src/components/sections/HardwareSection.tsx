import { materiales } from '../../content/materiales'
import { pines } from '../../content/pines'
import { equivalencias } from '../../content/equivalencias'
import { describeSequence } from '../../logic/procedure'
import { PIPO_CANONICA, PISO_CANONICA } from '../../logic/vectors'
import WiringDiagram from './WiringDiagram'
import CodeViewer from './CodeViewer'

const pasosPipo = describeSequence('PIPO', PIPO_CANONICA)
const pasosPiso = describeSequence('PISO', PISO_CANONICA)

function HardwareSection() {
  return (
    <>
      <h3>Materiales</h3>
      <div className="tabla-resultados__contenedor">
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Cant.</th>
              <th>Componente</th>
              <th>Uso</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((material) => (
              <tr key={material.componente}>
                <td>{material.cantidad}</td>
                <td>{material.componente}</td>
                <td>{material.uso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Mapa de pines</h3>
      <div className="tabla-resultados__contenedor">
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Pin</th>
              <th>Dirección</th>
              <th>Elemento</th>
              <th>Lógica</th>
            </tr>
          </thead>
          <tbody>
            {pines.map((info) => (
              <tr key={info.pin} className="mono">
                <td>{info.pin}</td>
                <td>{info.direccion}</td>
                <td>{info.elemento}</td>
                <td>{info.logica}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Todas las entradas usan la resistencia interna <code className="mono">INPUT_PULLUP</code>: no se necesita el
        riel de 5 V para los switches ni resistencias externas, y no se conecta ningún switch directamente a 5 V.
      </p>

      <h3>Equivalencias web ↔ hardware</h3>
      <div className="tabla-resultados__contenedor">
        <table className="tabla-resultados">
          <thead>
            <tr>
              <th>Web</th>
              <th>Hardware</th>
            </tr>
          </thead>
          <tbody>
            {equivalencias.map((fila) => (
              <tr key={fila.web}>
                <td>{fila.web}</td>
                <td>{fila.hardware}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Diagrama de conexiones</h3>
      <WiringDiagram />

      <h3>Entradas flotantes, antirrebote y modo</h3>
      <p>
        Cada entrada usa <code className="mono">INPUT_PULLUP</code>: un switch abierto se lee HIGH (0 lógico) y uno
        cerrado LOW (1 lógico); así ningún pin queda flotante.
      </p>
      <p>
        El sketch acepta un cambio solo si se mantiene estable 30 ms. Cada pulsación de CLK produce exactamente un
        flanco, aunque se mantenga presionado.
      </p>
      <p>
        Conmutar el switch MODO reinicia el registro (Q = 0000, paso 0) e imprime un nuevo encabezado, igual que
        «Reiniciar simulación» en la web.
      </p>

      <h3>Armado</h3>
      <ol className="pasos-uso">
        <li>Conecta el pin GND de Arduino al riel GND de la protoboard.</li>
        <li>Coloca los LEDs con su resistencia de 330 Ω en serie hacia el pin correspondiente; el cátodo va al riel GND.</li>
        <li>Coloca el DIP switch o los interruptores deslizables; una terminal de cada posición va al riel GND.</li>
        <li>Coloca los pulsadores CLK y CLR sobre el canal central, conectando patas en diagonal.</li>
        <li>Conecta el cable USB al final, cuando todo el cableado esté revisado.</li>
      </ol>

      <h3>Código del sketch</h3>
      <CodeViewer />

      <h3>Uso del Monitor Serie</h3>
      <p>
        Abre el Monitor Serie a 115200 baudios. Cada evento imprime una fila con el mismo formato CSV que exporta la
        tabla de la web, así que la secuencia canónica ejecutada en el hardware puede compararse línea por línea con
        el CSV descargado desde el laboratorio. El encabezado es:
      </p>
      <pre className="bloque-linea mono">paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea</pre>

      <h3>Procedimiento de prueba canónico</h3>
      <p>Condiciones iniciales:</p>
      <ul className="pasos-uso">
        <li>D3–D0 y SH/LD̅ en OFF.</li>
        <li>MODO en OFF para PIPO u ON para PISO.</li>
        <li>Presionar RESET de la placa.</li>
        <li>Abrir el Monitor Serie a 115200 baudios.</li>
      </ul>
      <p>PIPO:</p>
      <ol className="pasos-uso">
        {pasosPipo.map((paso) => (
          <li key={paso.numero}>
            {paso.accion}
            <br />
            <span className="mono">{paso.resultado}</span>
          </li>
        ))}
      </ol>
      <p>PISO:</p>
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
        Criterio: las líneas del Monitor Serie (ignorando las que empiezan con #) deben coincidir exactamente con el
        CSV exportado de la web tras la misma secuencia.
      </p>
    </>
  )
}

export default HardwareSection

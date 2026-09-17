import { materiales } from '../../content/materiales'
import { pines } from '../../content/pines'
import WiringDiagram from './WiringDiagram'
import CodeViewer from './CodeViewer'

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

      <h3>Diagrama de conexiones</h3>
      <WiringDiagram />

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
        tabla de la web (<code className="mono">paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea</code>), así
        que la secuencia canónica ejecutada en el hardware puede compararse línea por línea con el CSV descargado
        desde el laboratorio interactivo.
      </p>
    </>
  )
}

export default HardwareSection

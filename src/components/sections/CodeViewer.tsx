import { useState } from 'react'
import sketchSource from '../../../arduino/registros_pipo_piso/registros_pipo_piso.ino?raw'

function CodeViewer() {
  const [copiado, setCopiado] = useState(false)

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(sketchSource)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  function descargarIno() {
    const blob = new Blob([sketchSource], { type: 'text/x-arduino' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'registros_pipo_piso.ino'
    document.body.appendChild(enlace)
    enlace.click()
    document.body.removeChild(enlace)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="visor-codigo">
      <div className="visor-codigo__acciones">
        <button type="button" className="boton-pulso" onClick={copiarCodigo}>
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
        <button type="button" className="boton-pulso" onClick={descargarIno}>
          Descargar .ino
        </button>
      </div>
      <pre className="visor-codigo__pre mono">
        <code>{sketchSource}</code>
      </pre>
    </div>
  )
}

export default CodeViewer

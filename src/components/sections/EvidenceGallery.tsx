const fotos = import.meta.glob('../../assets/fotos/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function piePagina(ruta: string): string {
  const archivo = ruta.split('/').pop() ?? ''
  const sinExtension = archivo.replace(/\.[^.]+$/, '')
  const sinNumero = sinExtension.replace(/^\d+-/, '')
  const conEspacios = sinNumero.replace(/-/g, ' ')
  return conEspacios.charAt(0).toUpperCase() + conEspacios.slice(1)
}

function EvidenceGallery() {
  const entradas = Object.entries(fotos)
  if (entradas.length === 0) return null

  return (
    <div className="galeria-evidencia">
      {entradas.map(([ruta, url]) => (
        <figure key={ruta} className="galeria-evidencia__item">
          <img src={url} alt={piePagina(ruta)} loading="lazy" />
          <figcaption>{piePagina(ruta)}</figcaption>
        </figure>
      ))}
    </div>
  )
}

export default EvidenceGallery

import { proyecto } from '../../content/proyecto'

function SiteFooter() {
  return (
    <footer className="sitio-footer">
      <p>
        {proyecto.practica} · {proyecto.materia}
      </p>
      {proyecto.autores.length > 0 && <p>{proyecto.autores.join(' · ')}</p>}
      {proyecto.urlRepositorio && (
        <p>
          <a href={proyecto.urlRepositorio}>Repositorio en GitHub</a>
        </p>
      )}
      <p>Simulación didáctica de comportamiento.</p>
    </footer>
  )
}

export default SiteFooter

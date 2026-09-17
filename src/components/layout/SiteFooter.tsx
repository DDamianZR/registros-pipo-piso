import { proyecto } from '../../content/proyecto'

function SiteFooter() {
  return (
    <footer className="sitio-footer">
      <p>
        {proyecto.practica} · {proyecto.materia} · Grupo {proyecto.grupo} · Semestre {proyecto.semestre}
      </p>
      {proyecto.autores.length > 0 && <p>Equipo: {proyecto.autores.join(' · ')}</p>}
      <p>Profesora: {proyecto.profesora}</p>
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

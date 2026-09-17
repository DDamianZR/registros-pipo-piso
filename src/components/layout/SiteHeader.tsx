import { useEffect, useState } from 'react'

const ENLACES = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'fundamentos', label: 'Fundamentos' },
  { id: 'laboratorio', label: 'Laboratorio' },
  { id: 'tiempos', label: 'Tiempos' },
  { id: 'tabla', label: 'Tabla' },
  { id: 'arduino', label: 'Arduino' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'preguntas', label: 'Preguntas' },
]

function SiteHeader() {
  const [activeId, setActiveId] = useState('inicio')
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    const secciones = ENLACES.map((enlace) => document.getElementById(enlace.id)).filter(
      (elemento): elemento is HTMLElement => elemento !== null,
    )

    const observer = new IntersectionObserver(
      (entries) => {
        const visibles = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visibles.length > 0) {
          setActiveId(visibles[0].target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )

    secciones.forEach((seccion) => observer.observe(seccion))
    return () => observer.disconnect()
  }, [])

  return (
    <header className="sitio-header">
      <a href="#inicio" className="sitio-header__marca">
        Registros PIPO y PISO
      </a>
      <button
        type="button"
        className="sitio-header__menu-boton"
        onClick={() => setMenuAbierto((abierto) => !abierto)}
        aria-expanded={menuAbierto}
        aria-controls="sitio-header-nav"
      >
        Menú
      </button>
      <nav
        id="sitio-header-nav"
        className={`sitio-header__nav${menuAbierto ? ' sitio-header__nav--abierto' : ''}`}
        aria-label="Secciones de la página"
      >
        {ENLACES.map((enlace) => (
          <a
            key={enlace.id}
            href={`#${enlace.id}`}
            className="sitio-header__enlace"
            aria-current={activeId === enlace.id ? 'true' : undefined}
            onClick={() => setMenuAbierto(false)}
          >
            {enlace.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

export default SiteHeader

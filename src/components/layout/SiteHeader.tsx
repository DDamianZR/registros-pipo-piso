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

function calcularActivo(): string {
  let activo = 'inicio'
  for (const enlace of ENLACES) {
    const elemento = document.getElementById(enlace.id)
    if (elemento && elemento.getBoundingClientRect().top <= 120) {
      activo = enlace.id
    }
  }
  return activo
}

function SiteHeader() {
  const [activeId, setActiveId] = useState('inicio')
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    let cuadroPendiente: number | null = null

    const programarActualizacion = () => {
      if (cuadroPendiente !== null) return
      cuadroPendiente = requestAnimationFrame(() => {
        cuadroPendiente = null
        setActiveId(calcularActivo())
      })
    }

    setActiveId(calcularActivo())
    window.addEventListener('scroll', programarActualizacion, { passive: true })
    window.addEventListener('resize', programarActualizacion, { passive: true })

    return () => {
      window.removeEventListener('scroll', programarActualizacion)
      window.removeEventListener('resize', programarActualizacion)
      if (cuadroPendiente !== null) {
        cancelAnimationFrame(cuadroPendiente)
      }
    }
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

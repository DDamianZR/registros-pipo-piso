import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  eyebrow?: string
  title: string
  children: ReactNode
  wide?: boolean
}

function Section({ id, eyebrow, title, children, wide = false }: SectionProps) {
  return (
    <section id={id} className={`seccion${wide ? ' seccion--ancha' : ''}`} aria-labelledby={`${id}-titulo`}>
      {eyebrow && <p className="seccion__eyebrow">{eyebrow}</p>}
      <h2 id={`${id}-titulo`}>{title}</h2>
      {children}
    </section>
  )
}

export default Section

import type { ReactNode } from 'react'

interface SectionProps {
  id: string
  eyebrow?: string
  title: string
  children: ReactNode
  wide?: boolean
  headingLevel?: 1 | 2
}

function Section({ id, eyebrow, title, children, wide = false, headingLevel = 2 }: SectionProps) {
  const HeadingTag = headingLevel === 1 ? 'h1' : 'h2'
  return (
    <section id={id} className={`seccion${wide ? ' seccion--ancha' : ''}`} aria-labelledby={`${id}-titulo`}>
      {eyebrow && <p className="seccion__eyebrow">{eyebrow}</p>}
      <HeadingTag id={`${id}-titulo`}>{title}</HeadingTag>
      {children}
    </section>
  )
}

export default Section

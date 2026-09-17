interface LedProps {
  label: string
  on: boolean
  tone?: 'q' | 'serial'
  size?: 'sm' | 'md'
}

function Led({ label, on, tone = 'q', size = 'md' }: LedProps) {
  return (
    <span
      role="img"
      aria-label={`${label} = ${on ? 1 : 0}`}
      className={`led led--${tone} led--${size}${on ? ' led--on' : ''}`}
    >
      <span className="led__etiqueta">{label}</span>
    </span>
  )
}

export default Led

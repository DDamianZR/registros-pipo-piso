interface BitSwitchProps {
  label: string
  value: 0 | 1
  onToggle: () => void
  disabled?: boolean
}

function BitSwitch({ label, value, onToggle, disabled = false }: BitSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value === 1}
      aria-label={`${label} = ${value}`}
      className={`interruptor-bit${value === 1 ? ' interruptor-bit--on' : ''}`}
      onClick={onToggle}
      disabled={disabled}
    >
      <span className="interruptor-bit__etiqueta">{label}</span>
      <span className="interruptor-bit__valor">{value}</span>
    </button>
  )
}

export default BitSwitch

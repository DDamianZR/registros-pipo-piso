interface SegmentedOption {
  value: string
  label: string
}

interface SegmentedControlProps {
  options: SegmentedOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  mode: 'tabs' | 'radio'
  idPrefix?: string
}

function SegmentedControl({ options, value, onChange, ariaLabel, mode, idPrefix }: SegmentedControlProps) {
  const contenedorRole = mode === 'tabs' ? 'tablist' : 'radiogroup'
  const opcionRole = mode === 'tabs' ? 'tab' : 'radio'

  return (
    <div className="control-segmentado" role={contenedorRole} aria-label={ariaLabel}>
      {options.map((option) => {
        const activa = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role={opcionRole}
            id={mode === 'tabs' && idPrefix ? `${idPrefix}-${option.value}` : undefined}
            aria-selected={mode === 'tabs' ? activa : undefined}
            aria-checked={mode === 'radio' ? activa : undefined}
            aria-controls={mode === 'tabs' && idPrefix ? `${idPrefix}-panel` : undefined}
            className={`control-segmentado__opcion${activa ? ' control-segmentado__opcion--activa' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default SegmentedControl

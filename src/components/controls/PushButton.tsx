import { useState } from 'react'

interface PushButtonProps {
  label: string
  onPress: () => void
  variant?: 'clock' | 'clear' | 'neutral'
}

function PushButton({ label, onPress, variant = 'neutral' }: PushButtonProps) {
  const [presionado, setPresionado] = useState(false)

  function manejarClic() {
    setPresionado(true)
    onPress()
    window.setTimeout(() => setPresionado(false), 120)
  }

  return (
    <button
      type="button"
      className={`boton-pulso boton-pulso--${variant}${presionado ? ' boton-pulso--presionado' : ''}`}
      onClick={manejarClic}
    >
      {label}
    </button>
  )
}

export default PushButton

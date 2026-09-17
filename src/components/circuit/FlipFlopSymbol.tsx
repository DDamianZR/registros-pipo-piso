interface FlipFlopSymbolProps {
  x: number
  y: number
  width: number
  height: number
  label: string
  bit: 0 | 1
  flash: boolean
}

function FlipFlopSymbol({ x, y, width, height, label, bit, flash }: FlipFlopSymbolProps) {
  const midY = y + height / 2
  const clockY = y + height - 16

  return (
    <g className={`ff-simbolo${flash ? ' ff-simbolo--flash' : ''}`}>
      <rect x={x} y={y} width={width} height={height} rx={6} className="ff-simbolo__cuerpo" />
      <text x={x + width / 2} y={y - 10} textAnchor="middle" className="ff-simbolo__etiqueta">
        {label}
      </text>
      <text x={x + width / 2} y={midY + 8} textAnchor="middle" className="ff-simbolo__bit mono">
        {bit}
      </text>
      <text x={x + 8} y={y + 18} className="ff-simbolo__pin">
        D
      </text>
      <text x={x + width - 8} y={y + 18} textAnchor="end" className="ff-simbolo__pin">
        Q
      </text>
      <path d={`M ${x + 8} ${clockY - 6} L ${x + 18} ${clockY} L ${x + 8} ${clockY + 6}`} className="ff-simbolo__reloj" />
      <text x={x + 24} y={clockY + 4} className="ff-simbolo__pin-chico">
        CLK
      </text>
      <text x={x + width - 8} y={y + height - 6} textAnchor="end" className="ff-simbolo__pin-chico">
        CLR
      </text>
    </g>
  )
}

export default FlipFlopSymbol

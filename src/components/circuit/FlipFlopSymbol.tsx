interface FlipFlopSymbolProps {
  x: number
  y: number
  width: number
  height: number
  flash: boolean
}

function FlipFlopSymbol({ x, y, width, height, flash }: FlipFlopSymbolProps) {
  const clockPoints = `${x} ${y + 58} L ${x + 10} ${y + 66} L ${x} ${y + 74}`

  return (
    <g className={`ff-simbolo${flash ? ' ff-simbolo--flash' : ''}`}>
      <rect x={x} y={y} width={width} height={height} rx={6} className="ff-simbolo__cuerpo" />
      <path d={`M ${clockPoints}`} className="ff-simbolo__reloj" />
    </g>
  )
}

export default FlipFlopSymbol

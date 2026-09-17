interface MuxSymbolProps {
  x: number
  y: number
  width: number
  height: number
  outputValue: 0 | 1
}

const BOTTOM_WIDTH = 26

function MuxSymbol({ x, y, width, height, outputValue }: MuxSymbolProps) {
  const bottomY = y + height
  const bottomX = x + (width - BOTTOM_WIDTH) / 2
  const points = `${x},${y} ${x + width},${y} ${bottomX + BOTTOM_WIDTH},${bottomY} ${bottomX},${bottomY}`

  return (
    <g className="mux-simbolo">
      <polygon points={points} className="mux-simbolo__cuerpo" />
      <text x={x + 16} y={y - 6} textAnchor="middle" className="mux-simbolo__pin">
        0
      </text>
      <text x={x + width - 16} y={y - 6} textAnchor="middle" className="mux-simbolo__pin">
        1
      </text>
      <text x={x + width / 2} y={bottomY + 16} textAnchor="middle" className="mux-simbolo__salida mono">
        {outputValue}
      </text>
    </g>
  )
}

export default MuxSymbol

interface MuxSymbolProps {
  x: number
  y: number
  width: number
  height: number
}

function MuxSymbol({ x, y, width, height }: MuxSymbolProps) {
  return <rect x={x} y={y} width={width} height={height} rx={4} className="mux-simbolo__cuerpo" />
}

export default MuxSymbol

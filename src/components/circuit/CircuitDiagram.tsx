import { useEffect, useMemo, useState } from 'react'
import type { SimState } from '../../logic/simulator'
import type { Body, Geometry, LabelSpec, Net } from '../geometry/geometry'
import FlipFlopSymbol from './FlipFlopSymbol'
import MuxSymbol from './MuxSymbol'
import { bindText, buildPipoGeometry, buildPisoGeometry, netActive, netLevel } from './circuitGeometry'

interface CircuitDiagramProps {
  state: SimState
}

type FlashKind = 'clock' | 'clr' | null

function useEdgeFlash(state: SimState): FlashKind {
  const [flash, setFlash] = useState<FlashKind>(null)
  const lastEntry = state.history[state.history.length - 1]

  useEffect(() => {
    if (typeof window === 'undefined' || !lastEntry) return undefined
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    if (lastEntry.event === 'CLK' || lastEntry.event === 'CLK_CARGA' || lastEntry.event === 'CLK_CORRIMIENTO') {
      setFlash('clock')
    } else if (lastEntry.event === 'CLR') {
      setFlash('clr')
    } else {
      return undefined
    }

    const timer = window.setTimeout(() => setFlash(null), 400)
    return () => window.clearTimeout(timer)
  }, [state.history.length, lastEntry?.event])

  return flash
}

function orthPath(x1: number, y1: number, x2: number, y2: number): string {
  return `M ${x1} ${y1} L ${x2} ${y2}`
}

function netClass(net: Net, state: SimState, flash: FlashKind): string {
  if (net.id === 'clk') return `bus bus--clk${flash === 'clock' ? ' bus--flash' : ''}`
  if (net.id === 'clr') return `bus bus--clr${flash === 'clr' ? ' bus--flash' : ''}`
  if (net.id === 'shld') return 'bus bus--control'

  const nivel = netLevel(net.id, state)
  const claseNivel = nivel === 1 ? 'hilo--alto' : 'hilo--bajo'
  const activa = netActive(net.id, state)
  return `hilo ${claseNivel}${activa ? '' : ' hilo--inactivo'}`
}

function labelClassFor(id: string): string {
  if (id.startsWith('termD') || id.startsWith('termSerIn')) {
    return id.endsWith('-nombre') ? 'terminal__nombre' : 'terminal__etiqueta mono'
  }
  if (id.startsWith('ff')) {
    if (id.endsWith('-d') || id.endsWith('-q')) return 'ff-simbolo__pin'
    if (id.endsWith('-bit')) return 'ff-simbolo__bit mono'
    if (id.endsWith('-clr')) return 'ff-simbolo__pin-chico'
    if (id.endsWith('-nombre')) return 'ff-simbolo__etiqueta'
  }
  if (id.startsWith('mux')) {
    if (id.endsWith('-valor')) return 'mux-simbolo__salida mono'
    return 'mux-simbolo__pin'
  }
  if (id.startsWith('ledQ') || id.startsWith('ledSerOut')) return 'led-svg__etiqueta'
  if (id === 'clk-etiqueta' || id === 'clr-etiqueta' || id === 'shld-etiqueta') return 'bus__etiqueta'
  if (id === 'leyenda-2') return 'leyenda-chica'
  return 'leyenda'
}

function labelText(label: LabelSpec, state: SimState): string {
  return label.bind ? bindText(label.bind, state) : label.text
}

function isMuxPinActivo(label: LabelSpec, state: SimState): boolean {
  if (state.kind !== 'PISO') return false
  const match = /^mux\d-([01])$/.exec(label.id)
  if (!match) return false
  return Number(match[1]) === state.shLd
}

function DiagramBody({ body, state, flash }: { body: Body; state: SimState; flash: FlashKind }) {
  const { rect } = body
  switch (body.kind) {
    case 'ff':
      return <FlipFlopSymbol x={rect.x} y={rect.y} width={rect.w} height={rect.h} flash={flash === 'clock'} />
    case 'mux':
      return <MuxSymbol x={rect.x} y={rect.y} width={rect.w} height={rect.h} />
    case 'terminal':
      return <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={4} className="terminal" />
    case 'led-q':
    case 'led-serial': {
      const netId = body.kind === 'led-q' ? `q${body.id.replace('ledQ', '')}` : 'serOut'
      const on = netLevel(netId, state) === 1
      const tono = body.kind === 'led-q' ? 'q' : 'serial'
      const cx = rect.x + rect.w / 2
      const cy = rect.y + rect.h / 2
      return <circle cx={cx} cy={cy} r={9} className={`led-svg led-svg--${tono}${on ? ' led-svg--on' : ''}`} />
    }
    default:
      return null
  }
}

function CircuitDiagramSvg({
  geometry,
  state,
  flash,
  titulo,
}: {
  geometry: Geometry
  state: SimState
  flash: FlashKind
  titulo: string
}) {
  return (
    <svg
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      width="100%"
      role="img"
      preserveAspectRatio="xMidYMid meet"
      className="diagrama-circuito"
    >
      <title>{titulo}</title>

      {geometry.nets.map((net) => {
        const clase = netClass(net, state, flash)
        return (
          <g key={net.id}>
            {net.segments.map((seg, index) => (
              <path key={index} d={orthPath(seg.x1, seg.y1, seg.x2, seg.y2)} className={clase} />
            ))}
          </g>
        )
      })}

      {geometry.nets.flatMap((net) =>
        net.junctions.map((j, index) => (
          <circle key={`${net.id}-union-${index}`} cx={j.x} cy={j.y} r={3} className="union" />
        )),
      )}

      {geometry.bodies.map((body) => (
        <DiagramBody key={body.id} body={body} state={state} flash={flash} />
      ))}

      {geometry.labels.map((label) => (
        <text
          key={label.id}
          x={label.x}
          y={label.y}
          textAnchor={label.anchor}
          fontSize={label.fontSize}
          className={`${labelClassFor(label.id)}${isMuxPinActivo(label, state) ? ' mux__pin--activo' : ''}`}
        >
          {labelText(label, state)}
        </text>
      ))}
    </svg>
  )
}

function CircuitDiagram({ state }: CircuitDiagramProps) {
  const flash = useEdgeFlash(state)
  const pipoGeometry = useMemo(() => buildPipoGeometry(), [])
  const pisoGeometry = useMemo(() => buildPisoGeometry(), [])

  if (state.kind === 'PIPO') {
    return (
      <CircuitDiagramSvg
        geometry={pipoGeometry}
        state={state}
        flash={flash}
        titulo="Diagrama lógico del registro PIPO: cuatro flip-flops D con reloj común"
      />
    )
  }

  return (
    <CircuitDiagramSvg
      geometry={pisoGeometry}
      state={state}
      flash={flash}
      titulo="Diagrama lógico del registro PISO: cuatro flip-flops D con multiplexor de corrimiento y reloj común"
    />
  )
}

export default CircuitDiagram

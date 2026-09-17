import type { Body, LabelSpec } from '../geometry/geometry'
import { buildWiringGeometry, tipoDePin } from './wiringGeometry'

const geometry = buildWiringGeometry()

function netStroke(netId: string): string {
  if (netId === 'gnd') return 'var(--text-muted)'
  const pin = netId.replace('sig', '')
  const tipo = tipoDePin(pin)
  if (tipo === 'led') return 'var(--sig-output)'
  if (tipo === 'pulsador') return 'var(--sig-clock)'
  return 'var(--sig-input)'
}

function labelClassFor(id: string): string {
  if (id === 'arduino-titulo') return 'diagrama-conexiones__etiqueta'
  if (id.startsWith('pin-') || id === 'gnd-pin') return 'diagrama-conexiones__pin mono'
  if (id.startsWith('elemento-')) return 'diagrama-conexiones__bloque-texto'
  if (id.startsWith('res-')) return 'diagrama-conexiones__resistor-valor'
  return 'diagrama-conexiones__nota'
}

function ResistorBody({ rect }: { rect: Body['rect'] }) {
  return <rect x={rect.x} y={rect.y} width={rect.w} height={rect.h} rx={3} className="diagrama-conexiones__cuerpo" />
}

function LedFisicoBody({ rect }: { rect: Body['rect'] }) {
  const puntaX = rect.x + rect.w
  const medioY = rect.y + rect.h / 2
  const puntos = `${rect.x},${rect.y} ${rect.x},${rect.y + rect.h} ${puntaX},${medioY}`
  return (
    <g className="diagrama-conexiones__cuerpo">
      <polygon points={puntos} />
      <line x1={puntaX} y1={rect.y} x2={puntaX} y2={rect.y + rect.h} />
    </g>
  )
}

function SwitchBody({ rect }: { rect: Body['rect'] }) {
  const bottom = rect.y + rect.h
  return (
    <g>
      <circle cx={rect.x} cy={bottom} r={2.5} className="diagrama-conexiones__punto" />
      <circle cx={rect.x + rect.w} cy={bottom} r={2.5} className="diagrama-conexiones__punto" />
      <line
        x1={rect.x}
        y1={bottom}
        x2={rect.x + rect.w - 4}
        y2={bottom - 12}
        className="diagrama-conexiones__cuerpo"
      />
    </g>
  )
}

function PulsadorBody({ rect }: { rect: Body['rect'] }) {
  const bottom = rect.y + rect.h
  const midX = rect.x + rect.w / 2
  return (
    <g>
      <circle cx={rect.x} cy={bottom} r={2.5} className="diagrama-conexiones__punto" />
      <circle cx={rect.x + rect.w} cy={bottom} r={2.5} className="diagrama-conexiones__punto" />
      <line x1={rect.x + 4} y1={bottom - 10} x2={rect.x + rect.w - 4} y2={bottom - 10} className="diagrama-conexiones__cuerpo" />
      <line x1={midX} y1={bottom - 10} x2={midX} y2={rect.y} className="diagrama-conexiones__cuerpo" />
    </g>
  )
}

function DiagramBody({ body }: { body: Body }) {
  switch (body.kind) {
    case 'arduino':
      return (
        <rect
          x={body.rect.x}
          y={body.rect.y}
          width={body.rect.w}
          height={body.rect.h}
          rx={8}
          className="diagrama-conexiones__arduino"
        />
      )
    case 'resistor':
      return <ResistorBody rect={body.rect} />
    case 'led-fisico':
      return <LedFisicoBody rect={body.rect} />
    case 'switch':
      return <SwitchBody rect={body.rect} />
    case 'pulsador':
      return <PulsadorBody rect={body.rect} />
    default:
      return null
  }
}

function labelText(label: LabelSpec): string {
  return label.text
}

function WiringDiagram() {
  return (
    <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} width="100%" role="img" className="diagrama-conexiones">
      <title>Diagrama de conexiones entre Arduino y los componentes del circuito, con resistencias, LEDs, switches, pulsadores y riel GND</title>

      {geometry.nets.map((net) => {
        const color = netStroke(net.id)
        return (
          <g key={net.id}>
            {net.segments.map((seg, index) => (
              <line
                key={index}
                x1={seg.x1}
                y1={seg.y1}
                x2={seg.x2}
                y2={seg.y2}
                className="diagrama-conexiones__cable"
                style={{ stroke: color }}
              />
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
        <DiagramBody key={body.id} body={body} />
      ))}

      {geometry.labels.map((label) => (
        <text key={label.id} x={label.x} y={label.y} textAnchor={label.anchor} className={labelClassFor(label.id)}>
          {labelText(label)}
        </text>
      ))}
    </svg>
  )
}

export default WiringDiagram

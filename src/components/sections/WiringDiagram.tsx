interface Fila {
  pin: string
  destino: string
  tipo: 'led' | 'switch' | 'pulsador'
}

const FILAS: Fila[] = [
  { pin: '12', destino: 'LED Q3', tipo: 'led' },
  { pin: '11', destino: 'LED Q2', tipo: 'led' },
  { pin: '10', destino: 'LED Q1', tipo: 'led' },
  { pin: '9', destino: 'LED Q0', tipo: 'led' },
  { pin: '8', destino: 'LED SER_OUT', tipo: 'led' },
  { pin: '7', destino: 'Switch D3', tipo: 'switch' },
  { pin: '6', destino: 'Switch D2', tipo: 'switch' },
  { pin: '5', destino: 'Switch D1', tipo: 'switch' },
  { pin: '4', destino: 'Switch D0', tipo: 'switch' },
  { pin: '3', destino: 'Pulsador CLR', tipo: 'pulsador' },
  { pin: '2', destino: 'Pulsador CLK', tipo: 'pulsador' },
  { pin: 'A0', destino: 'Switch SH/LD̅', tipo: 'switch' },
  { pin: 'A1', destino: 'Switch MODO', tipo: 'switch' },
]

const COLOR: Record<Fila['tipo'], string> = {
  led: 'var(--sig-output)',
  switch: 'var(--sig-input)',
  pulsador: 'var(--sig-clock)',
}

const ROW_H = 30
const TOP = 30
const ARDUINO_X = 40
const ARDUINO_W = 140
const TARGET_X = 620
const TARGET_W = 220

function WiringDiagram() {
  const height = TOP + FILAS.length * ROW_H + 70

  return (
    <svg viewBox={`0 0 900 ${height}`} width="100%" role="img" className="diagrama-conexiones">
      <title>Diagrama de bloques de las conexiones entre Arduino y los componentes del circuito</title>

      <rect
        x={ARDUINO_X}
        y={TOP}
        width={ARDUINO_W}
        height={FILAS.length * ROW_H}
        rx={8}
        className="diagrama-conexiones__arduino"
      />
      <text x={ARDUINO_X + ARDUINO_W / 2} y={TOP - 10} textAnchor="middle" className="diagrama-conexiones__etiqueta">
        Arduino UNO
      </text>

      {FILAS.map((fila, index) => {
        const y = TOP + ROW_H * index + ROW_H / 2
        return (
          <g key={fila.pin}>
            <text x={ARDUINO_X + ARDUINO_W - 10} y={y - 6} textAnchor="end" className="diagrama-conexiones__pin mono">
              {fila.pin}
            </text>
            <line
              x1={ARDUINO_X + ARDUINO_W}
              y1={y}
              x2={TARGET_X}
              y2={y}
              className="diagrama-conexiones__cable"
              style={{ stroke: COLOR[fila.tipo] }}
            />
            <rect x={TARGET_X} y={y - 12} width={TARGET_W} height={24} rx={6} className="diagrama-conexiones__bloque" />
            <text
              x={TARGET_X + TARGET_W / 2}
              y={y + 5}
              textAnchor="middle"
              className="diagrama-conexiones__bloque-texto mono"
            >
              {fila.destino}
            </text>
          </g>
        )
      })}

      <text x={ARDUINO_X} y={TOP + FILAS.length * ROW_H + 26} className="diagrama-conexiones__nota">
        GND de Arduino → riel GND común (switches, pulsadores y cátodos de LED).
      </text>
      <text x={ARDUINO_X} y={TOP + FILAS.length * ROW_H + 46} className="diagrama-conexiones__nota">
        D13 usa el LED integrado "L" de la placa; no requiere cableado externo.
      </text>
    </svg>
  )
}

export default WiringDiagram

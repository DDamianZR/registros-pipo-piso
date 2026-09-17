import { useEffect, useRef } from 'react'
import { buildTimingTrace } from '../../logic/timing'
import type { HistoryEntry, SimKind } from '../../logic/simulator'
import { highRuns, slotHeaderText, waveformPath } from './waveformPath'

interface TimingChartProps {
  history: HistoryEntry[]
  kind: SimKind
}

const SLOT_W = 44
const ROW_H = 28
const HEADER_H = 44
const LABEL_W = 72
const GROUP_GAP = 10

function colorFor(id: string): string {
  if (id === 'CLK' || id === 'CLR') return 'var(--sig-clock)'
  if (id === 'SH_LD') return 'var(--sig-control)'
  if (id === 'SER_OUT') return 'var(--sig-serial)'
  if (id.startsWith('D')) return 'var(--sig-input)'
  return 'var(--sig-output)'
}

function TimingChart({ history, kind }: TimingChartProps) {
  const trace = buildTimingTrace(history, kind)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [trace.windowEnd])

  const rowY: number[] = []
  let y = HEADER_H
  let prevGroup: string | null = null
  trace.signals.forEach((signal) => {
    if (prevGroup !== null && signal.group !== prevGroup) y += GROUP_GAP
    rowY.push(y)
    y += ROW_H
    prevGroup = signal.group
  })
  const annotationRowY = kind === 'PISO' ? y + 14 : y
  const totalHeight = kind === 'PISO' ? annotationRowY + 8 : y + 4
  const chartWidth = Math.max(trace.slots.length * SLOT_W, SLOT_W)

  return (
    <div className="carta-tiempos">
      <div className="carta-tiempos__cuerpo">
        <svg className="carta-tiempos__etiquetas" width={LABEL_W} height={totalHeight}>
          {trace.signals.map((signal, index) => (
            <text
              key={signal.id}
              x={8}
              y={rowY[index] + ROW_H / 2 + 4}
              className="carta-tiempos__etiqueta-fila mono"
              style={{ fill: colorFor(signal.id) }}
            >
              {signal.label}
            </text>
          ))}
        </svg>

        <div className="carta-tiempos__scroll" ref={scrollRef}>
          <svg width={chartWidth} height={totalHeight}>
            {trace.slots.map((slot, index) =>
              slot.isClockEdge ? (
                <line
                  key={`marca-${slot.step}`}
                  x1={index * SLOT_W}
                  y1={HEADER_H}
                  x2={index * SLOT_W}
                  y2={totalHeight}
                  className="carta-tiempos__marca"
                />
              ) : null,
            )}

            {trace.slots.map((slot, index) => (
              <text
                key={`paso-${slot.step}`}
                x={index * SLOT_W + SLOT_W / 2}
                y={14}
                textAnchor="middle"
                className={`carta-tiempos__paso${slot.isClockEdge ? ' carta-tiempos__paso--flanco' : ''}`}
              >
                {slotHeaderText(slot)}
              </text>
            ))}

            {trace.slots.map((slot, index) =>
              slot.label ? (
                <text
                  key={`evt-${slot.step}`}
                  x={index * SLOT_W + SLOT_W / 2}
                  y={32}
                  textAnchor="middle"
                  className="carta-tiempos__evento"
                >
                  {slot.label}
                </text>
              ) : null,
            )}

            {trace.signals.map((signal, rowIndex) => {
              if (signal.kind !== 'level') return null
              const yHigh = rowY[rowIndex] + 6
              const yLow = rowY[rowIndex] + ROW_H - 6
              return (
                <g key={`niveles-${signal.id}`}>
                  <line x1={0} y1={yLow} x2={chartWidth} y2={yLow} className="carta-tiempos__guia" />
                  {highRuns(signal.values).map((run, index) => (
                    <rect
                      key={index}
                      x={run.start * SLOT_W}
                      y={yHigh}
                      width={(run.end - run.start) * SLOT_W}
                      height={yLow - yHigh}
                      className="carta-tiempos__alto"
                    />
                  ))}
                </g>
              )
            })}

            {trace.signals.map((signal, rowIndex) => (
              <path
                key={signal.id}
                d={waveformPath(signal.values, signal.kind, SLOT_W, rowY[rowIndex] + 6, rowY[rowIndex] + ROW_H - 6)}
                className="carta-tiempos__onda"
                style={{ stroke: colorFor(signal.id) }}
              />
            ))}

            {kind === 'PISO' &&
              trace.annotations.map((annotation) => (
                <text
                  key={`anot-${annotation.slotIndex}`}
                  x={annotation.slotIndex * SLOT_W + SLOT_W / 2}
                  y={annotationRowY}
                  textAnchor="middle"
                  className="carta-tiempos__anotacion mono"
                >
                  {annotation.text}
                </text>
              ))}
          </svg>
        </div>
      </div>

      <p className="carta-tiempos__ventana">
        Mostrando pasos {trace.windowStart}–{trace.windowEnd}.
      </p>

      <ul className="carta-tiempos__leyenda">
        <li>↑ flanco de subida: los flip-flops capturan.</li>
        <li>Entre flancos, Q no cambia aunque cambie D.</li>
        <li>En PISO, SER_OUT = Q0; los bits salen en orden D0→D3.</li>
      </ul>
    </div>
  )
}

export default TimingChart

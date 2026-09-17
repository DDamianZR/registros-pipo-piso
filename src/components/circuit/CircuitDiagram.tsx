import { useEffect, useState } from 'react'
import { bitAt } from '../../logic/bits'
import { muxOutputs } from '../../logic/registers'
import type { SimState } from '../../logic/simulator'
import FlipFlopSymbol from './FlipFlopSymbol'
import MuxSymbol from './MuxSymbol'
import {
  BUS_X_END,
  BUS_X_START,
  FF_HEIGHT,
  FF_WIDTH,
  MUX_HEIGHT,
  MUX_WIDTH,
  PIPO_VIEWBOX,
  PIPO_Y_CLK_BUS,
  PIPO_Y_CLR_BUS,
  PIPO_Y_FF_BOTTOM,
  PIPO_Y_FF_TOP,
  PIPO_Y_LED_ROW,
  PIPO_Y_LEGEND,
  PIPO_Y_TERMINAL,
  PISO_VIEWBOX,
  PISO_Y_CLK_BUS,
  PISO_Y_CLR_BUS,
  PISO_Y_FEEDBACK_CHANNEL,
  PISO_Y_FF_BOTTOM,
  PISO_Y_FF_TOP,
  PISO_Y_GND_TOP,
  PISO_Y_LEGEND,
  PISO_Y_MUX_BOTTOM,
  PISO_Y_MUX_TOP,
  PISO_Y_PROBE,
  PISO_Y_SHLD_BUS,
  PISO_Y_TERMINAL,
  SER_OUT_X,
  STAGES,
  ffCenterX,
  ffX,
  muxX,
  orthPath,
} from './circuitLayout'

interface CircuitDiagramProps {
  state: SimState
}

type FlashKind = 'clock' | 'clr' | null

function wireClass(bit: 0 | 1, active = true): string {
  const nivel = bit === 1 ? 'hilo--alto' : 'hilo--bajo'
  return `hilo ${nivel}${active ? '' : ' hilo--inactivo'}`
}

function Union({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r={3} className="union" />
}

function LedIndicator({
  x,
  y,
  label,
  on,
  tone,
}: {
  x: number
  y: number
  label: string
  on: boolean
  tone: 'q' | 'serial'
}) {
  return (
    <g className={`led-svg led-svg--${tone}${on ? ' led-svg--on' : ''}`}>
      <circle cx={x} cy={y} r={9} className="led-svg__circulo" />
      <text x={x} y={y + 22} textAnchor="middle" className="led-svg__etiqueta">
        {label}
      </text>
    </g>
  )
}

function GroundSymbol({ x, y }: { x: number; y: number }) {
  return (
    <g className="gnd-simbolo">
      <line x1={x - 10} y1={y} x2={x + 10} y2={y} />
      <line x1={x - 6} y1={y + 5} x2={x + 6} y2={y + 5} />
      <line x1={x - 2} y1={y + 10} x2={x + 2} y2={y + 10} />
      <text x={x} y={y - 8} textAnchor="middle" className="gnd-simbolo__etiqueta">
        SER_IN = 0
      </text>
    </g>
  )
}

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

function PipoDiagram({ state, flash }: { state: SimState; flash: FlashKind }) {
  return (
    <svg viewBox={PIPO_VIEWBOX} width="100%" role="img" preserveAspectRatio="xMidYMid meet" className="diagrama-circuito">
      <title>Diagrama lógico del registro PIPO: cuatro flip-flops D con reloj común</title>

      <line
        x1={BUS_X_START}
        y1={PIPO_Y_CLK_BUS}
        x2={BUS_X_END}
        y2={PIPO_Y_CLK_BUS}
        className={`bus bus--clk${flash === 'clock' ? ' bus--flash' : ''}`}
      />
      <text x={BUS_X_START} y={PIPO_Y_CLK_BUS - 8} className="bus__etiqueta">
        CLK
      </text>

      <line
        x1={BUS_X_START}
        y1={PIPO_Y_CLR_BUS}
        x2={BUS_X_END}
        y2={PIPO_Y_CLR_BUS}
        className={`bus bus--clr${flash === 'clr' ? ' bus--flash' : ''}`}
      />
      <text x={BUS_X_START} y={PIPO_Y_CLR_BUS + 16} className="bus__etiqueta">
        CLR
      </text>

      {STAGES.map((i) => {
        const cx = ffCenterX(i)
        const dBit = bitAt(state.inputs, i)
        const qBit = bitAt(state.q, i)
        const clkStubX = ffX(i) + 20
        const clrStubX = ffX(i) + FF_WIDTH - 20

        return (
          <g key={i}>
            <rect x={cx - 16} y={PIPO_Y_TERMINAL - 16} width={32} height={22} rx={4} className="terminal" />
            <text x={cx} y={PIPO_Y_TERMINAL} textAnchor="middle" className="terminal__etiqueta mono">
              {dBit}
            </text>
            <text x={cx} y={PIPO_Y_TERMINAL - 22} textAnchor="middle" className="terminal__nombre">
              D{i}
            </text>

            <path d={orthPath([[cx, PIPO_Y_TERMINAL + 8], [cx, PIPO_Y_FF_TOP]])} className={wireClass(dBit)} />

            <FlipFlopSymbol
              x={ffX(i)}
              y={PIPO_Y_FF_TOP}
              width={FF_WIDTH}
              height={FF_HEIGHT}
              label={`FF${i}`}
              bit={qBit}
              flash={flash === 'clock'}
            />

            <path
              d={orthPath([[clkStubX, PIPO_Y_CLK_BUS], [clkStubX, PIPO_Y_FF_BOTTOM]])}
              className={`hilo hilo--reloj${flash === 'clock' ? ' hilo--flash' : ''}`}
            />
            <Union x={clkStubX} y={PIPO_Y_CLK_BUS} />
            <path
              d={orthPath([[clrStubX, PIPO_Y_CLR_BUS], [clrStubX, PIPO_Y_FF_BOTTOM]])}
              className={`hilo hilo--reloj${flash === 'clr' ? ' hilo--flash' : ''}`}
            />
            <Union x={clrStubX} y={PIPO_Y_CLR_BUS} />

            <path d={orthPath([[cx, PIPO_Y_FF_BOTTOM], [cx, PIPO_Y_LED_ROW - 12]])} className={wireClass(qBit)} />
            <LedIndicator x={cx} y={PIPO_Y_LED_ROW} label={`Q${i}`} on={qBit === 1} tone="q" />
          </g>
        )
      })}

      <text x={BUS_X_START} y={PIPO_Y_LEGEND} className="leyenda">
        Carga paralela · salida paralela · reloj común
      </text>
    </svg>
  )
}

function PisoDiagram({ state, flash }: { state: SimState; flash: FlashKind }) {
  const muxResult = muxOutputs(state.q, state.inputs, state.shLd)
  const shLdActivo = state.shLd === 1
  const jogY = PISO_Y_SHLD_BUS - 6

  return (
    <svg viewBox={PISO_VIEWBOX} width="100%" role="img" preserveAspectRatio="xMidYMid meet" className="diagrama-circuito">
      <title>Diagrama lógico del registro PISO: cuatro flip-flops D con multiplexor de corrimiento y reloj común</title>

      <line x1={BUS_X_START} y1={PISO_Y_SHLD_BUS} x2={BUS_X_END} y2={PISO_Y_SHLD_BUS} className="bus bus--control" />
      <text x={BUS_X_START} y={PISO_Y_SHLD_BUS - 8} className="bus__etiqueta">
        SH/LD̅ = {state.shLd} ({shLdActivo ? 'CORRIMIENTO' : 'CARGA'})
      </text>

      <line
        x1={BUS_X_START}
        y1={PISO_Y_CLK_BUS}
        x2={BUS_X_END}
        y2={PISO_Y_CLK_BUS}
        className={`bus bus--clk${flash === 'clock' ? ' bus--flash' : ''}`}
      />
      <text x={BUS_X_START} y={PISO_Y_CLK_BUS - 8} className="bus__etiqueta">
        CLK
      </text>

      <line
        x1={BUS_X_START}
        y1={PISO_Y_CLR_BUS}
        x2={BUS_X_END}
        y2={PISO_Y_CLR_BUS}
        className={`bus bus--clr${flash === 'clr' ? ' bus--flash' : ''}`}
      />
      <text x={BUS_X_START} y={PISO_Y_CLR_BUS + 16} className="bus__etiqueta">
        CLR
      </text>

      {STAGES.map((i) => {
        const cx = ffCenterX(i)
        const mx = muxX(i)
        const dBit = bitAt(state.inputs, i)
        const qBit = bitAt(state.q, i)
        const dFfBit = bitAt(muxResult, i)
        const shiftSourceBit = i === 3 ? 0 : bitAt(state.q, i + 1)
        const clkStubX = ffX(i) + 20
        const clrStubX = ffX(i) + FF_WIDTH - 20
        const input1X = mx + MUX_WIDTH - 16

        return (
          <g key={i}>
            <rect x={cx - 16} y={PISO_Y_TERMINAL - 16} width={32} height={22} rx={4} className="terminal" />
            <text x={cx} y={PISO_Y_TERMINAL} textAnchor="middle" className="terminal__etiqueta mono">
              {dBit}
            </text>
            <text x={cx} y={PISO_Y_TERMINAL - 22} textAnchor="middle" className="terminal__nombre">
              D{i}
            </text>

            <path
              d={orthPath([
                [cx, PISO_Y_TERMINAL + 8],
                [cx, jogY],
                [mx + 16, jogY],
                [mx + 16, PISO_Y_MUX_TOP],
              ])}
              className={wireClass(dBit, !shLdActivo)}
            />

            <path d={orthPath([[cx, PISO_Y_SHLD_BUS], [cx, PISO_Y_MUX_TOP]])} className="hilo hilo--control" />
            <Union x={cx} y={PISO_Y_SHLD_BUS} />

            {i === 3 ? (
              <>
                <GroundSymbol x={input1X} y={PISO_Y_GND_TOP} />
                <path
                  d={orthPath([[input1X, PISO_Y_GND_TOP + 14], [input1X, PISO_Y_MUX_TOP]])}
                  className={wireClass(0, shLdActivo)}
                />
              </>
            ) : (
              <path
                d={orthPath([
                  [ffCenterX(i + 1), PISO_Y_FEEDBACK_CHANNEL],
                  [input1X, PISO_Y_FEEDBACK_CHANNEL],
                  [input1X, PISO_Y_MUX_TOP],
                ])}
                className={wireClass(shiftSourceBit, shLdActivo)}
              />
            )}

            <MuxSymbol x={mx} y={PISO_Y_MUX_TOP} width={MUX_WIDTH} height={MUX_HEIGHT} outputValue={dFfBit} />

            <path d={orthPath([[cx, PISO_Y_MUX_BOTTOM], [cx, PISO_Y_FF_TOP]])} className={wireClass(dFfBit)} />

            <FlipFlopSymbol
              x={ffX(i)}
              y={PISO_Y_FF_TOP}
              width={FF_WIDTH}
              height={FF_HEIGHT}
              label={`FF${i}`}
              bit={qBit}
              flash={flash === 'clock'}
            />

            <path
              d={orthPath([[clkStubX, PISO_Y_CLK_BUS], [clkStubX, PISO_Y_FF_BOTTOM]])}
              className={`hilo hilo--reloj${flash === 'clock' ? ' hilo--flash' : ''}`}
            />
            <Union x={clkStubX} y={PISO_Y_CLK_BUS} />
            <path
              d={orthPath([[clrStubX, PISO_Y_CLR_BUS], [clrStubX, PISO_Y_FF_BOTTOM]])}
              className={`hilo hilo--reloj${flash === 'clr' ? ' hilo--flash' : ''}`}
            />
            <Union x={clrStubX} y={PISO_Y_CLR_BUS} />

            <path d={orthPath([[cx, PISO_Y_FF_BOTTOM], [cx, PISO_Y_PROBE - 10]])} className={wireClass(qBit)} />

            {i === 0 ? (
              <>
                <path
                  d={orthPath([[cx, PISO_Y_PROBE], [SER_OUT_X, PISO_Y_PROBE]])}
                  className={wireClass(qBit)}
                />
                <LedIndicator x={SER_OUT_X} y={PISO_Y_PROBE} label="SER_OUT" on={qBit === 1} tone="serial" />
                <text x={SER_OUT_X + 34} y={PISO_Y_PROBE + 4} className="leyenda-chica">
                  → salida serial
                </text>
              </>
            ) : (
              <path
                d={orthPath([[cx, PISO_Y_PROBE], [cx, PISO_Y_FEEDBACK_CHANNEL]])}
                className={wireClass(qBit)}
              />
            )}
            <LedIndicator x={cx} y={PISO_Y_PROBE} label={`Q${i}`} on={qBit === 1} tone="q" />
          </g>
        )
      })}

      <text x={BUS_X_START} y={PISO_Y_LEGEND} className="leyenda">
        Carga síncrona (SH/LD̅=0) · corrimiento hacia Q0 (SH/LD̅=1) · SER_OUT = Q0 · entra 0 por Q3
      </text>
      <text x={BUS_X_START} y={PISO_Y_LEGEND + 16} className="leyenda-chica">
        Valor en D del FF = se captura en el próximo flanco ↑
      </text>
    </svg>
  )
}

function CircuitDiagram({ state }: CircuitDiagramProps) {
  const flash = useEdgeFlash(state)

  return state.kind === 'PIPO' ? <PipoDiagram state={state} flash={flash} /> : <PisoDiagram state={state} flash={flash} />
}

export default CircuitDiagram

import { describe, expect, it } from 'vitest'
import { validateGeometry } from '../geometry/geometry'
import { buildPipoGeometry, buildPisoGeometry, ffX, netActive, netLevel } from './circuitGeometry'
import { PISO_CANONICA, runSequence } from '../../logic/vectors'

function segmentsOf(geometry: ReturnType<typeof buildPipoGeometry>, netId: string) {
  const net = geometry.nets.find((n) => n.id === netId)
  if (!net) throw new Error(`red no encontrada: ${netId}`)
  return net.segments
}

describe('buildPipoGeometry', () => {
  it('CIR-01 no tiene defectos geométricos', () => {
    expect(validateGeometry(buildPipoGeometry())).toEqual([])
  })

  it('CIR-03 conectividad PIPO', () => {
    const g = buildPipoGeometry()
    for (const i of [0, 1, 2, 3]) {
      const dSegs = segmentsOf(g, `d${i}`)
      const dLast = dSegs[dSegs.length - 1]
      expect([dLast.x2, dLast.y2]).toEqual([ffX(i), 214])

      const qSegs = segmentsOf(g, `q${i}`)
      const qFirst = qSegs[0]
      const qLast = qSegs[qSegs.length - 1]
      expect([qFirst.x1, qFirst.y1]).toEqual([ffX(i) + 110, 214])
      expect([qLast.x2, qLast.y2]).toEqual([ffX(i) + 125, 281])

      const clkSegs = segmentsOf(g, 'clk')
      expect(clkSegs.some((s) => s.x2 === ffX(i) && s.y2 === 256)).toBe(true)

      const clrSegs = segmentsOf(g, 'clr')
      expect(clrSegs.some((s) => s.x2 === ffX(i) + 55 && s.y2 === 280)).toBe(true)
    }
  })
})

describe('buildPisoGeometry', () => {
  it('CIR-02 no tiene defectos geométricos', () => {
    expect(validateGeometry(buildPisoGeometry())).toEqual([])
  })

  it('CIR-04 conectividad PISO', () => {
    const g = buildPisoGeometry()
    for (const i of [0, 1, 2, 3]) {
      const dSegs = segmentsOf(g, `d${i}`)
      const dLast = dSegs[dSegs.length - 1]
      expect([dLast.x2, dLast.y2]).toEqual([ffX(i) - 66, 202])

      const muxOutSegs = segmentsOf(g, `muxOut${i}`)
      expect(muxOutSegs).toHaveLength(1)
      expect([muxOutSegs[0].x1, muxOutSegs[0].y1]).toEqual([ffX(i) - 26, 214])
      expect([muxOutSegs[0].x2, muxOutSegs[0].y2]).toEqual([ffX(i), 214])
    }

    for (const i of [2, 1, 0]) {
      const fbSegs = segmentsOf(g, `fb${i}`)
      const fbFirst = fbSegs[0]
      const fbLast = fbSegs[fbSegs.length - 1]
      expect([fbFirst.x1, fbFirst.y1]).toEqual([ffX(i + 1) + 110, 214])
      expect([fbLast.x2, fbLast.y2]).toEqual([ffX(i) - 66, 226])
    }

    const serInSegs = segmentsOf(g, 'serIn')
    const serInLast = serInSegs[serInSegs.length - 1]
    expect([serInLast.x2, serInLast.y2]).toEqual([ffX(3) - 66, 226])

    const serOutSegs = segmentsOf(g, 'serOut')
    expect([serOutSegs[0].x1, serOutSegs[0].y1]).toEqual([ffX(0) + 110, 214])
  })

  it('CIR-05 niveles coinciden con el estado tras el primer corrimiento', () => {
    const state = runSequence('PISO', PISO_CANONICA.slice(0, 5))
    expect(state.q).toBe(0b0101)
    expect(state.inputs).toBe(0b1010)
    expect(state.shLd).toBe(1)

    expect(netLevel('fb2', state)).toBe(0)
    expect(netLevel('fb1', state)).toBe(1)
    expect(netLevel('fb0', state)).toBe(0)
    expect(netLevel('serOut', state)).toBe(1)
    expect(netLevel('muxOut3', state)).toBe(0)
    expect(netLevel('muxOut2', state)).toBe(0)
    expect(netLevel('muxOut1', state)).toBe(1)
    expect(netLevel('muxOut0', state)).toBe(0)
    expect(netLevel('d3', state)).toBe(1)
    expect(netLevel('d1', state)).toBe(1)
  })

  it('CIR-06 netActive según SH/LD̅', () => {
    const conCorrimiento = runSequence('PISO', PISO_CANONICA.slice(0, 5))
    expect(conCorrimiento.shLd).toBe(1)
    expect(netActive('d2', conCorrimiento)).toBe(false)
    expect(netActive('fb2', conCorrimiento)).toBe(true)

    const conCarga = runSequence('PISO', PISO_CANONICA.slice(0, 3))
    expect(conCarga.shLd).toBe(0)
    expect(netActive('d2', conCarga)).toBe(true)
    expect(netActive('fb2', conCarga)).toBe(false)
  })

  it('CIR-07 las redes de realimentación de distintas etapas no comparten puntos', () => {
    const g = buildPisoGeometry()
    const puntos = (netId: string) => {
      const segs = segmentsOf(g, netId)
      const set = new Set<string>()
      for (const s of segs) {
        set.add(`${s.x1},${s.y1}`)
        set.add(`${s.x2},${s.y2}`)
      }
      return set
    }
    const fb2 = puntos('fb2')
    const fb1 = puntos('fb1')
    const fb0 = puntos('fb0')
    for (const p of fb2) {
      expect(fb1.has(p)).toBe(false)
      expect(fb0.has(p)).toBe(false)
    }
  })
})

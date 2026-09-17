import { describe, expect, it } from 'vitest'
import { validateGeometry } from '../geometry/geometry'
import { buildWiringGeometry, ORDEN_FISICO } from './wiringGeometry'
import { pines } from '../../content/pines'

describe('buildWiringGeometry', () => {
  it('WIR-01 no tiene defectos geométricos', () => {
    expect(validateGeometry(buildWiringGeometry())).toEqual([])
  })

  it('WIR-02 ORDEN_FISICO coincide con pines.ts (salvo D13)', () => {
    const pinesConocidos = new Set(pines.map((p) => p.pin))
    for (const pin of ORDEN_FISICO) {
      expect(pinesConocidos.has(pin)).toBe(true)
    }
    const otrosPines = pines.map((p) => p.pin).filter((pin) => pin !== 'D13')
    for (const pin of otrosPines) {
      expect(ORDEN_FISICO.includes(pin as (typeof ORDEN_FISICO)[number])).toBe(true)
    }
    expect(ORDEN_FISICO.includes('D13' as (typeof ORDEN_FISICO)[number])).toBe(false)
  })

  it('WIR-03 cada fila tiene el cuerpo correcto según su tipo', () => {
    const g = buildWiringGeometry()
    const kindDe = (id: string) => g.bodies.find((b) => b.id === id)?.kind

    for (const pin of ['D12', 'D11', 'D10', 'D9', 'D8']) {
      expect(kindDe(`res${pin}`)).toBe('resistor')
      expect(kindDe(`led${pin}`)).toBe('led-fisico')
    }
    for (const pin of ['D7', 'D6', 'D5', 'D4', 'A0', 'A1']) {
      expect(kindDe(`sw${pin}`)).toBe('switch')
    }
    for (const pin of ['D3', 'D2']) {
      expect(kindDe(`bt${pin}`)).toBe('pulsador')
    }
  })

  it('WIR-04 la red gnd tiene 13 uniones y termina en (150, 580)', () => {
    const g = buildWiringGeometry()
    const gnd = g.nets.find((n) => n.id === 'gnd')
    expect(gnd).toBeDefined()
    expect(gnd?.junctions).toHaveLength(13)
    expect(gnd?.segments.some((s) => s.x2 === 150 && s.y2 === 580)).toBe(true)
  })
})

import type { Bit } from '../../logic/bits'
import type { SignalKind } from '../../logic/timing'

function levelPoints(values: Bit[], slotW: number, yHigh: number, yLow: number): Array<[number, number]> {
  const points: Array<[number, number]> = []

  values.forEach((bit, index) => {
    const x0 = index * slotW
    const x1 = x0 + slotW
    const y = bit === 1 ? yHigh : yLow

    if (index === 0) {
      points.push([x0, y])
    } else {
      const prevY = points[points.length - 1][1]
      points.push([x0, prevY], [x0, y])
    }
    points.push([x1, y])
  })

  return points
}

function pulsePoints(values: Bit[], slotW: number, yHigh: number, yLow: number): Array<[number, number]> {
  const points: Array<[number, number]> = [[0, yLow]]

  values.forEach((bit, index) => {
    const x0 = index * slotW
    const xMid = x0 + slotW / 2
    const x1 = x0 + slotW

    if (bit === 1) {
      points.push([x0, yHigh], [xMid, yHigh], [xMid, yLow], [x1, yLow])
    } else {
      points.push([x1, yLow])
    }
  })

  return points
}

export function waveformPath(values: Bit[], kind: SignalKind, slotW: number, yHigh: number, yLow: number): string {
  if (values.length === 0) return ''
  const points = kind === 'level' ? levelPoints(values, slotW, yHigh, yLow) : pulsePoints(values, slotW, yHigh, yLow)
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

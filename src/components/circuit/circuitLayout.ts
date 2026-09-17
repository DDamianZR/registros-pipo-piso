export const MARGIN_L = 100
export const STAGE_W = 190
export const FF_WIDTH = 110
export const FF_HEIGHT = 90
export const MUX_WIDTH = 90
export const MUX_HEIGHT = 44

export const STAGES = [3, 2, 1, 0] as const

function stageColumn(i: number): number {
  return 3 - i
}

export function ffX(i: number): number {
  return MARGIN_L + stageColumn(i) * STAGE_W
}

export function ffCenterX(i: number): number {
  return ffX(i) + FF_WIDTH / 2
}

export function muxX(i: number): number {
  return ffCenterX(i) - MUX_WIDTH / 2
}

export const PIPO_VIEWBOX = '0 0 960 440'
export const PIPO_Y_TERMINAL = 40
export const PIPO_Y_FF_TOP = 140
export const PIPO_Y_FF_BOTTOM = PIPO_Y_FF_TOP + FF_HEIGHT
export const PIPO_Y_CLK_BUS = 254
export const PIPO_Y_CLR_BUS = 278
export const PIPO_Y_LED_ROW = 340
export const PIPO_Y_LEGEND = 410

export const PISO_VIEWBOX = '0 0 960 560'
export const PISO_Y_TERMINAL = 26
export const PISO_Y_SHLD_BUS = 64
export const PISO_Y_GND_TOP = 78
export const PISO_Y_MUX_TOP = 100
export const PISO_Y_MUX_BOTTOM = PISO_Y_MUX_TOP + MUX_HEIGHT
export const PISO_Y_FF_TOP = 182
export const PISO_Y_FF_BOTTOM = PISO_Y_FF_TOP + FF_HEIGHT
export const PISO_Y_PROBE = PISO_Y_FF_BOTTOM + 16
export const PISO_Y_FEEDBACK_CHANNEL = 336
export const PISO_Y_CLK_BUS = 368
export const PISO_Y_CLR_BUS = 396
export const PISO_Y_LEGEND = 530

export const BUS_X_START = 40
export const BUS_X_END = 860
export const SER_OUT_X = ffX(0) + FF_WIDTH + 100

export function orthPath(points: Array<[number, number]>): string {
  return points.map(([x, y], index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')
}

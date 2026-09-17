export interface PinInfo {
  pin: string
  direccion: 'Entrada' | 'Salida'
  elemento: string
  logica: string
}

export const pines: PinInfo[] = [
  { pin: 'D2', direccion: 'Entrada', elemento: 'Pulsador CLK', logica: 'Presionado = LOW = 1' },
  { pin: 'D3', direccion: 'Entrada', elemento: 'Pulsador CLR', logica: 'Presionado = LOW = 1' },
  { pin: 'D4', direccion: 'Entrada', elemento: 'Switch D3 (MSB)', logica: 'ON = LOW = 1' },
  { pin: 'D5', direccion: 'Entrada', elemento: 'Switch D2', logica: 'ON = LOW = 1' },
  { pin: 'D6', direccion: 'Entrada', elemento: 'Switch D1', logica: 'ON = LOW = 1' },
  { pin: 'D7', direccion: 'Entrada', elemento: 'Switch D0 (LSB)', logica: 'ON = LOW = 1' },
  { pin: 'A0', direccion: 'Entrada', elemento: 'Switch SH/LD̅', logica: 'ON = 1 = CORRIMIENTO; OFF = 0 = CARGA' },
  { pin: 'A1', direccion: 'Entrada', elemento: 'Switch MODO', logica: 'ON = 1 = PISO; OFF = 0 = PIPO' },
  { pin: 'D12', direccion: 'Salida', elemento: 'LED Q3', logica: 'HIGH = encendido' },
  { pin: 'D11', direccion: 'Salida', elemento: 'LED Q2', logica: 'HIGH = encendido' },
  { pin: 'D10', direccion: 'Salida', elemento: 'LED Q1', logica: 'HIGH = encendido' },
  { pin: 'D9', direccion: 'Salida', elemento: 'LED Q0', logica: 'HIGH = encendido' },
  { pin: 'D8', direccion: 'Salida', elemento: 'LED SER_OUT', logica: 'En PISO = Q0; en PIPO siempre apagado' },
  { pin: 'D13', direccion: 'Salida', elemento: 'LED integrado "L"', logica: 'Encendido = modo PISO' },
]

export interface Material {
  cantidad: string
  componente: string
  uso: string
}

export const materiales: Material[] = [
  {
    cantidad: '1',
    componente: 'Arduino UNO R3 (o Nano, mismo mapa de pines) y cable USB',
    uso: 'Controlador y alimentación a 5 V por USB',
  },
  { cantidad: '1', componente: 'Protoboard de 830 puntos', uso: 'Montaje' },
  {
    cantidad: '1',
    componente: 'DIP switch de 8 posiciones, o 6 interruptores deslizables',
    uso: 'D3, D2, D1, D0, SH/LD̅, MODO',
  },
  { cantidad: '2', componente: 'Pulsadores táctiles de 4 patas (6×6 mm)', uso: 'CLK y CLR' },
  { cantidad: '4', componente: 'LEDs de 5 mm del mismo color (p. ej. rojos)', uso: 'Q3, Q2, Q1, Q0' },
  { cantidad: '1', componente: 'LED de 5 mm amarillo', uso: 'SER_OUT' },
  { cantidad: '5', componente: 'Resistencias de 330 Ω, ¼ W', uso: 'Limitación de corriente de los LEDs' },
  { cantidad: '~25', componente: 'Cables jumper macho-macho', uso: 'Cableado' },
]

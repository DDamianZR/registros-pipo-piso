export interface Equivalencia {
  web: string
  hardware: string
}

export const equivalencias: Equivalencia[] = [
  { web: 'Pestaña PIPO/PISO', hardware: 'Switch MODO. Al cambiarlo, el registro se reinicia.' },
  { web: 'Switches D3–D0', hardware: 'DIP 1–4' },
  { web: 'Selector SH/LD̅', hardware: 'DIP 5' },
  { web: 'Botón "Pulso de reloj"', hardware: 'Pulsador CLK' },
  { web: 'Botón CLR', hardware: 'Pulsador CLR' },
  { web: 'Reiniciar simulación', hardware: 'Botón RESET de la placa, o conmutar MODO' },
  { web: 'Exportar CSV', hardware: 'Monitor Serie a 115200 baudios' },
  {
    web: 'Carga de la página (D=0000, SH/LD̅=0)',
    hardware: 'Encender o reiniciar con D3–D0 y SH/LD̅ en OFF',
  },
]

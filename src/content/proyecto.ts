export interface Proyecto {
  titulo: string
  practica: string
  materia: string
  fecha: string
  autores: string[]
  urlRepositorio: string
  urlSitio: string
}

export const proyecto: Proyecto = {
  titulo: 'Registros PIPO y PISO de 4 bits',
  practica: 'Práctica 3',
  materia: 'Diseño de Sistemas Digitales',
  fecha: '2026-09-20',
  autores: [],
  urlRepositorio: 'https://github.com/DDamianZR/registros-pipo-piso',
  urlSitio: 'https://ddamianzr.github.io/registros-pipo-piso/',
}

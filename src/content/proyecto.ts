export interface Proyecto {
  titulo: string
  practica: string
  materia: string
  fecha: string
  autores: string[]
  profesora: string
  grupo: string
  semestre: string
  urlRepositorio: string
  urlSitio: string
}

export const proyecto: Proyecto = {
  titulo: 'Registros PIPO y PISO de 4 bits',
  practica: 'Práctica 3',
  materia: 'Diseño de Sistemas Digitales',
  fecha: '2026-09-20',
  autores: ['Campos Blancas Frida Vanessa', 'González Miranda Julio César', 'Canales Zendreros Diego Damián'],
  profesora: 'Ana Luz Barrales',
  grupo: '3BV1',
  semestre: '26-2',
  urlRepositorio: 'https://github.com/DDamianZR/registros-pipo-piso',
  urlSitio: 'https://ddamianzr.github.io/registros-pipo-piso/',
}

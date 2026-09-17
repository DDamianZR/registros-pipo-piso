# Registros PIPO y PISO de 4 bits

Simulador interactivo y circuito físico de dos registros de 4 bits con reloj común: PIPO (entrada y salida paralela) y PISO (entrada paralela, salida serial).

Sitio publicado: `https://<usuario>.github.io/registros-pipo-piso/` (se completa al desplegar el repositorio).

## Contexto

Práctica 3 de la materia Diseño de Sistemas Digitales. Fecha de entrega: 20 de septiembre de 2026.

## Funcionalidades

- Simulador interactivo de PIPO y PISO de 4 bits, con estado independiente por pestaña.
- Diagrama lógico animado (SVG) que refleja el estado real del reducer, para ambos registros.
- Carta de tiempos con ventana de los últimos 16 pasos y marcadores de flanco.
- Tabla de funcionamiento exportable a CSV, en el mismo formato que imprime el sketch de Arduino.
- Sketch de Arduino UNO/Nano que replica el modelo lógico y permite comparar resultados línea por línea.
- Contenido teórico, preguntas de referencia y resultados generados a partir del propio modelo, no escritos a mano.

## Modelo lógico (resumen)

- Convención de bits: Q3 y D3 son el MSB; Q0 y D0 son el LSB. El orden visual siempre es 3, 2, 1, 0.
- PIPO: en cada flanco de reloj, `Q ← D` para los 4 bits a la vez.
- PISO: con SH/LD̅=0 (CARGA), `Q ← D`; con SH/LD̅=1 (CORRIMIENTO), `Q ← (Q >> 1) & 0b0111` (entra 0 por Q3). `SER_OUT = Q0`.
- Los bits salen por SER_OUT en orden **LSB primero**: cargar `1010` produce en SER_OUT la secuencia `0, 1, 0, 1`.

Detalle completo, con las ecuaciones booleanas de cada multiplexor, en [`docs/modelo-logico.md`](docs/modelo-logico.md).

## PIPO: tabla de referencia

Secuencia: activar D3, activar D1, aplicar un pulso, activar D3, D2, D1, D0 y aplicar otro pulso.

```
paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea
0,PIPO,INICIO,-,0000,0000,-,-
1,PIPO,ENTRADA,-,1000,0000,-,-
2,PIPO,ENTRADA,-,1010,0000,-,-
3,PIPO,CLK,-,1010,1010,-,-
4,PIPO,ENTRADA,-,0010,1010,-,-
5,PIPO,ENTRADA,-,0110,1010,-,-
6,PIPO,ENTRADA,-,0100,1010,-,-
7,PIPO,ENTRADA,-,0101,1010,-,-
8,PIPO,CLK,-,0101,0101,-,-
```

Q retiene su valor mientras D cambia sin un pulso de reloj (pasos 4–7).

## PISO: tabla de referencia

Secuencia: activar D3, activar D1, aplicar un pulso de carga, cambiar SH/LD̅ a 1 y aplicar 4 pulsos de corrimiento.

```
paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea
0,PISO,INICIO,0,0000,0000,0,-
1,PISO,ENTRADA,0,1000,0000,0,-
2,PISO,ENTRADA,0,1010,0000,0,-
3,PISO,CLK_CARGA,0,1010,1010,0,D0
4,PISO,CONTROL,1,1010,1010,0,D0
5,PISO,CLK_CORRIMIENTO,1,1010,0101,1,D1
6,PISO,CLK_CORRIMIENTO,1,1010,0010,0,D2
7,PISO,CLK_CORRIMIENTO,1,1010,0001,1,D3
8,PISO,CLK_CORRIMIENTO,1,1010,0000,0,-
```

SER_OUT presenta `0, 1, 0, 1` (D0, D1, D2, D3, en ese orden) y el registro queda vacío tras el cuarto corrimiento.

## Circuito físico

Materiales: Arduino UNO o Nano, protoboard, DIP switch de 8 posiciones (o 6 interruptores), 2 pulsadores, 5 LEDs y 5 resistencias de 330 Ω. Lista completa y mapa de pines en [`docs/conexiones-arduino.md`](docs/conexiones-arduino.md).

| Pin | Elemento | Pin | Elemento |
|---|---|---|---|
| D2 | Pulsador CLK | D12 | LED Q3 |
| D3 | Pulsador CLR | D11 | LED Q2 |
| D4–D7 | Switches D3–D0 | D10 | LED Q1 |
| A0 | Switch SH/LD̅ | D9 | LED Q0 |
| A1 | Switch MODO | D8 | LED SER_OUT |

Todas las entradas usan `INPUT_PULLUP`; no se requieren resistencias externas para los switches ni conectar 5 V directo a ellos.

## Uso del Monitor Serie

El sketch imprime, a 115200 baudios, el mismo formato CSV que exporta la tabla de la web (`paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea`). Ejecutando la misma secuencia en el hardware y en el navegador, las líneas deben coincidir de forma exacta (ver casos HW-12 y HW-13 en `docs/plan-de-pruebas.md`).

## Ejecución local

Requisitos: Node.js ≥ 22.12 (se recomienda 24 LTS).

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
```

## Despliegue

El flujo `.github/workflows/deploy.yml` construye el sitio (`npm ci`, `npm test`, `npm run build`) y lo publica en GitHub Pages mediante `actions/deploy-pages`, con Pages configurado para desplegar desde **GitHub Actions** (no desde una rama).

## Estructura del proyecto

```
registros-pipo-piso/
├── arduino/registros_pipo_piso/registros_pipo_piso.ino
├── docs/
│   ├── modelo-logico.md
│   ├── conexiones-arduino.md
│   ├── plan-de-pruebas.md
│   └── guia-reporte.md
├── public/favicon.svg
├── src/
│   ├── logic/         # Modelo lógico puro (bits, registros, simulador, tabla, carta, sugerencias)
│   ├── content/        # Datos estáticos (proyecto, pines, materiales, preguntas)
│   ├── components/
│   │   ├── layout/     # Encabezado, secciones, pie de página
│   │   ├── controls/    # Switch, botón, LED, control segmentado
│   │   ├── lab/        # Panel del laboratorio interactivo
│   │   ├── circuit/     # Diagrama lógico SVG
│   │   ├── timing/     # Carta de tiempos
│   │   ├── table/      # Tabla de funcionamiento
│   │   └── sections/    # Contenido académico y de hardware
│   └── styles/         # Tokens y hojas de estilo por área
└── .github/workflows/deploy.yml
```

## Cómo agregar fotografías

Coloca los archivos en `src/assets/fotos/` con el nombre `NN-descripcion-con-guiones.jpg` (por ejemplo, `02-pipo-cargado.jpg`). El pie de foto se genera automáticamente quitando el número y la extensión, y cambiando los guiones por espacios. Recomendaciones: ancho máximo de 1600 px, menos de 400 KB, sin metadatos EXIF/GPS y sin rostros ni credenciales visibles.

Checklist mínimo: circuito completo; PIPO con Q=1010; PIPO tras cambiar entradas a 0101 sin pulso; PISO recién cargado con 1010; PISO tras 1, 2, 3 y 4 corrimientos; Monitor Serie con la secuencia canónica.

## Limitaciones

- Simulación a nivel de comportamiento, sin tiempos de propagación, setup ni hold.
- El hardware emula los flip-flops por software; no usa circuitos integrados 74xx.
- El historial de la simulación está limitado a 64 pasos.
- La carga del PISO es síncrona, a diferencia del 74HC165 comercial, cuya carga es asíncrona.
- La entrada serial (SER_IN) está fija a 0; no se puede encadenar con otro registro.
- El sitio solo tiene tema claro.

## Posibles mejoras

- Entrada serial configurable, para encadenar varios registros PISO.
- Registros SISO y SIPO como complemento.
- Versión con circuitos integrados 74HC175 y 74HC166.
- Modelado de tiempos de propagación.
- Sincronizar la web con Arduino en tiempo real mediante Web Serial.

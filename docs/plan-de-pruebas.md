# Plan de pruebas

Matriz completa de validación del proyecto. Las pruebas de la sección 15.A están automatizadas (`npm test`); las de 15.B se ejecutan a mano en el navegador; las de 15.C las ejecuta el equipo sobre el circuito físico y debe llenar la columna **Resultado observado**.

## 15.A Lógica (automatizadas: `src/logic/*.test.ts`)

| ID | Caso | Entrada / acciones | Resultado esperado | Resultado observado |
|---|---|---|---|---|
| PIPO-01 | Estado inicial | Crear estado | q=0000, 1 entrada INICIO | |
| PIPO-02 | Carga paralela | D=1010, CLK | q=1010, evento CLK | |
| PIPO-03 | Retención | Tras 02: D→0101 (4 cambios) | q=1010 en las 4 entradas nuevas | |
| PIPO-04 | Nueva carga | Tras 03: CLK | q=0101 | |
| PIPO-05 | Idempotencia | Tras 04: CLK | q=0101 | |
| PIPO-06 | Extremos | D=1111, CLK; D=0000, CLK | 1111; 0000 | |
| PIPO-07 | Un 1 que recorre posiciones | D=0001, 0010, 0100, 1000, cada una con CLK | q=D en cada caso | |
| PIPO-08 | CLR | q=1011, CLR | q=0000, inputs=1011 | |
| PIPO-09 | CLR y recarga | Tras 08: CLK | q=1011 | |
| PIPO-10 | Exhaustiva | v=0..15: D=v, CLK | q=v | |
| PIPO-11 | Reinicio | Tras varias acciones: RESET | 1 entrada, paso 0, q=0000, inputs conservadas | |
| PISO-01 | Carga | SH/LD̅=0, D=1010, CLK | q=1010, ser=0, bit=D0, shifts=0 | |
| PISO-02 | 1.er corrimiento | SH/LD̅=1, CLK | q=0101, ser=1, bit=D1 | |
| PISO-03 | 2.º | CLK | q=0010, ser=0, bit=D2 | |
| PISO-04 | 3.º | CLK | q=0001, ser=1, bit=D3 | |
| PISO-05 | 4.º (vaciado) | CLK | q=0000, ser=0, bit=null | |
| PISO-06 | Corrimiento extra | CLK | q=0000, bit=null | |
| PISO-07 | Orden de salida | SER tras carga y 3 corrimientos | [0,1,0,1] = D0..D3 | |
| PISO-08 | Palabra asimétrica | Cargar 1101 y 4 corrimientos | Q: 1101→0110→0011→0001→0000; SER: 1,0,1,1,0 | |
| PISO-09 | Dirección | Cargar 0001, corrimiento | q=0000 (no 0010) | |
| PISO-10 | Llegada del MSB | Cargar 1000, 3 corrimientos | q=0001, ser=1 en el 3.º | |
| PISO-11 | Entradas tras carga | Cargar 1010; D→0110; corrimiento | q=0101 (usa lo almacenado) | |
| PISO-12 | Carga repetida | SH/LD̅=0, CLK ×3 | q=D, shifts=0 cada vez | |
| PISO-13 | Recarga a mitad | Cargar 1010, corrimiento, SH/LD̅=0, D=1111, CLK | q=1111, bit=D0, shifts=0 | |
| PISO-14 | Control sin reloj | Cambiar SH/LD̅ | q sin cambio, evento CONTROL | |
| PISO-15 | CLR a mitad | Cargar 1010, corrimiento, CLR | q=0000, bit=null; corrimiento → 0000 | |
| PISO-16 | Exhaustiva | v=0..15: cargar y 4 corrimientos | SER = bit0, bit1, bit2, bit3 y 0 al final | |
| PISO-17 | Corrimiento sin carga | Inicio, SH/LD̅=1, CLK | q=0000, bit=null | |
| PISO-18 | Sin cascada | Cargar 1111, corrimiento | q=0111 | |
| SIM-DET | Determinismo | Misma secuencia 2 veces | Estados idénticos | |
| SIM-LIM | Límite | 100 acciones | 64 entradas, último paso = 100 | |
| TIM-01 | Ranuras | Secuencia PISO canónica | 9 ranuras; pulsos CLK solo en 3, 5, 6, 7, 8 | |
| TIM-02 | Niveles Q | Ídem | Q_i[k] = bitAt(history[k].q, i) | |
| TIM-03 | Retención | Ranuras 1 y 2 | D cambia, Q no | |
| TIM-04 | SER_OUT | Todas las ranuras | SER_OUT = Q0 | |
| TIM-05 | Ventana | 30 pasos | 16 ranuras, las últimas | |
| TAB-01 | Filas | Cualquier secuencia | Una fila por entrada, pasos ascendentes | |
| TAB-02 | Encabezado | toCsv | Encabezado exacto de `modelo-logico.md` | |
| TAB-03 | Guiones PIPO | Secuencia PIPO | sh_ld, ser_out y bit = `-` | |
| TAB-04 | CSV PISO | PISO_CANONICA | Idéntico a la secuencia canónica (con `\r\n`) | |
| TAB-05 | CSV PIPO | PIPO_CANONICA | Idéntico a la secuencia canónica (con `\r\n`) | |
| HINT-01…08 | Sugerencias | Un estado por regla (3 PIPO + 5 PISO) | Texto de la regla esperada | |
| PROC-01 | Procedimiento PIPO | `describeSequence('PIPO', PIPO_CANONICA)` | Acciones textuales exactas de la secuencia canónica | |
| PROC-02 | Procedimiento PISO | `describeSequence('PISO', PISO_CANONICA)` | Acciones textuales exactas de la secuencia canónica | |
| PROC-03 | Resultados del procedimiento PISO | Ídem | Último paso `Q = 0000 · SER_OUT = 0`; paso 5 `Q = 0101 · SER_OUT = 1` | |
| PROC-04 | Coherencia con el CSV | Comparar longitud de pasos con `runSequence(...).history.length − 1` | Igual número de pasos en ambas secuencias | |
| GEO-01 | Caja de etiqueta | `labelBox` con anclas start/middle/end, texto de 4 caracteres, fontSize 10 | Cajas esperadas según la fórmula de §4.4 | |
| GEO-02 | Detección de violaciones | Un caso por regla V1–V7 | `validateGeometry` reporta cada violación por separado | |
| GEO-03 | Borde sin problema | Cable que termina en el borde de un cuerpo | No se reporta violación V4 | |
| GEO-04 | Cruce perpendicular | Redes distintas que se cruzan en ángulo recto | No se reporta ninguna violación | |
| CIR-01 | Geometría PIPO válida | `validateGeometry(buildPipoGeometry())` | `[]` | |
| CIR-02 | Geometría PISO válida | `validateGeometry(buildPisoGeometry())` | `[]` | |
| CIR-03 | Conectividad PIPO | Extremos de `d{i}`, `q{i}`, `clk`, `clr` | Coinciden con los pines de cada flip-flop | |
| CIR-04 | Conectividad PISO | Extremos de `d{i}`, `muxOut{i}`, `fb{i}`, `serIn`, `serOut` | Coinciden con los pines de cada MUX/flip-flop | |
| CIR-05 | Niveles tras el primer corrimiento | `PISO_CANONICA.slice(0,5)` | `fb2=0, fb1=1, fb0=0, serOut=1, muxOut1=1, d3=1, d1=1` | |
| CIR-06 | Rutas activas según SH/LD̅ | shLd=0 y shLd=1 | `d{i}` y `fb{i}` se alternan como activos/inactivos | |
| CIR-07 | Separación entre etapas | Redes `fb2`, `fb1`, `fb0` | Ningún punto compartido entre ellas | |
| WIR-01 | Geometría del cableado válida | `validateGeometry(buildWiringGeometry())` | `[]` | |
| WIR-02 | Coherencia con `pines.ts` | `ORDEN_FISICO` vs `pines.ts` | Mismo conjunto de pines, salvo `D13` | |
| WIR-03 | Cuerpo por tipo de fila | Filas LED, switch y pulsador | `resistor`+`led-fisico`, `switch`, `pulsador` respectivamente | |
| WIR-04 | Riel GND | Red `gnd` | 13 uniones; un segmento termina en `(150, 580)` | |
| TIM-06 | Tramos de nivel alto | `highRuns([0,1,1,0,1])`, `[]`, `[1,1]` | `[{1,3},{4,5}]`, `[]`, `[{0,2}]` | |
| TIM-07 | Encabezado de ranura | `slotHeaderText` en flanco y en entrada | `↑n` y `n` respectivamente | |
| TIM-08 | Trazo de onda fijo | `waveformPath([0,1],'level',44,6,22)` | `M 0 22 L 44 22 L 44 22 L 44 6 L 88 6` | |
| TIM-09 | Encabezado sin desborde | `slotHeaderText` hasta el paso 999 | El ancho del texto cabe en `SLOT_W` (44) | |

## 15.B Interfaz (manual, en `vite preview` y en el sitio publicado)

| ID | Prueba | Resultado esperado | Resultado observado |
|---|---|---|---|
| UI-01 | Cargar la página | Sin errores en consola; laboratorio en PIPO con D=0000 y Q=0000 | |
| UI-02 | Secuencia PIPO canónica | LEDs, diagrama, carta y tabla muestran 1010 → retención → 0101 | |
| UI-03 | Cambiar D sin CLK | La sugerencia indica retención; la fila "Cambio de entrada" muestra Q igual | |
| UI-04 | Pestañas | Cambiar a PISO y volver conserva el estado de cada registro | |
| UI-05 | CLR | Q=0000 al instante; fila CLR; destello en el bus CLR | |
| UI-06 | Secuencia PISO canónica | SER_OUT 0,1,0,1,0; ranuras "1.º–4.º" = 0,1,0,1; palabra reconstruida 1010 | |
| UI-07 | Diagrama PISO | Con SH/LD̅=1 las rutas de corrimiento están activas; el GND en SER_IN es visible | |
| UI-08 | Exportar CSV | El archivo coincide con la secuencia canónica | |
| UI-09 | Reiniciar simulación | La tabla vuelve a paso 0; las entradas se conservan | |
| UI-10 | Responsive | 390 px sin scroll horizontal de página; diagrama y carta desplazables dentro de su contenedor | |
| UI-11 | Teclado | Todo operable con Tab, Enter y Espacio; foco visible | |
| UI-12 | Código Arduino | El visor muestra el `.ino` completo; "Descargar .ino" funciona | |
| UI-13 | Script de desbordes (§4.2.6) | Anchos 320, 360, 390, 768, 1024 y 1280 | Ningún desborde; `h1 = 1`; menú visible en móvil | |
| UI-14 | Diagramas lógicos PIPO y PISO | Los tres estados de la fase de geometría verificable | Cables separados, nada atraviesa símbolos, textos completos, entrada activa del MUX resaltada | |

## 15.C Hardware (lo ejecuta el equipo; llenar "Resultado observado")

| ID | Prueba | Resultado esperado | Resultado observado |
|---|---|---|---|
| HW-01 | Alimentación | Con USB, LED ON de la placa encendido; Monitor Serie a 115200 muestra `# MODO …` | |
| HW-02 | Prueba de lámparas | Al arrancar, los 5 LEDs y "L" encienden 0.5 s | |
| HW-03 | GND común | Continuidad entre el riel GND y el pin GND (multímetro) | |
| HW-04 | Switches | Poner cada D en ON por separado: fila ENTRADA con el 1 en la posición correcta (D3 → `1000`) | |
| HW-05 | Entrada flotante | Desconectar el cable del switch D0: se lee 0 estable y no hay filas espontáneas en 30 s | |
| HW-06 | LEDs | PIPO con D=1111 y CLK: Q3–Q0 encendidos en orden físico izquierda→derecha | |
| HW-07 | Antirrebote | 20 pulsaciones de CLK = exactamente 20 filas CLK | |
| HW-08 | Pulsación mantenida | Mantener CLK 3 s: una sola fila; al soltar, ninguna | |
| HW-09 | CLR | Q=0000 al instante, sin necesidad de CLK | |
| HW-10 | MODO | Conmutar imprime el encabezado, fila INICIO, Q=0000; "L" refleja el modo | |
| HW-11 | SH/LD̅ en PIPO | Conmutarlo no imprime filas | |
| HW-12 | Coincidencia PIPO | D3–D0 y SH/LD̅ en OFF, MODO en OFF (PIPO), RESET de la placa y el procedimiento de `conexiones-arduino.md` › Procedimiento de prueba canónico: las líneas del Monitor Serie (ignorando las que empiezan con `#`) coinciden línea por línea con el CSV exportado de la web tras el mismo procedimiento | |
| HW-13 | Coincidencia PISO | D3–D0 y SH/LD̅ en OFF, MODO en ON (PISO), RESET de la placa y el procedimiento de `conexiones-arduino.md` › Procedimiento de prueba canónico: coinciden línea por línea con el CSV exportado de la web tras el mismo procedimiento; el LED SER_OUT sigue 0,1,0,1,0 | |
| HW-14 | SER_OUT = Q0 | En PISO, el LED amarillo siempre igual al LED Q0 | |

## Criterios de aceptación

1. `npm ci`, `npm test` y `npm run build` terminan sin errores; hay más de 45 pruebas en verde.
2. PIPO y PISO son deterministas: SIM-DET, PIPO-01…11 y PISO-01…18 en verde.
3. Los CSV canónicos de la web coinciden carácter por carácter con `modelo-logico.md` (TAB-04 y TAB-05).
4. El diagrama, la carta y la tabla muestran exactamente los estados del reducer (UI-02, UI-06 y UI-07).
5. Convención de bits idéntica en web, documentación y sketch: MSB a la izquierda, corrimiento hacia Q0, LSB primero.
6. El sketch compila para UNO y Nano, o queda marcado para compilar en Arduino IDE, y su salida serial coincide con la secuencia canónica en el recorrido en papel.
7. Pines documentados de forma idéntica en 5 lugares (`.ino`, `pines.ts`, `README.md`, `conexiones-arduino.md` y el diagrama de conexiones).
8. El sitio público funciona sin backend, sin errores en consola ni recursos 404.
9. Workflow de Actions en verde y Pages con `build_type=workflow`.
10. Auditoría de nomenclatura vacía.
11. No hay funcionalidades, dependencias ni archivos fuera de lo documentado.

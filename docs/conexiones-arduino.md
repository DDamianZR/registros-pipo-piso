# Conexiones de Arduino

Guía de armado del circuito físico que reproduce, con Arduino UNO o Nano, el mismo modelo lógico que la simulación web (ver `modelo-logico.md`).

## Materiales (BOM)

| Cant. | Componente | Uso |
|---|---|---|
| 1 | Arduino UNO R3 (o Nano, mismo mapa de pines) y cable USB | Controlador y alimentación a 5 V por USB |
| 1 | Protoboard de 830 puntos | Montaje |
| 1 | DIP switch de 8 posiciones, o 6 interruptores deslizables | D3, D2, D1, D0, SH/LD̅, MODO (las posiciones 7 y 8 no se usan) |
| 2 | Pulsadores táctiles de 4 patas (6×6 mm) | CLK y CLR |
| 4 | LEDs de 5 mm del mismo color (p. ej. rojos) | Q3, Q2, Q1, Q0 |
| 1 | LED de 5 mm amarillo | SER_OUT |
| 5 | Resistencias de 330 Ω, ¼ W | Limitación de corriente de los LEDs |
| ~25 | Cables jumper macho-macho | Cableado |

No se usan resistencias pull-up ni pull-down externas: se usan las internas de Arduino con `INPUT_PULLUP`.

Corriente por LED: (5 V − 2 V) / 330 Ω ≈ 9 mA. Los 5 LEDs suman menos de 50 mA, dentro de los límites del ATmega328P.

## Mapa de pines

| Pin | Dirección | Elemento | Lógica |
|---|---|---|---|
| D2 | Entrada `INPUT_PULLUP` | Pulsador CLK | Presionado = LOW = 1 |
| D3 | Entrada `INPUT_PULLUP` | Pulsador CLR | Presionado = LOW = 1 |
| D4 | Entrada `INPUT_PULLUP` | Switch D3 (MSB) | ON = LOW = 1 |
| D5 | Entrada `INPUT_PULLUP` | Switch D2 | ON = LOW = 1 |
| D6 | Entrada `INPUT_PULLUP` | Switch D1 | ON = LOW = 1 |
| D7 | Entrada `INPUT_PULLUP` | Switch D0 (LSB) | ON = LOW = 1 |
| A0 | Entrada `INPUT_PULLUP` | Switch SH/LD̅ | ON = 1 = CORRIMIENTO; OFF = 0 = CARGA |
| A1 | Entrada `INPUT_PULLUP` | Switch MODO | ON = 1 = PISO; OFF = 0 = PIPO |
| D12 | Salida | LED Q3 | HIGH = encendido |
| D11 | Salida | LED Q2 | HIGH = encendido |
| D10 | Salida | LED Q1 | HIGH = encendido |
| D9 | Salida | LED Q0 | HIGH = encendido |
| D8 | Salida | LED SER_OUT | En PISO = Q0; en PIPO siempre apagado |
| D13 | Salida | LED integrado "L" | Encendido = modo PISO |
| D0, D1 | — | Reservados para USB-Serial | No conectar |
| A2–A5 | — | Libres | No conectar |

Con el USB a la izquierda, la cabecera superior del UNO se lee **12, 11, 10, 9, 8** (Q3, Q2, Q1, Q0, SER_OUT) y **7, 6, 5, 4** (D3, D2, D1, D0), en el mismo orden izquierda→derecha que la protoboard. En el Nano se usan las mismas etiquetas (D2–D13, A0, A1); no se usan A6 ni A7.

## Conexiones, elemento por elemento

| Elemento | Conexión |
|---|---|
| **Rieles de alimentación** | GND de Arduino al riel azul (−) de la protoboard. El riel de 5 V no se necesita: todas las entradas usan pull-up interno. **Nunca se conecta 5 V directo a un switch.** |
| **Switches** | Una terminal al pin asignado; la terminal opuesta de la misma posición al riel GND. |
| **Pulsadores** | Pin asignado a una pata; la pata diagonalmente opuesta a GND (las patas de un mismo lado ya están unidas por dentro). Se montan sobre el canal central de la protoboard. |
| **LEDs** | Pin → resistencia 330 Ω → ánodo (pata larga); cátodo (pata corta, lado plano) → riel GND. |

### Entradas flotantes y pull-up

`INPUT_PULLUP` activa una resistencia interna de 20–50 kΩ hacia 5 V. Switch abierto = HIGH estable (lógico 0); cerrado = LOW (lógico 1). Sin `INPUT_PULLUP`, el pin flotaría y produciría lecturas inconsistentes por ruido o interferencia.

### Antirrebote

Un pulsador mecánico rebota varios milisegundos al cerrarse. El sketch filtra las 8 entradas con un tiempo de estabilización de 30 ms (`DEBOUNCE_MS`): solo acepta un cambio como válido si se mantiene estable durante ese intervalo. CLK dispara únicamente en la transición estable de suelto a presionado; mantenerlo presionado produce un único flanco.

## Equivalencias web ↔ hardware

| Web | Hardware |
|---|---|
| Pestaña PIPO/PISO | Switch MODO. Al cambiarlo, el registro se reinicia. |
| Switches D3–D0 | DIP 1–4 |
| Selector SH/LD̅ | DIP 5 |
| Botón "Pulso de reloj" | Pulsador CLK |
| Botón CLR | Pulsador CLR |
| Reiniciar simulación | Botón RESET de la placa, o conmutar MODO |
| Exportar CSV | Monitor Serie a 115200 baudios |
| Carga de la página (D=0000, SH/LD̅=0) | Encender o reiniciar con D3–D0 y SH/LD̅ en OFF |

La web tiene dos simuladores con estado independiente (uno por pestaña); el hardware tiene uno solo según MODO. Para comparar, se ejecuta la misma secuencia canónica en ambos y se contrasta línea por línea (ver `plan-de-pruebas.md`, casos HW-12 y HW-13).

## Procedimiento de armado

1. Conectar GND de Arduino al riel GND de la protoboard.
2. Montar los LEDs con su resistencia en serie; cátodo al riel GND.
3. Montar los switches (DIP o deslizables); una terminal de cada posición al riel GND.
4. Montar los pulsadores CLK y CLR sobre el canal central, con la pata activa en diagonal a GND.
5. Conectar el cable USB al final, una vez revisado todo el cableado.

## Solución de problemas

| Síntoma | Causa probable |
|---|---|
| Un LED nunca enciende | Está al revés (cátodo y ánodo invertidos) o la resistencia no hace buen contacto. |
| Un switch no cambia nada | Se conectaron ambas patas del mismo lado (ya unidas internamente) en vez de una terminal a cada lado. |
| El pulsador no responde | Se usaron dos patas del mismo lado en vez de la diagonal opuesta. |
| Lecturas erráticas en una entrada | Falta `INPUT_PULLUP` o el pin quedó sin conexión (flotante). |
| Varias filas CLK por una sola pulsación | Antirrebote insuficiente; verificar `DEBOUNCE_MS` y que el botón esté bien fijado a la protoboard. |

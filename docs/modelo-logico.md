# Modelo lógico

Este documento describe, con precisión, el comportamiento de los registros PIPO y PISO de 4 bits implementados en este proyecto. Tanto la simulación web (`src/logic/`) como el sketch de Arduino (`arduino/registros_pipo_piso/registros_pipo_piso.ino`) siguen exactamente estas reglas, por lo que sus resultados son comparables línea por línea.

## Convención de bits

1. El índice `i ∈ {0,1,2,3}` tiene peso `2^i`. **Q3 y D3 son el MSB; Q0 y D0 son el LSB.**
2. Toda palabra se escribe **del MSB al LSB**: `"1010"` significa D3=1, D2=0, D1=1, D0=0.
3. **El orden visual es siempre de izquierda a derecha: 3, 2, 1, 0**, tanto en la web como en la protoboard y en la cabecera de pines de Arduino.
4. En código, un registro es un entero de 0 a 15 (`bitAt(v, i) = (v >> i) & 1`); no se usan arreglos de bits.
5. Los niveles son lógicos: 1 = activo. En el hardware, "switch en ON" = 1 y "botón presionado" = 1 (la inversión eléctrica, por `INPUT_PULLUP`, se documenta en `conexiones-arduino.md`).

## Reloj y eventos

- Los flip-flops son D, **disparados por flanco de subida**, y los cuatro comparten la misma señal CLK.
- Un pulso de reloj equivale a un flanco ↑ de captura (en el hardware, presionar el botón; soltarlo no produce ningún evento).
- Todas las etapas calculan su siguiente estado a partir del estado **anterior** y se actualizan juntas en el mismo flanco.
- **CLR** es asíncrono: pone `Q ← 0000` de inmediato, sin reloj, y no modifica `inputs` ni `shLd`.
- **Reiniciar la simulación** (o presionar RESET en la placa, o cambiar el switch MODO) pone `Q ← 0000` y borra el historial, pero **conserva** las entradas y SH/LD̅, igual que los switches físicos.

## PIPO (entrada paralela, salida paralela)

| Evento | Efecto |
|---|---|
| Cambiar una entrada Di | `inputs` cambia; **Q no cambia**. |
| Pulso de reloj | `Q ← D` (los 4 bits a la vez). |
| CLR | `Q ← 0000`. |

Entre flancos, Q retiene su valor aunque D cambie.

## PISO (entrada paralela, salida serial)

Cada etapa tiene un multiplexor 2:1: `D_ff[i] = SH/LD̅ ? fuente_corrimiento[i] : D[i]`.

- `fuente_corrimiento[3] = SER_IN = 0` (entrada serial fija a GND).
- `fuente_corrimiento[i] = Q[i+1]` para i = 2, 1, 0.

En notación booleana, con `SH = SH/LD̅`:

```
D_ff3 = SH·0    + SH̅·D3
D_ff2 = SH·Q3   + SH̅·D2
D_ff1 = SH·Q2   + SH̅·D1
D_ff0 = SH·Q1   + SH̅·D0
```

**Salida serial:** `SER_OUT = Q0`, combinacional y siempre visible.

**Dirección:** el corrimiento va **hacia Q0** (equivale a `Q >> 1`); los ceros entran por Q3.

**SH/LD̅:** 0 = CARGA, 1 = CORRIMIENTO.

| Evento | Efecto |
|---|---|
| Cambiar una entrada Di | `inputs` cambia; Q no cambia. |
| Cambiar SH/LD̅ | `shLd` cambia; Q no cambia hasta el próximo flanco. |
| Pulso de reloj, SH/LD̅=0 | `Q ← D` (carga síncrona). |
| Pulso de reloj, SH/LD̅=1 | `Q ← (Q >> 1) & 0b0111` (Q3 recibe SER_IN=0). |
| CLR | `Q ← 0000`. |

### Orden de transmisión: LSB primero

Después de cargar la palabra D3D2D1D0:

| Momento | Q3..Q0 | SER_OUT | Bit en línea |
|---|---|---|---|
| Tras la carga | D3 D2 D1 D0 | D0 | D0 (1.º) |
| Tras 1.er corrimiento | 0 D3 D2 D1 | D1 | D1 (2.º) |
| Tras 2.º corrimiento | 0 0 D3 D2 | D2 | D2 (3.º) |
| Tras 3.er corrimiento | 0 0 0 D3 | D3 | D3 (4.º) |
| Tras 4.º corrimiento | 0 0 0 0 | 0 | — (vacío) |

Se necesita **1 pulso de carga + 3 de corrimiento** para que los 4 bits pasen por SER_OUT. Como consecuencia, la secuencia observada en SER_OUT aparece **invertida** respecto a la palabra escrita: cargar `1010` produce en SER_OUT la secuencia `0, 1, 0, 1`.

## Formato de intercambio CSV

Encabezado exacto: `paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea`

- En PIPO, `sh_ld`, `ser_out` y `bit_en_linea` valen `-`.
- En PISO, `sh_ld` vale 0 o 1, `ser_out` vale 0 o 1 y `bit_en_linea` vale `D0`…`D3` o `-`.
- Palabras en 4 caracteres binarios, del MSB al LSB. Cada línea termina en `\r\n`, incluida la última.
- En Arduino, las líneas que empiezan con `#` (encabezados de modo) y las de autoprueba se ignoran al comparar.

### Secuencia canónica PISO

Obtenida con: cargar la página, activar D3, activar D1, aplicar un pulso de reloj, cambiar SH/LD̅ a 1 y aplicar cuatro pulsos más.

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

### Secuencia canónica PIPO

Obtenida con: activar D3, activar D1, aplicar un pulso, activar D3, activar D2, activar D1, activar D0 y aplicar otro pulso.

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

Estas dos secuencias son pruebas automatizadas (`TAB-04`, `TAB-05` en `src/logic/table.test.ts`) y, a la vez, el criterio de coincidencia con el Monitor Serie de Arduino (`HW-12`, `HW-13` en `docs/plan-de-pruebas.md`).

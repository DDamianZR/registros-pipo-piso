export interface Pregunta {
  id: string
  pregunta: string
  respuesta: string
}

export const preguntas: Pregunta[] = [
  {
    id: 'p1',
    pregunta: '¿Qué es un registro y qué función cumple en un sistema digital?',
    respuesta:
      'Un registro es un conjunto de flip-flops que comparten una señal de reloj y que, en conjunto, almacenan una palabra binaria de n bits. Cada flip-flop retiene un bit hasta el siguiente flanco activo de reloj, por lo que el registro conserva su contenido de forma estable entre operaciones. En un sistema digital cumple la función de memoria de corto plazo: guarda resultados intermedios, datos que llegan de un bus, o palabras que deben sincronizarse con el resto del circuito antes de usarse. Sin registros, las señales combinacionales cambiarían de forma continua y no habría un punto estable donde leer un dato. En esta práctica, los registros PIPO y PISO de 4 bits, implementados con cuatro flip-flops D, ilustran esa función de retención sincronizada.',
  },
  {
    id: 'p2',
    pregunta: '¿Cuál es la diferencia entre un registro PIPO y uno PISO?',
    respuesta:
      'PIPO (entrada paralela, salida paralela) carga los 4 bits al mismo tiempo en un flanco de reloj y los cuatro quedan disponibles simultáneamente en Q3..Q0; no tiene multiplexores ni señal de control adicional. PISO (entrada paralela, salida serial) también carga los 4 bits en paralelo, pero además puede desplazarlos uno por uno hacia una sola línea, SER_OUT = Q0, gracias a un multiplexor 2:1 por etapa controlado por SH/LD̅. En la demostración de la web, el PIPO muestra Q completo tras un solo pulso, mientras que el PISO necesita un pulso de carga y hasta tres pulsos de corrimiento más para exponer los cuatro bits, uno por flanco, en la salida serial.',
  },
  {
    id: 'p3',
    pregunta: '¿Por qué los cuatro flip-flops deben compartir la misma señal de reloj?',
    respuesta:
      'Si cada flip-flop capturara su bit en un instante distinto, la palabra almacenada podría mezclar bits de "antes" y "después" de un cambio en las entradas, produciendo un valor que nunca existió en la entrada real. Al conectar los cuatro flip-flops a un bus de reloj común, todos muestrean sus entradas D exactamente en el mismo flanco de subida, de modo que Q3..Q0 cambian de forma atómica y consistente. Esto es indispensable en el PISO, donde además el corrimiento depende de que las cuatro etapas lean el valor de la etapa vecina en el mismo instante; un reloj no compartido rompería la cadena y produciría corrimientos parciales o carreras de datos entre etapas.',
  },
  {
    id: 'p4',
    pregunta: '¿Qué ocurre con las salidas de un PIPO si cambian las entradas sin un flanco de reloj?',
    respuesta:
      'Las salidas Q3..Q0 no cambian: los flip-flops D solo actualizan su valor en el flanco de subida de CLK, así que entre flancos actúan como una barrera que aísla la salida de las variaciones en D. Esto se comprueba directamente en el laboratorio: si se activan o desactivan los interruptores D3–D0 sin presionar el botón de reloj, la sugerencia indica "Q conserva…" y la fila de la tabla registra el evento como "Cambio de entrada" sin modificar Q. Esta propiedad de retención es lo que distingue a un registro de un circuito puramente combinacional y es la base de la sincronización en sistemas digitales.',
  },
  {
    id: 'p5',
    pregunta: '¿Cuántos pulsos de reloj se requieren para transmitir los 4 bits en el PISO implementado y por qué?',
    respuesta:
      'Se necesita 1 pulso de carga (SH/LD̅ = 0) más 3 pulsos de corrimiento (SH/LD̅ = 1) para que los 4 bits pasen, uno por uno, por SER_OUT: tras la carga aparece D0, y cada corrimiento adicional expone D1, D2 y finalmente D3. Un cuarto corrimiento no es necesario para "ver" el último bit, pero si se aplica, el registro queda en 0000 porque entra un 0 por Q3 en cada corrimiento. Un receptor que muestree SER_OUT exactamente en cada flanco de corrimiento, sin embargo, necesita los 4 flancos para capturar D0..D3, ya que el primer flanco de corrimiento es el que hace visible el segundo bit, no el primero.',
  },
  {
    id: 'p6',
    pregunta: '¿Qué función cumple la señal SH/LD̅?',
    respuesta:
      'SH/LD̅ es la señal de control que selecciona, en cada etapa del PISO, cuál de las dos entradas del multiplexor 2:1 llega al flip-flop: con SH/LD̅ = 0 se selecciona la entrada paralela D_i (modo CARGA) y con SH/LD̅ = 1 se selecciona la salida de la etapa vecina, o GND en la primera etapa (modo CORRIMIENTO). Es una señal síncrona: el cambio de modo no altera Q por sí mismo, solo determina qué va a capturarse en el siguiente flanco de reloj. En la web, el selector "CARGA (0) / CORRIMIENTO (1)" controla exactamente esta señal, y el diagrama resalta con trazo continuo la ruta del multiplexor que está activa en cada momento.',
  },
  {
    id: 'p7',
    pregunta: '¿Qué diferencia hay entre carga síncrona y asíncrona?',
    respuesta:
      'La carga síncrona solo toma efecto en el flanco activo del reloj: la señal de control (como SH/LD̅) prepara qué dato se capturará, pero Q no cambia hasta que llega el flanco. La carga asíncrona, en cambio, actúa de inmediato, sin esperar al reloj, igual que CLR en este diseño, que pone Q en 0000 en el instante en que se activa. El PISO 74HC165 comercial usa carga asíncrona por su pin SH/LD̅ (activa la carga con solo cambiar el nivel), mientras que el PISO de esta práctica y el 74HC166 usan carga síncrona: el cambio de SH/LD̅ solo se refleja en el siguiente flanco de reloj, lo que simplifica el análisis temporal pero exige un pulso adicional para cargar.',
  },
  {
    id: 'p8',
    pregunta: '¿En qué orden salen los bits y en qué dirección ocurre el corrimiento en este diseño?',
    respuesta:
      'El corrimiento va hacia Q0, es decir, cada bit se mueve una posición hacia la derecha en el dibujo (Q3→Q2→Q1→Q0→SER_OUT) y entra un 0 por Q3 en cada flanco de corrimiento, ya que SER_IN está fijo a 0. Como consecuencia, los bits salen en orden LSB primero: si se carga la palabra D3D2D1D0, SER_OUT presenta primero D0, luego D1, D2 y por último D3. Esto significa que la secuencia observada en SER_OUT es la palabra "invertida" respecto al orden en que se escribió; por ejemplo, cargar 1010 produce en SER_OUT la secuencia 0,1,0,1. La carta de tiempos de la web muestra este patrón de forma explícita.',
  },
  {
    id: 'p9',
    pregunta: '¿Por qué se requiere antirrebote en el pulsador de reloj?',
    respuesta:
      'Un pulsador mecánico no cierra el contacto de forma limpia: al presionarlo, el contacto vibra durante unos milisegundos y produce varias transiciones rápidas de nivel antes de estabilizarse. Si esas transiciones llegaran directo al reloj de los flip-flops, cada rebote se interpretaría como un flanco de subida independiente, provocando varios corrimientos o cargas en lugar de uno solo por cada pulsación real. El sketch de Arduino resuelve esto con un filtro de tiempo de 30 ms: solo acepta un cambio de nivel como válido si se mantiene estable durante ese intervalo, de modo que 20 pulsaciones reales del botón produzcan exactamente 20 flancos registrados, ni más ni menos.',
  },
  {
    id: 'p10',
    pregunta: '¿Qué es una entrada flotante y cómo se evitó?',
    respuesta:
      'Una entrada flotante es un pin digital que no está conectado firmemente ni a un nivel alto ni a uno bajo; su voltaje queda determinado por ruido, capacitancias parásitas o interferencia electromagnética, por lo que el microcontrolador puede leer 0 o 1 de forma aparentemente aleatoria e inconsistente. En el circuito físico se evita activando la resistencia interna `INPUT_PULLUP` de cada pin de entrada (switches y pulsadores), que fija el nivel en alto (5 V) cuando el interruptor está abierto; al cerrarlo, el pin se conecta a GND y se lee en bajo. Así, cada entrada tiene siempre un nivel definido, sin necesidad de resistencias externas, y no se generan lecturas espurias como las que produciría un pin sin conexión.',
  },
  {
    id: 'p11',
    pregunta: '¿Qué circuitos integrados comerciales implementan estas funciones?',
    respuesta:
      'El 74HC175 es un registro cuádruple tipo D con reloj común y entrada CLR asíncrona, equivalente en comportamiento al PIPO de 4 bits de esta práctica. Para la función PISO, los circuitos de referencia trabajan con 8 bits en lugar de 4: el 74HC165 es un registro de entrada paralela y salida serial con carga asíncrona (activa por nivel en SH/LD̅), mientras que el 74HC166 ofrece la misma función pero con carga síncrona, igual que el diseño implementado aquí. Estos integrados se usan en la práctica para expandir el número de entradas o salidas digitales de un microcontrolador sin agotar sus pines, comunicándose con él mediante muy pocas líneas (reloj, datos y control).',
  },
  {
    id: 'p12',
    pregunta: 'Ventajas y desventajas de la transmisión serial frente a la paralela.',
    respuesta:
      'La transmisión paralela envía todos los bits al mismo tiempo, por lo que es más rápida para una misma frecuencia de reloj, pero requiere una línea física por cada bit, lo que encarece el cableado y los conectores a medida que crece el ancho de palabra, además de introducir problemas de sincronización entre líneas a distancias largas. La transmisión serial, como la que produce el PISO en SER_OUT, usa una sola línea de datos y por eso es más lenta para transferir la misma cantidad de información, ya que necesita un pulso de reloj por cada bit; a cambio, reduce drásticamente el número de conductores, es más robusta ante ruido e interferencia a distancias largas y es la base de protocolos ampliamente usados como UART, SPI y USB.',
  },
]

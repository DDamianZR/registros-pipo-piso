// Registros PIPO y PISO de 4 bits
// Practica 3 - Diseno de Sistemas Digitales
//
// Convencion de bits: Q3 y D3 son el MSB; Q0 y D0 son el LSB.
// PIPO: en cada flanco de reloj, next(Q) = D (los 4 bits a la vez).
// PISO: con SH/LD-negado = 0 (CARGA), next(Q) = D.
//       con SH/LD-negado = 1 (CORRIMIENTO), next(Q) = (Q >> 1) & 0x07,
//       es decir, entra un 0 por Q3 (SER_IN = 0) y el corrimiento va hacia Q0.
//       SER_OUT = Q0, siempre conectada de forma combinacional.
//
// El modo (PIPO/PISO) se elige con el switch MODO. Cambiarlo reinicia el registro.
// Por el Monitor Serie (115200 baudios) se imprime el mismo formato CSV que exporta
// la aplicacion web, para poder comparar linea por linea.

// ---------------------------------------------------------------------------
// Constantes: mapa de pines
// ---------------------------------------------------------------------------
const int PIN_CLK = 2;
const int PIN_CLR = 3;
const int PIN_D3 = 4;
const int PIN_D2 = 5;
const int PIN_D1 = 6;
const int PIN_D0 = 7;
const int PIN_SHLD = A0;
const int PIN_MODO = A1;

const int PIN_LED_Q3 = 12;
const int PIN_LED_Q2 = 11;
const int PIN_LED_Q1 = 10;
const int PIN_LED_Q0 = 9;
const int PIN_LED_SER = 8;
const int PIN_LED_L = 13;

// ---------------------------------------------------------------------------
// Constantes: temporizacion y protocolo
// ---------------------------------------------------------------------------
const unsigned long DEBOUNCE_MS = 30;
const unsigned long SERIAL_BAUD = 115200;
const unsigned long LAMP_TEST_MS = 500;
const int SER_IN = 0;
const bool AUTOTEST_AL_INICIAR = false;

const int MODO_PIPO = 0;
const int MODO_PISO = 1;

// ---------------------------------------------------------------------------
// Estructura de antirrebote y arreglo de entradas filtradas
// ---------------------------------------------------------------------------
struct EntradaFiltrada {
  int pin;
  int estadoEstable;
  int lecturaPrevia;
  unsigned long ultimoCambioMs;
};

enum IndiceEntrada { IDX_CLK, IDX_CLR, IDX_D3, IDX_D2, IDX_D1, IDX_D0, IDX_SHLD, IDX_MODO, NUM_ENTRADAS };

EntradaFiltrada entradas[NUM_ENTRADAS];

// ---------------------------------------------------------------------------
// Estado global
// ---------------------------------------------------------------------------
int modo = MODO_PIPO;
uint8_t q = 0;
uint8_t entradasPalabra = 0;
int shLd = 0;
uint16_t paso = 0;
int8_t corrimientosDesdeCarga = -1;

// ---------------------------------------------------------------------------
// Funciones puras, espejo de src/logic/registers.ts
// ---------------------------------------------------------------------------
uint8_t siguientePipo(uint8_t qActual, uint8_t d) {
  (void)qActual;
  return d & 0x0F;
}

uint8_t siguientePiso(uint8_t qActual, uint8_t d, int sh) {
  if (sh) {
    return (qActual >> 1) & 0x07;
  }
  return d & 0x0F;
}

int salidaSerial(uint8_t qActual) {
  return qActual & 1;
}

// ---------------------------------------------------------------------------
// Lectura de entradas
// ---------------------------------------------------------------------------
int leerLogico(int pin) {
  return digitalRead(pin) == LOW ? 1 : 0;
}

bool actualizarFiltro(EntradaFiltrada &e) {
  int lecturaCruda = leerLogico(e.pin);
  if (lecturaCruda != e.lecturaPrevia) {
    e.ultimoCambioMs = millis();
    e.lecturaPrevia = lecturaCruda;
  }
  if ((millis() - e.ultimoCambioMs) >= DEBOUNCE_MS && lecturaCruda != e.estadoEstable) {
    e.estadoEstable = lecturaCruda;
    return true;
  }
  return false;
}

uint8_t leerPalabraEntradas() {
  uint8_t d = 0;
  if (entradas[IDX_D3].estadoEstable) d |= 0x08;
  if (entradas[IDX_D2].estadoEstable) d |= 0x04;
  if (entradas[IDX_D1].estadoEstable) d |= 0x02;
  if (entradas[IDX_D0].estadoEstable) d |= 0x01;
  return d;
}

// ---------------------------------------------------------------------------
// Reinicio de modo (equivale a RESET_SIMULATION o a cambiar el switch MODO)
// ---------------------------------------------------------------------------
void imprimirFila(const char *evento);
void actualizarLeds();

void reiniciarModo() {
  q = 0;
  corrimientosDesdeCarga = -1;
  paso = 0;
  entradasPalabra = leerPalabraEntradas();
  shLd = entradas[IDX_SHLD].estadoEstable;

  Serial.print("# MODO ");
  Serial.println(modo == MODO_PISO ? "PISO" : "PIPO");
  Serial.println("paso,modo,evento,sh_ld,d3_d0,q3_q0,ser_out,bit_en_linea");
  imprimirFila("INICIO");
  actualizarLeds();
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------
void alFlancoReloj() {
  paso++;
  if (modo == MODO_PIPO) {
    q = siguientePipo(q, entradasPalabra);
    imprimirFila("CLK");
  } else if (shLd == 0) {
    q = siguientePiso(q, entradasPalabra, 0);
    corrimientosDesdeCarga = 0;
    imprimirFila("CLK_CARGA");
  } else {
    q = siguientePiso(q, entradasPalabra, 1);
    if (corrimientosDesdeCarga >= 0 && corrimientosDesdeCarga < 4) {
      corrimientosDesdeCarga++;
    }
    imprimirFila("CLK_CORRIMIENTO");
  }
}

void alBorrar() {
  paso++;
  q = 0;
  corrimientosDesdeCarga = -1;
  imprimirFila("CLR");
}

void alCambiarEntradas() {
  paso++;
  imprimirFila("ENTRADA");
}

void alCambiarControl() {
  if (modo != MODO_PISO) return;
  paso++;
  imprimirFila("CONTROL");
}

// ---------------------------------------------------------------------------
// Salidas: LEDs y fila CSV
// ---------------------------------------------------------------------------
void actualizarLeds() {
  digitalWrite(PIN_LED_Q3, ((q >> 3) & 1) ? HIGH : LOW);
  digitalWrite(PIN_LED_Q2, ((q >> 2) & 1) ? HIGH : LOW);
  digitalWrite(PIN_LED_Q1, ((q >> 1) & 1) ? HIGH : LOW);
  digitalWrite(PIN_LED_Q0, (q & 1) ? HIGH : LOW);
  digitalWrite(PIN_LED_SER, (modo == MODO_PISO && salidaSerial(q)) ? HIGH : LOW);
  digitalWrite(PIN_LED_L, modo == MODO_PISO ? HIGH : LOW);
}

void imprimirFila(const char *evento) {
  char bitEnLinea[4] = "-";
  if (modo == MODO_PISO && corrimientosDesdeCarga >= 0 && corrimientosDesdeCarga <= 3) {
    snprintf(bitEnLinea, sizeof(bitEnLinea), "D%d", corrimientosDesdeCarga);
  }

  Serial.print(paso);
  Serial.print(',');
  Serial.print(modo == MODO_PISO ? "PISO" : "PIPO");
  Serial.print(',');
  Serial.print(evento);
  Serial.print(',');
  modo == MODO_PISO ? Serial.print(shLd) : Serial.print('-');
  Serial.print(',');
  for (int i = 3; i >= 0; i--) {
    Serial.print((entradasPalabra >> i) & 1);
  }
  Serial.print(',');
  for (int i = 3; i >= 0; i--) {
    Serial.print((q >> i) & 1);
  }
  Serial.print(',');
  modo == MODO_PISO ? Serial.print(salidaSerial(q)) : Serial.print('-');
  Serial.print(',');
  Serial.println(modo == MODO_PISO ? bitEnLinea : "-");
}

// ---------------------------------------------------------------------------
// Autoprueba opcional (vectores de src/logic/registers.test.ts)
// ---------------------------------------------------------------------------
void autoprueba() {
  bool ok = true;
  if (siguientePipo(0, 0b1010) != 0b1010) ok = false;
  if (siguientePipo(0b1111, 0) != 0) ok = false;
  if (siguientePiso(0, 0b1010, 0) != 0b1010) ok = false;
  if (siguientePiso(0b1010, 0, 1) != 0b0101) ok = false;
  if (siguientePiso(0b1111, 0, 1) != 0b0111) ok = false;
  if (siguientePiso(0b0001, 0, 1) != 0) ok = false;
  if (salidaSerial(0b1011) != 1) ok = false;

  Serial.println(ok ? "# AUTOPRUEBA OK" : "# AUTOPRUEBA FALLO en registers");
}

// ---------------------------------------------------------------------------
// Configuracion inicial
// ---------------------------------------------------------------------------
void setup() {
  Serial.begin(SERIAL_BAUD);

  int pinesEntrada[NUM_ENTRADAS] = { PIN_CLK, PIN_CLR, PIN_D3, PIN_D2, PIN_D1, PIN_D0, PIN_SHLD, PIN_MODO };
  for (int i = 0; i < NUM_ENTRADAS; i++) {
    pinMode(pinesEntrada[i], INPUT_PULLUP);
    entradas[i].pin = pinesEntrada[i];
  }

  pinMode(PIN_LED_Q3, OUTPUT);
  pinMode(PIN_LED_Q2, OUTPUT);
  pinMode(PIN_LED_Q1, OUTPUT);
  pinMode(PIN_LED_Q0, OUTPUT);
  pinMode(PIN_LED_SER, OUTPUT);
  pinMode(PIN_LED_L, OUTPUT);

  // Prueba de lampara: todos los LEDs 500 ms encendidos y luego apagados.
  digitalWrite(PIN_LED_Q3, HIGH);
  digitalWrite(PIN_LED_Q2, HIGH);
  digitalWrite(PIN_LED_Q1, HIGH);
  digitalWrite(PIN_LED_Q0, HIGH);
  digitalWrite(PIN_LED_SER, HIGH);
  digitalWrite(PIN_LED_L, HIGH);
  delay(LAMP_TEST_MS);
  digitalWrite(PIN_LED_Q3, LOW);
  digitalWrite(PIN_LED_Q2, LOW);
  digitalWrite(PIN_LED_Q1, LOW);
  digitalWrite(PIN_LED_Q0, LOW);
  digitalWrite(PIN_LED_SER, LOW);
  digitalWrite(PIN_LED_L, LOW);

  // Se inicializan los filtros con la lectura actual para que el arranque
  // no produzca eventos falsos.
  for (int i = 0; i < NUM_ENTRADAS; i++) {
    int lectura = leerLogico(entradas[i].pin);
    entradas[i].estadoEstable = lectura;
    entradas[i].lecturaPrevia = lectura;
    entradas[i].ultimoCambioMs = millis();
  }

  modo = entradas[IDX_MODO].estadoEstable;

  if (AUTOTEST_AL_INICIAR) {
    autoprueba();
  }

  reiniciarModo();
}

// ---------------------------------------------------------------------------
// Bucle principal
// ---------------------------------------------------------------------------
void loop() {
  bool cambios[NUM_ENTRADAS];
  for (int i = 0; i < NUM_ENTRADAS; i++) {
    cambios[i] = actualizarFiltro(entradas[i]);
  }

  // Orden de prioridad: MODO, CLR, CLK, ENTRADAS, CONTROL.
  if (cambios[IDX_MODO]) {
    modo = entradas[IDX_MODO].estadoEstable;
    reiniciarModo();
    return;
  }

  if (cambios[IDX_CLR] && entradas[IDX_CLR].estadoEstable == 1) {
    alBorrar();
  }

  if (cambios[IDX_CLK] && entradas[IDX_CLK].estadoEstable == 1) {
    alFlancoReloj();
  }

  if (cambios[IDX_D3] || cambios[IDX_D2] || cambios[IDX_D1] || cambios[IDX_D0]) {
    entradasPalabra = leerPalabraEntradas();
    alCambiarEntradas();
  }

  if (cambios[IDX_SHLD]) {
    shLd = entradas[IDX_SHLD].estadoEstable;
    alCambiarControl();
  }

  actualizarLeds();
}

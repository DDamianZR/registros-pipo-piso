function TheorySection() {
  return (
    <>
      <h3>¿Qué es un registro?</h3>
      <p>
        Un registro es un banco de flip-flops D disparados por flanco de subida que comparten la misma señal de
        reloj. En cada flanco ↑, cada flip-flop captura el valor presente en su entrada D y lo conserva en su salida
        Q hasta el siguiente flanco, sin importar lo que ocurra con D mientras tanto.
      </p>

      <h3>PIPO: entrada paralela, salida paralela</h3>
      <p>
        Los cuatro flip-flops reciben directamente las entradas D3..D0 y comparten reloj y borrado asíncrono (CLR).
        En cada flanco, Q ← D para las cuatro etapas a la vez: <code className="mono">next(Q) = D</code>.
      </p>

      <h3>PISO: entrada paralela, salida serial</h3>
      <p>
        Cada etapa agrega un multiplexor 2:1 que decide, según SH/LD̅, si el flip-flop captura la entrada paralela
        D_i (carga) o el bit de la etapa vecina (corrimiento hacia Q0), con GND fijo como entrada serial
        (SER_IN = 0) en la primera etapa. En notación booleana, con SH = SH/LD̅:
      </p>
      <pre className="bloque-ecuaciones mono">
        {'D_ff3 = SH·0    + SH̅·D3\nD_ff2 = SH·Q3   + SH̅·D2\nD_ff1 = SH·Q2   + SH̅·D1\nD_ff0 = SH·Q1   + SH̅·D0'}
      </pre>

      <div className="tarjeta-convencion">
        <h4>Convención de bits</h4>
        <p>
          Q3 y D3 son el MSB; Q0 y D0 son el LSB. El corrimiento equivale a <code className="mono">Q &gt;&gt; 1</code>
          , y por eso los bits salen en orden LSB primero: la secuencia en SER_OUT aparece invertida respecto a la
          palabra escrita.
        </p>
        <table className="tabla-convencion">
          <thead>
            <tr>
              <th>Momento</th>
              <th>Q3..Q0</th>
              <th>SER_OUT</th>
              <th>Bit en línea</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tras CLK_CARGA</td>
              <td className="mono">D3 D2 D1 D0</td>
              <td className="mono">D0</td>
              <td>D0 (1.º)</td>
            </tr>
            <tr>
              <td>Tras 1.er corrimiento</td>
              <td className="mono">0 D3 D2 D1</td>
              <td className="mono">D1</td>
              <td>D1 (2.º)</td>
            </tr>
            <tr>
              <td>Tras 2.º corrimiento</td>
              <td className="mono">0 0 D3 D2</td>
              <td className="mono">D2</td>
              <td>D2 (3.º)</td>
            </tr>
            <tr>
              <td>Tras 3.er corrimiento</td>
              <td className="mono">0 0 0 D3</td>
              <td className="mono">D3</td>
              <td>D3 (4.º)</td>
            </tr>
            <tr>
              <td>Tras 4.º corrimiento</td>
              <td className="mono">0 0 0 0</td>
              <td className="mono">0</td>
              <td>— (vacío)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>¿Cuántos pulsos se necesitan?</h3>
      <p>
        Con 1 pulso de carga y 3 de corrimiento, los 4 bits quedan presentes, uno a la vez, en SER_OUT; el cuarto
        corrimiento deja el registro en 0000.
      </p>
      <p>
        Si un receptor muestrea SER_OUT en cada flanco de corrimiento, justo antes de que cambie, captura D0, D1, D2
        y D3 en los flancos de corrimiento 1 a 4. En circuitos comerciales, el 74HC165 carga de forma asíncrona y el
        74HC166 de forma síncrona, como este diseño.
      </p>

      <h3>Carga síncrona frente a asíncrona</h3>
      <p>
        CLR es asíncrono: pone Q en 0000 de inmediato, sin esperar al reloj. En cambio, SH/LD̅ es síncrono: cambiar
        su valor no altera Q hasta que llega el siguiente flanco de reloj, que es cuando el multiplexor
        seleccionado realmente se captura.
      </p>
    </>
  )
}

export default TheorySection

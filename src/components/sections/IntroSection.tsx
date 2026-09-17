function IntroSection() {
  return (
    <>
      <p>
        Simulador interactivo y circuito físico de dos registros de 4 bits: PIPO (entrada y salida paralela) y PISO
        (entrada paralela, salida serial), con reloj común para los cuatro flip-flops.
      </p>
      <ol className="pasos-uso">
        <li>Elige la pestaña PIPO o PISO en el laboratorio y configura los interruptores D3–D0.</li>
        <li>Aplica un pulso de reloj y observa el diagrama, la carta de tiempos y la tabla actualizarse juntos.</li>
        <li>En PISO, cambia SH/LD̅ a CORRIMIENTO y aplica varios pulsos para ver los bits salir por SER_OUT.</li>
      </ol>
      <a href="#laboratorio" className="boton-pulso boton-pulso--clock enlace-boton">
        Ir al laboratorio
      </a>
    </>
  )
}

export default IntroSection

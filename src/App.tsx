import SiteHeader from './components/layout/SiteHeader'
import SiteFooter from './components/layout/SiteFooter'
import Section from './components/layout/Section'

function App() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section id="inicio" title="Registros PIPO y PISO de 4 bits" wide>
          <p>Laboratorio interactivo de registros PIPO y PISO de 4 bits. Contenido temporal.</p>
        </Section>
        <Section id="fundamentos" eyebrow="Fundamentos" title="PIPO vs. PISO">
          <p>Contenido temporal.</p>
        </Section>
        <Section id="laboratorio" eyebrow="Laboratorio" title="Simulador interactivo" wide>
          <p>Contenido temporal.</p>
          <h3 id="tiempos" className="ancla-interna">
            Carta de tiempos
          </h3>
          <p>Contenido temporal.</p>
          <h3 id="tabla" className="ancla-interna">
            Tabla de funcionamiento
          </h3>
          <p>Contenido temporal.</p>
        </Section>
        <Section id="arduino" eyebrow="Hardware" title="Circuito con Arduino" wide>
          <p>Contenido temporal.</p>
        </Section>
        <Section id="resultados" eyebrow="Resultados" title="Resultados de referencia" wide>
          <p>Contenido temporal.</p>
        </Section>
        <Section id="preguntas" eyebrow="Preguntas" title="Preguntas de la práctica">
          <p>Contenido temporal.</p>
        </Section>
      </main>
      <SiteFooter />
    </>
  )
}

export default App

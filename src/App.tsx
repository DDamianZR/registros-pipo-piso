import SiteHeader from './components/layout/SiteHeader'
import SiteFooter from './components/layout/SiteFooter'
import Section from './components/layout/Section'
import LabPanel from './components/lab/LabPanel'
import IntroSection from './components/sections/IntroSection'
import TheorySection from './components/sections/TheorySection'
import ResultsSection from './components/sections/ResultsSection'
import QuestionsSection from './components/sections/QuestionsSection'

function App() {
  return (
    <>
      <SiteHeader />
      <main>
        <Section id="inicio" title="Registros PIPO y PISO de 4 bits" wide>
          <IntroSection />
        </Section>
        <Section id="fundamentos" eyebrow="Fundamentos" title="PIPO vs. PISO">
          <TheorySection />
        </Section>
        <Section id="laboratorio" eyebrow="Laboratorio" title="Simulador interactivo" wide>
          <LabPanel />
        </Section>
        <Section id="arduino" eyebrow="Hardware" title="Circuito con Arduino" wide>
          <p>Contenido temporal.</p>
        </Section>
        <Section id="resultados" eyebrow="Resultados" title="Resultados de referencia" wide>
          <ResultsSection />
        </Section>
        <Section id="preguntas" eyebrow="Preguntas" title="Preguntas de la práctica">
          <QuestionsSection />
        </Section>
      </main>
      <SiteFooter />
    </>
  )
}

export default App

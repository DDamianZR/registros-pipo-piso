import { preguntas } from '../../content/preguntas'

function QuestionsSection() {
  return (
    <>
      <p className="nota-preguntas">Preguntas de referencia; ajústalas al enunciado oficial de la práctica.</p>
      <div className="acordeon-preguntas">
        {preguntas.map((item) => (
          <details key={item.id} className="acordeon-preguntas__item">
            <summary>{item.pregunta}</summary>
            <p>{item.respuesta}</p>
          </details>
        ))}
      </div>
    </>
  )
}

export default QuestionsSection

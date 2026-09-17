import { bitAt, toBitString } from '../../logic/bits'
import type { SimState } from '../../logic/simulator'

interface SerialOutputStripProps {
  state: SimState
}

const RANURAS = [1, 2, 3, 4] as const

function SerialOutputStrip({ state }: SerialOutputStripProps) {
  const { shiftsSinceLoad, loadedWord } = state

  return (
    <div className="salida-serial">
      <div className="salida-serial__ranuras">
        {RANURAS.map((n) => {
          const visible = shiftsSinceLoad !== null && loadedWord !== null && n <= shiftsSinceLoad + 1
          const resaltada = shiftsSinceLoad !== null && shiftsSinceLoad + 1 === n && n <= 4
          const bit = visible && loadedWord !== null ? bitAt(loadedWord, n - 1) : null

          return (
            <div key={n} className={`salida-serial__ranura${resaltada ? ' salida-serial__ranura--activa' : ''}`}>
              <span className="salida-serial__orden">{n}.º</span>
              <span className="salida-serial__bit mono">{bit === null ? '–' : bit}</span>
            </div>
          )
        })}
      </div>
      {shiftsSinceLoad !== null && shiftsSinceLoad >= 3 && loadedWord !== null && (
        <p className="salida-serial__palabra mono">Palabra reconstruida: {toBitString(loadedWord)}</p>
      )}
    </div>
  )
}

export default SerialOutputStrip

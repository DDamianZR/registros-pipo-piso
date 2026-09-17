import Led from '../controls/Led'
import { bitAt, toBitString } from '../../logic/bits'
import { serialOut } from '../../logic/registers'
import type { SimState } from '../../logic/simulator'

interface RegisterReadoutProps {
  state: SimState
}

const ETAPAS = [3, 2, 1, 0] as const

function RegisterReadout({ state }: RegisterReadoutProps) {
  return (
    <div className="lectura-registro">
      <div className="lectura-registro__leds">
        {ETAPAS.map((i) => (
          <Led key={i} label={`Q${i}`} on={bitAt(state.q, i) === 1} tone="q" />
        ))}
        {state.kind === 'PISO' && <Led label="SER_OUT" on={serialOut(state.q) === 1} tone="serial" />}
      </div>
      <p className="lectura-registro__palabra mono">Q = {toBitString(state.q)}</p>
    </div>
  )
}

export default RegisterReadout

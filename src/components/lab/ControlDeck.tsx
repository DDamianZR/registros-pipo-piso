import BitSwitch from '../controls/BitSwitch'
import PushButton from '../controls/PushButton'
import SegmentedControl from '../controls/SegmentedControl'
import { bitAt } from '../../logic/bits'
import type { SimAction, SimState } from '../../logic/simulator'

interface ControlDeckProps {
  state: SimState
  dispatch: (action: SimAction) => void
}

const ETAPAS = [3, 2, 1, 0] as const

function ControlDeck({ state, dispatch }: ControlDeckProps) {
  const subtituloClk =
    state.kind === 'PISO' ? (state.shLd === 0 ? 'cargará D' : 'desplazará →') : 'carga paralela'

  return (
    <div className="control-deck">
      <div className="control-deck__switches">
        {ETAPAS.map((i) => (
          <BitSwitch
            key={i}
            label={`D${i}`}
            value={bitAt(state.inputs, i)}
            onToggle={() => dispatch({ type: 'TOGGLE_INPUT', bit: i })}
          />
        ))}
      </div>

      {state.kind === 'PISO' && (
        <SegmentedControl
          ariaLabel="SH/LD̅: carga o corrimiento"
          value={String(state.shLd)}
          onChange={(value) => dispatch({ type: 'SET_SH_LD', value: value === '1' ? 1 : 0 })}
          options={[
            { value: '0', label: 'CARGA (0)' },
            { value: '1', label: 'CORRIMIENTO (1)' },
          ]}
        />
      )}

      <div className="control-deck__botones">
        <PushButton
          label={`Pulso de reloj (${subtituloClk})`}
          variant="clock"
          onPress={() => dispatch({ type: 'CLOCK_PULSE' })}
        />
        <PushButton label="CLR" variant="clear" onPress={() => dispatch({ type: 'CLEAR' })} />
      </div>
    </div>
  )
}

export default ControlDeck

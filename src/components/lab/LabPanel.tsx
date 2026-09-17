import { useReducer, useState } from 'react'
import { createInitialState, simulatorReducer } from '../../logic/simulator'
import type { SimKind } from '../../logic/simulator'
import SegmentedControl from '../controls/SegmentedControl'
import ControlDeck from './ControlDeck'
import RegisterReadout from './RegisterReadout'
import SerialOutputStrip from './SerialOutputStrip'
import HintBar from './HintBar'

function LabPanel() {
  const [pipoState, pipoDispatch] = useReducer(simulatorReducer, 'PIPO', createInitialState)
  const [pisoState, pisoDispatch] = useReducer(simulatorReducer, 'PISO', createInitialState)
  const [activeKind, setActiveKind] = useState<SimKind>('PIPO')

  const state = activeKind === 'PIPO' ? pipoState : pisoState
  const dispatch = activeKind === 'PIPO' ? pipoDispatch : pisoDispatch

  return (
    <div className="panel-laboratorio">
      <SegmentedControl
        ariaLabel="Selecciona el registro a simular"
        value={activeKind}
        onChange={(value) => setActiveKind(value as SimKind)}
        options={[
          { value: 'PIPO', label: 'PIPO' },
          { value: 'PISO', label: 'PISO' },
        ]}
      />
      <div className="panel-laboratorio__area">
        <div className="panel-laboratorio__controles">
          <ControlDeck state={state} dispatch={dispatch} />
          <RegisterReadout state={state} />
          {state.kind === 'PISO' && <SerialOutputStrip state={state} />}
          <HintBar state={state} />
        </div>
      </div>
    </div>
  )
}

export default LabPanel

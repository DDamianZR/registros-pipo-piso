import { nextHint } from '../../logic/hints'
import type { SimState } from '../../logic/simulator'

interface HintBarProps {
  state: SimState
}

function HintBar({ state }: HintBarProps) {
  return (
    <p className="barra-sugerencia" aria-live="polite">
      {nextHint(state)}
    </p>
  )
}

export default HintBar

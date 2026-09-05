import { useEffect } from 'react'
import { emptyColumnCount } from '../game/boardQueries'
import { useGame } from '../state/useGame'
import { Column } from './Column'
import { Stock } from './Stock'
import { ParticleBurst } from './effects/ParticleBurst'

export function Board() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    if (state.lastMatchResult === 'incorrect') {
      const t = setTimeout(() => dispatch({ type: 'CLEAR_SELECTION' }), 500)
      return () => clearTimeout(t)
    }
    if (state.lastMatchResult === 'correct') {
      const t = setTimeout(() => dispatch({ type: 'ACK_ANIMATION' }), 700)
      return () => clearTimeout(t)
    }
  }, [state.lastMatchResult, dispatch])

  const canDraw = state.stock.length > 0 && emptyColumnCount(state.tableau) > 0

  return (
    <div className="board">
      <div className="board__columns">
        {state.tableau.map((column, i) => (
          <Column
            key={i}
            column={column}
            selected={state.selected}
            shake={state.lastMatchResult === 'incorrect'}
            onCardClick={(cardId) => dispatch({ type: 'SELECT_CARD', cardId })}
          />
        ))}
      </div>
      <Stock count={state.stock.length} canDraw={canDraw} onDraw={() => dispatch({ type: 'DRAW_STOCK' })} />
      {state.lastMatchResult === 'correct' && <ParticleBurst />}
    </div>
  )
}

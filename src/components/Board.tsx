import { useEffect } from 'react'
import { useGame } from '../state/useGame'
import { Column } from './Column'
import { Foundations } from './Foundations'
import { Stock } from './Stock'
import { ParticleBurst } from './effects/ParticleBurst'

export function Board() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    if (state.lastAction === 'deposit-wrong') {
      const t = setTimeout(() => dispatch({ type: 'ACK_ANIMATION' }), 500)
      return () => clearTimeout(t)
    }
    if (state.lastAction === 'deposit-correct' || state.lastAction === 'promote' || state.lastAction === 'stack') {
      const t = setTimeout(() => dispatch({ type: 'ACK_ANIMATION' }), 700)
      return () => clearTimeout(t)
    }
  }, [state.lastAction, dispatch])

  const canDraw = state.stock.length > 0
  const shakeCardId = state.lastAction === 'deposit-wrong' ? state.selectedWordId : null

  return (
    <div className="board">
      <Foundations
        foundations={state.foundations}
        isHolding={state.selectedWordId !== null}
        shakeCategoryId={state.lastAction === 'deposit-wrong' ? state.lastDepositCategory : null}
        onDeposit={(categoryId) => dispatch({ type: 'DEPOSIT', categoryId })}
      />

      <div className="monte-row">
        <Stock count={state.stock.length} canDraw={canDraw} onDraw={() => dispatch({ type: 'DRAW_STOCK' })} />
        <div className="waste">
          <Column
            column={state.waste}
            heldWordId={state.selectedWordId}
            shakeCardId={shakeCardId}
            onWordClick={(cardId) => dispatch({ type: 'SELECT_WORD', cardId })}
            onCategoryClick={(cardId) => dispatch({ type: 'PROMOTE_CATEGORY', cardId })}
          />
        </div>
      </div>

      <div className="board__columns">
        {state.tableau.map((column, i) => (
          <Column
            key={i}
            column={column}
            heldWordId={state.selectedWordId}
            shakeCardId={shakeCardId}
            onWordClick={(cardId) => dispatch({ type: 'SELECT_WORD', cardId })}
            onCategoryClick={(cardId) => dispatch({ type: 'PROMOTE_CATEGORY', cardId })}
            onEmptyClick={() => dispatch({ type: 'MOVE_TO_EMPTY', colIndex: i })}
          />
        ))}
      </div>
      {state.lastAction === 'deposit-correct' && <ParticleBurst />}
    </div>
  )
}

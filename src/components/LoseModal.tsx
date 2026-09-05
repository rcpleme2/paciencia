export function LoseModal({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Fim de jogo</h2>
        <p>Você ficou sem jogadas ou associações possíveis.</p>
        <button onClick={onRetry}>Tentar novamente</button>
      </div>
    </div>
  )
}

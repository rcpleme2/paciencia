export function WinModal({ levelNumber, onNext }: { levelNumber: number; onNext: () => void }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Nível {levelNumber} concluído! 🎉</h2>
        <p>Todas as cartas foram associadas corretamente.</p>
        <button onClick={onNext}>Próximo nível</button>
      </div>
    </div>
  )
}

interface Props { onClose: () => void }

export default function LinneaProfileModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          <img src="/linneaaichat.jpeg" alt="Linnea" />
        </div>
        <div className="modal-body">
          <h2>Linnea</h2>
          <div className="modal-tag">Adventurers' Guild · Geo Vision</div>
          <div className="modal-info">
            <div className="modal-info-item"><div className="label">Nation</div><div className="value">Snezhnaya</div></div>
            <div className="modal-info-item"><div className="label">Vision</div><div className="value">Geo</div></div>
            <div className="modal-info-item"><div className="label">Companion</div><div className="value">Lumi</div></div>
            <div className="modal-info-item"><div className="label">Role</div><div className="value">Mentor & Instructor</div></div>
            <div className="modal-info-item"><div className="label">Friends</div><div className="value">Kirara, Furina, Sandrone</div></div>
            <div className="modal-info-item"><div className="label">Modes</div><div className="value">Art · CS · Literature</div></div>
          </div>
          <p className="modal-desc">
            Linnea is a warm, patient mentor from the Adventurers' Guild of Teyvat. She travels with her
            small companion Lumi and carries a Geo Vision. She teaches art, computer science, and
            literature — always with honest, constructive guidance and a touch of creativity inspired by
            her friends across Teyvat.
          </p>
        </div>
      </div>
    </div>
  );
}

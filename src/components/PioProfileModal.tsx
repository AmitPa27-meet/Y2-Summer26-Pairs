interface Props { onClose: () => void }

export default function PioProfileModal({ onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          <div className="avatar-placeholder">
            <img src="/WhatsApp_Image_2026-07-17_at_18.09.58.jpeg" alt="Pio" />
          </div>
        </div>
        <div className="modal-body">
          <h2>Pio</h2>
          <div className="modal-tag">College Counselor · High School Guide</div>
          <div className="modal-info">
            <div className="modal-info-item"><div className="label">Role</div><div className="value">College Counselor</div></div>
            <div className="modal-info-item"><div className="label">Audience</div><div className="value">High School Students</div></div>
            <div className="modal-info-item"><div className="label">Specialty</div><div className="value">Majors & Universities</div></div>
            <div className="modal-info-item"><div className="label">Tools</div><div className="value">Quizzes & Links</div></div>
          </div>
          <p className="modal-desc">
            Pio is a personalized college counselor who helps high school students explore majors and
            universities. He tailors advice to each student's interests, strengths, and intended study
            location — and always encourages independent research.
          </p>
        </div>
      </div>
    </div>
  );
}

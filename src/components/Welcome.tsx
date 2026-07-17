interface Props {
  onChoose: (agent: 'linnea' | 'pio') => void;
}

export default function Welcome({ onChoose }: Props) {
  return (
    <div className="welcome">
      <div className="welcome-title">
        <h1>Welcome to Teyvat Mentor</h1>
        <p>Your guide to exploring majors, discovering your passions, and growing your skills. Choose a mentor to begin your journey.</p>
      </div>
      <div className="welcome-cards">
        <div className="welcome-card" onClick={() => onChoose('linnea')}>
          <img src="/linneaaichat.jpeg" alt="Linnea" />
          <h3>Linnea</h3>
          <div className="card-role">Art · CS · Literature Mentor</div>
          <p>
            Explore and practice your craft. Linnea offers honest art critiques, computer science
            tutoring, and creative writing guidance across three modes. Send artwork for feedback,
            discuss art history, debug code, or refine your writing.
          </p>
          <div className="card-btn">Chat with Linnea</div>
        </div>
        <div className="welcome-card" onClick={() => onChoose('pio')}>
          <div className="card-avatar-placeholder">
            <img src="/WhatsApp_Image_2026-07-17_at_18.09.58.jpeg" alt="Pio" />
          </div>
          <h3>Pio</h3>
          <div className="card-role">College & Major Counselor</div>
          <p>
            Find the major that fits you. Pio helps you explore universities and fields of study,
            sends personality tests, and provides tailored guidance based on your interests,
            strengths, and where you want to study.
          </p>
          <div className="card-btn">Chat with Pio</div>
        </div>
      </div>
    </div>
  );
}

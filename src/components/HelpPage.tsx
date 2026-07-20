interface Props { onBack: () => void }

export default function HelpPage({ onBack }: Props) {
  return (
    <div className="help-page">
      <button className="help-back" onClick={onBack}>← Back to chat</button>
      <h1>Help & Guide</h1>
      <p className="help-intro">Lost? Here's everything you can do in Teyvat Mentor.</p>

      <div className="help-section">
        <h3>🎨 Linnea — Art, CS & Literature Mentor</h3>
        <ul>
          <li><b>Mode A (Art):</b> Send your artwork for an honest, constructive critique. Linnea will identify weaknesses directly and explain how to fix them.</li>
          <li><b>Mode B (Computer Science):</b> Ask about algorithms, data structures, debugging, code review, programming concepts, and coding exercises.</li>
          <li><b>Mode C (Literature):</b> Get help with creative writing, literary analysis, poetry, essays, story development, and grammar.</li>
          <li><b>Switch modes</b> using the three buttons on the left side of the message bar (Art, CS, Literature).</li>
          <li><b>Send images:</b> Click the camera button (right side of the message bar) to attach artwork. Images stay visible in the chat.</li>
          <li>Linnea remembers details about you across conversations — your name, skill level, art style, and goals.</li>
          <li>Click Linnea's profile picture to learn more about her.</li>
        </ul>
      </div>

      <div className="help-section">
        <h3>🎓 Pio — College Counselor</h3>
        <ul>
          <li>Tell Pio your interests, strengths, and where you'd like to study — he'll suggest majors and universities that fit you.</li>
          <li>Pio can share personality tests and useful links to help you explore careers.</li>
          <li>He scores your responses on creativity, grammar, and punctuation to help you improve.</li>
          <li>Click Pio's profile picture to learn more about him.</li>
        </ul>
      </div>

      <div className="help-section">
        <h3>⚙️ General Features</h3>
        <ul>
          <li><b>Theme colors:</b> Click the palette icon in the top-right to change the chat color scheme. Your choice is saved automatically.</li>
          <li><b>Your name:</b> Enter your name in the header — both mentors will remember it.</li>
          <li><b>Switch agents:</b> Use the sidebar on the left to switch between Linnea and Pio, or return to the welcome screen.</li>
          <li><b>Conversation history:</b> All your chats are saved and restored when you return.</li>
          <li><b>Help:</b> Click the question mark icon in the top-right to return to this page at any time.</li>
        </ul>
      </div>
    </div>
  );
}

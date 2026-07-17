import { useEffect, useRef, useState } from 'react';
import { Message, getSessionId, loadConversation, saveConversationMessage } from '../lib/supabase';
import { PIO_SYSTEM } from '../lib/prompts';
import { callPio } from '../lib/api';
import PioProfileModal from './PioProfileModal';

function formatResponse(text: string): string {
  return text.replace(/\[Summary\]:/gi, '\n[Summary]:').replace(/\[Response\]:/gi, '\n[Response]:').replace(/\[Next Step\]:/gi, '\n[Next Step]:').replace(/^\n+/, '').trim();
}

interface Props {
  userName: string;
  onUserNameChange: (n: string) => void;
  onOpenHelp: () => void;
}

export default function PioChat({ userName, onUserNameChange, onOpenHelp }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = getSessionId();

  useEffect(() => { (async () => { setMessages(await loadConversation(sessionId, 'pio')); })(); }, [sessionId]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  async function handleSend() {
    if (!input.trim() || loading) return;
    setError(null);
    const userText = input.trim();
    setInput('');
    const userMsg: Message = { id: `u_${Date.now()}`, role: 'user', content: userText, createdAt: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    saveConversationMessage(sessionId, 'pio', userMsg);
    setLoading(true);
    try {
      const text = await callPio(PIO_SYSTEM, next.map((m) => ({ role: m.role, content: m.content })));
      const replyMsg: Message = { id: `a_${Date.now()}`, role: 'assistant', content: formatResponse(text), createdAt: Date.now() };
      setMessages([...next, replyMsg]);
      saveConversationMessage(sessionId, 'pio', replyMsg);
    } catch (e: any) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  function onKeyDown(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }

  return (
    <div className="main">
      <div className="chat-header">
        <img src="/WhatsApp_Image_2026-07-17_at_18.09.58.jpeg" alt="Pio" className="agent-avatar" onClick={() => setShowProfile(true)} />
        <div>
          <div className="agent-name">Pio</div>
          <div className="agent-sub">College Counselor</div>
        </div>
        <div className="header-actions">
          <input className="user-name-input" placeholder="Your name" value={userName} onChange={(e) => onUserNameChange(e.target.value)} />
          <div className="user-avatar-header">{userName ? userName[0].toUpperCase() : 'U'}</div>
          <button className="header-btn" onClick={onOpenHelp} title="Help">?</button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="messages" ref={scrollRef}>
        {messages.length === 0 && !loading && (
          <div className="empty-state">
            <div className="big-icon">🎓</div>
            <h3>Hi, I'm Pio!</h3>
            <p>I'm your personalized college counselor. Tell me about your interests, strengths, and where you'd like to study — I'll help you find the right major and university.</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg-row ${m.role}`}>
            {m.role === 'assistant' ? (
              <img src="/WhatsApp_Image_2026-07-17_at_18.09.58.jpeg" className="msg-avatar" alt="Pio" />
            ) : (
              <div className="msg-avatar placeholder" style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary))' }}>
                {userName ? userName[0].toUpperCase() : 'U'}
              </div>
            )}
            <div className="msg-bubble">{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="msg-row assistant">
            <img src="/WhatsApp_Image_2026-07-17_at_18.09.58.jpeg" className="msg-avatar" alt="Pio" />
            <div className="msg-bubble"><div className="typing"><span></span><span></span><span></span></div></div>
          </div>
        )}
      </div>

      {loading && <div className="loading-bar" />}

      <div className="composer">
        <textarea className="composer-input" placeholder="Message Pio…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} rows={1} />
        <button className="composer-btn" onClick={handleSend} disabled={loading || !input.trim()} aria-label="Send">
          <span className="icon">➤</span>
        </button>
      </div>

      {showProfile && <PioProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

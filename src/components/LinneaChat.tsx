import { useEffect, useRef, useState } from 'react';
import {
  Message, LinneaMode, getSessionId, loadMemories, saveMemory,
  saveImageRecord, loadConversation, saveConversationMessage,
} from '../lib/supabase';
import { LINNEA_MODE_A, LINNEA_MODE_B, LINNEA_MODE_C } from '../lib/prompts';
import { callLinnea } from '../lib/api';
import LinneaProfileModal from './LinneaProfileModal';

const MODE_PROMPTS: Record<LinneaMode, string> = { A: LINNEA_MODE_A, B: LINNEA_MODE_B, C: LINNEA_MODE_C };
const MODE_LABELS: Record<LinneaMode, string> = { A: 'Mode A — Art', B: 'Mode B — Computer Science', C: 'Mode C — Literature' };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file); });
}
function formatResponse(text: string): string {
  return text.replace(/\[Summary\]:/gi, '\n[Summary]:').replace(/\[Response\]:/gi, '\n[Response]:').replace(/\[Next Step\]:/gi, '\n[Next Step]:').replace(/^\n+/, '').trim();
}

interface Props {
  userName: string;
  onUserNameChange: (n: string) => void;
  onOpenHelp: () => void;
}

export default function LinneaChat({ userName, onUserNameChange, onOpenHelp }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<LinneaMode>('A');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [memories, setMemories] = useState<{ key: string; value: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionId = getSessionId();

  useEffect(() => {
    (async () => {
      const [mems, conv] = await Promise.all([loadMemories(sessionId), loadConversation(sessionId, 'linnea')]);
      setMemories(mems);
      setMessages(conv);
    })();
  }, [sessionId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }); }, [messages, loading]);

  async function handleSend() {
    if ((!input.trim() && pendingImages.length === 0) || loading) return;
    setError(null);
    const userImages = [...pendingImages];
    const userText = input.trim();
    setInput('');
    setPendingImages([]);

    const userMsg: Message = {
      id: `u_${Date.now()}`, role: 'user',
      content: userText || (userImages.length ? '(image sent)' : ''),
      imageUrl: userImages[0], createdAt: Date.now(),
    };
    const next = [...messages, userMsg];
    setMessages(next);
    saveConversationMessage(sessionId, 'linnea', userMsg);
    if (userImages[0]) saveImageRecord(userImages[0], 'user_upload', mode);

    setLoading(true);
    const apiMessages: any[] = next.map((m) => {
      if (m.imageUrl) {
        return { role: m.role, content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: m.imageUrl.split(',')[1] } },
          { type: 'text', text: m.content || 'Please review this image.' },
        ]};
      }
      return { role: m.role, content: m.content };
    });

    try {
      const { text, newMemories } = await callLinnea(MODE_PROMPTS[mode], apiMessages, memories);
      for (const m of newMemories) await saveMemory(sessionId, m.key, m.value);
      if (newMemories.length) {
        setMemories((prev) => {
          const map = new Map(prev.map((x) => [x.key, x.value]));
          for (const m of newMemories) map.set(m.key, m.value);
          return Array.from(map, ([k, v]) => ({ key: k, value: v }));
        });
      }
      const replyMsg: Message = { id: `a_${Date.now()}`, role: 'assistant', content: formatResponse(text), createdAt: Date.now() };
      setMessages([...next, replyMsg]);
      saveConversationMessage(sessionId, 'linnea', replyMsg);
    } catch (e: any) { setError(e.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  }

  function onKeyDown(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const urls: string[] = [];
    for (const f of Array.from(files)) { if (!f.type.startsWith('image/')) continue; urls.push(await fileToDataUrl(f)); }
    setPendingImages((prev) => [...prev, ...urls]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function removePendingImage(idx: number) {
    setPendingImages((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="main">
      <div className="chat-header">
        <img src="/linneaaichat.jpeg" alt="Linnea" className="agent-avatar" onClick={() => setShowProfile(true)} />
        <div>
          <div className="agent-name">Linnea</div>
          <div className="agent-sub">{MODE_LABELS[mode]}</div>
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
            <div className="big-icon">🎨</div>
            <h3>Hi, I'm Linnea!</h3>
            <p>I'm your art, computer science, and literature mentor. Send me your artwork for an honest critique, switch modes to explore CS or writing, or just start a conversation.</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`msg-row ${m.role}`}>
            {m.role === 'assistant' ? (
              <img src="/linneaaichat.jpeg" className="msg-avatar" alt="Linnea" />
            ) : (
              <div className="msg-avatar placeholder" style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary))' }}>
                {userName ? userName[0].toUpperCase() : 'U'}
              </div>
            )}
            <div className="msg-bubble">
              {m.imageUrl && <img src={m.imageUrl} className="msg-img" alt="sent" />}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg-row assistant">
            <img src="/linneaaichat.jpeg" className="msg-avatar" alt="Linnea" />
            <div className="msg-bubble"><div className="typing"><span></span><span></span><span></span></div></div>
          </div>
        )}
      </div>

      {loading && <div className="loading-bar" />}

      {pendingImages.length > 0 && (
        <div className="composer-preview">
          {pendingImages.map((u, i) => (
            <div key={i} className="composer-preview-item">
              <img src={u} alt="preview" />
              <div className="remove-x" onClick={() => removePendingImage(i)}>×</div>
            </div>
          ))}
        </div>
      )}

      <div className="composer">
        <div className="mode-group">
          {(['A', 'B', 'C'] as LinneaMode[]).map((mk) => (
            <button key={mk} className={`composer-btn mode-square ${mode === mk ? 'active' : ''}`} onClick={() => setMode(mk)} title={MODE_LABELS[mk]} aria-label={MODE_LABELS[mk]}>
              <span className="icon">{mk === 'A' ? '🎨' : mk === 'B' ? '💻' : '📚'}</span>
            </button>
          ))}
        </div>
        <button className="composer-btn" onClick={() => fileRef.current?.click()} aria-label="Add image" title="Add image">
          <span className="icon">📷</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFileChange} style={{ display: 'none' }} />
        <textarea className="composer-input" placeholder="Message Linnea…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} rows={1} />
        <button className="composer-btn" onClick={handleSend} disabled={loading || (!input.trim() && pendingImages.length === 0)} aria-label="Send">
          <span className="icon">➤</span>
        </button>
      </div>

      {showProfile && <LinneaProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

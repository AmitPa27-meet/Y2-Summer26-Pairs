import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import PioProfileModal from './PioProfileModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  createdAt: number;
}

function getSessionId(): string {
  let sid = localStorage.getItem('teyvat_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('teyvat_session_id', sid);
  }
  return sid;
}

async function loadConversation(sessionId: string, agent: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('id, role, content, image_url, created_at')
    .eq('session_id', sessionId)
    .eq('agent', agent)
    .order('created_at', { ascending: true });
  if (error || !data) return [];
  return data.map((r: any) => ({
    id: r.id, role: r.role, content: r.content,
    imageUrl: r.image_url ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  }));
}

async function saveConversationMessage(sessionId: string, agent: string, msg: Message): Promise<void> {
  const { error } = await supabase.from('conversations').insert({
    session_id: sessionId, agent, role: msg.role, content: msg.content,
    image_url: msg.imageUrl ?? null,
  });
  if (error) console.warn('saveConversationMessage error', error);
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const ANTHROPIC_BASE_URL = import.meta.env.VITE_ANTHROPIC_BASE_URL;

async function clearConversationMessages(sessionId: string, agent: string): Promise<void> {
  const { error } = await supabase.from('conversations').delete().eq('session_id', sessionId).eq('agent', agent);
  if (error) console.warn('clearConversationMessages error', error);
}

async function callPio(systemPrompt: string, messages: any[]): Promise<string> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/pio`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ systemPrompt, messages, apiKey: ANTHROPIC_API_KEY, baseURL: ANTHROPIC_BASE_URL }),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Pio error (${res.status}): ${t}`); }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text ?? '';
}

const PIO_SYSTEM = `You are Pio, a personalized College Counselor for high school students.

Your goal is to:
- Help students explore majors and universities.
- Ask questions when you need more information.
- Tailor advice to the student's interests, strengths, and intended study location.
- Encourage independent research.
- Support recommendations with evidence and reliable sources.
- When appropriate, create and analyze personality quizzes.

Rules:
- Always encourage users to research independently for better understanding of the career before choosing.
- Always give actionable, clear, and encouraging feedback on what university or career is best suited for the student.
- Always tailor your suggestions to the student's unique strengths, interests.
- Always give evidence to support the information you give.
- Always highlight both the exciting opportunities and the academic dedication required for each path.
- Never push a student toward a specific major or university based on your own preferences or prestige alone.
- Never give invalid websites and resources — only trusted, working resources.
- Always base the information according to the student's location and location of intended study.
- If the user asks to save, download, export, or keep your recommendations, always tell them they can save them as a personalized study plan.
- When web search is available, verify information about universities, majors, and recent developments.

Scoring Rubric:
You must rate the user's response on a scale from 1 through 5 based on three criteria: creativity, good grammar, and great punctuation.

Response format:
- Start with a warm, one-sentence validation or acknowledgment of the user's input.
- Then give your response.
- End with one follow-up question.

At the end of every response, rate the user's response from 1–5 for creativity, grammar, and punctuation using:
[Score: X/5] with a short explanation.

Respond in clear, natural paragraphs. Do not use labels like [Summary], [Response], or [Next Step]. Just write your answer as a normal conversation.`;

function saveStudyPlan(name: string, text: string) {
  const filename = `${name || 'User'}_StudyPlan.txt`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatResponse(text: string): string {
  return text.replace(/\[Summary\]:\s*/gi, '').replace(/\[Response\]:\s*/gi, '').replace(/\[Next Step\]:\s*/gi, '').replace(/^\n+/, '').trim();
}

interface Props {
  userName: string;
  userAvatarUrl: string | null;
  onUserNameChange: (n: string) => void;
  onOpenHelp: () => void;
}

export default function PioChat({ userName, userAvatarUrl, onUserNameChange, onOpenHelp }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'unknown'>('unknown');
  const [lastFailedInput, setLastFailedInput] = useState<string | null>(null);
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
    setError(null);
    try {
      const text = await callPio(PIO_SYSTEM, next.map((m) => ({ role: m.role, content: m.content })));
      const replyMsg: Message = { id: `a_${Date.now()}`, role: 'assistant', content: formatResponse(text), createdAt: Date.now() };
      setMessages([...next, replyMsg]);
      saveConversationMessage(sessionId, 'pio', replyMsg);
    } catch (e: any) {
      const msg = e?.message || String(e);
      setErrorType(/Failed to fetch|NetworkError|network/i.test(msg) ? 'network' : /Pio error|5\d\d|4\d\d/i.test(msg) ? 'server' : 'unknown');
      setError(msg);
      setLastFailedInput(userText);
    } finally { setLoading(false); }
  }

  function onKeyDown(e: React.KeyboardEvent) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }

  async function handleClear() {
    if (messages.length === 0) return;
    if (!window.confirm('Clear all messages in this chat? This cannot be undone.')) return;
    await clearConversationMessages(sessionId, 'pio');
    setMessages([]);
    setError(null);
    setLastFailedInput(null);
  }

  async function handleRetry() {
    if (lastFailedInput === null) return;
    const userText = lastFailedInput;
    setLastFailedInput(null);
    setError(null);
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
    } catch (e: any) {
      const msg = e?.message || String(e);
      setErrorType(/Failed to fetch|NetworkError|network/i.test(msg) ? 'network' : /Pio error|5\d\d|4\d\d/i.test(msg) ? 'server' : 'unknown');
      setError(msg);
      setLastFailedInput(userText);
    } finally { setLoading(false); }
  }

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
          {userAvatarUrl ? (
            <img src={userAvatarUrl} alt="You" className="user-avatar-header" />
          ) : (
            <div className="user-avatar-header">{userName ? userName[0].toUpperCase() : 'U'}</div>
          )}
          <button className="header-btn" onClick={onOpenHelp} title="Help">?</button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <strong>{errorType === 'network' ? 'Connection problem' : errorType === 'server' ? 'Server error' : 'Something went wrong'}</strong>
              <span className="error-detail">{errorType === 'network' ? 'Could not reach the server. Check your internet connection and try again.' : errorType === 'server' ? 'The AI service returned an error. Please try again in a moment.' : error}</span>
            </div>
            <div className="error-actions">
              {lastFailedInput !== null && <button className="error-btn primary" onClick={handleRetry}>Retry</button>}
              <button className="error-btn" onClick={() => window.location.reload()}>Reload page</button>
              <button className="error-btn" onClick={() => { setError(null); setLastFailedInput(null); }}>Dismiss</button>
            </div>
          </div>
        </div>
      )}

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
            ) : userAvatarUrl ? (
              <img src={userAvatarUrl} alt="You" className="msg-avatar" />
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
            <div className="msg-bubble">
              <div className="typing"><span></span><span></span><span></span></div>
              <div className="loading-text">Pio is thinking…</div>
            </div>
          </div>
        )}
      </div>

      {loading && <div className="loading-bar" />}

      <div className="composer">
        <button className="composer-btn danger" onClick={handleClear} disabled={messages.length === 0 || loading} aria-label="Clear chat" title="Clear all messages">
          <span className="icon">🗑</span>
        </button>
        <textarea className="composer-input" placeholder="Message Pio…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} rows={1} />
        {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
          <button className="composer-btn save" onClick={() => saveStudyPlan(userName, messages[messages.length - 1].content)} aria-label="Save study plan" title="Save study plan">
            <span className="icon">💾</span>
          </button>
        )}
        <button className="composer-btn" onClick={handleSend} disabled={loading || !input.trim()} aria-label="Send">
          <span className="icon">➤</span>
        </button>
      </div>

      {showProfile && <PioProfileModal onClose={() => setShowProfile(false)} />}
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LinneaProfileModal from './LinneaProfileModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

type LinneaMode = 'A' | 'B' | 'C';

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

async function loadMemories(sessionId: string): Promise<{ key: string; value: string }[]> {
  const { data, error } = await supabase.from('linnea_memories').select('key, value').eq('session_id', sessionId);
  if (error) return [];
  return (data as { key: string; value: string }[]) ?? [];
}

async function saveMemory(sessionId: string, key: string, value: string): Promise<void> {
  const { error } = await supabase.from('linnea_memories').upsert({ session_id: sessionId, key, value, updated_at: new Date().toISOString() });
  if (error) console.warn('saveMemory error', error);
}

async function saveImageRecord(imageUrl: string, imageName: string, mode: string): Promise<void> {
  const { error } = await supabase.from('linnea_images').insert({ image_url: imageUrl, image_name: imageName, mode });
  if (error) console.warn('saveImageRecord error', error);
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

async function callLinnea(
  systemPrompt: string,
  messages: any[],
  memories: { key: string; value: string }[],
): Promise<{ text: string; newMemories: { key: string; value: string }[] }> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/linnea`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}` },
    body: JSON.stringify({ systemPrompt, messages, memories, apiKey: ANTHROPIC_API_KEY, baseURL: ANTHROPIC_BASE_URL }),
  });
  if (!res.ok) { const t = await res.text(); throw new Error(`Linnea error (${res.status}): ${t}`); }
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return { text: data.text ?? '', newMemories: data.newMemories ?? [] };
}

const LINNEA_SYSTEM = `You are Linnea, an intelligent AI companion and personal instructor inspired by the Adventurers' Guild of Teyvat. You travel with a small companion named Lumi and possess a Geo Vision. Your personality is warm, patient, curious, creative, respectful, and encouraging. You should feel like a genuine mentor and companion, not just a chatbot. Prioritize accurate, useful, and honest guidance over empty encouragement. Never give fake praise or exaggerated compliments. Explain what works, what doesn't, why, and how the user can improve. Adapt your teaching to the user's skill level.
You have three modes. Mode A: Art Instructor (default), Mode B: Computer Science Instructor, and Mode C: Literature and Writing Instructor.
In Mode A, you are a professional artist, illustrator, art teacher, and art historian. You are knowledgeable about drawing, painting, digital and traditional art, anatomy, gesture, perspective, composition, lighting, values, rendering, color theory, character and environment design, concept art, visual storytelling, symbolism, art philosophy, art history, famous artists, and artistic movements. When critiquing artwork, honestly analyze anatomy, proportions, perspective, gesture, construction, composition, lighting, values, color harmony, focal points, storytelling, readability, visual hierarchy, and design choices. Identify strengths and weaknesses, explain the reasons behind issues, suggest concrete improvements, and recommend focused practice exercises. Discuss artists, artworks, movements, symbolism, interpretation, and artistic philosophy when relevant.
In Mode B, you are a professional computer science teacher and software engineer. Teach programming, algorithms, data structures, debugging, software engineering, AI, cybersecurity, databases, networking, operating systems, mathematics, and system design. Explain concepts clearly, teach reasoning, discuss tradeoffs, and provide exercises when useful. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally.
In Mode C, you are a professional literature and creative writing instructor. Help with literary analysis, grammar, storytelling, editing, character development, dialogue, themes, symbolism, essays, scripts, poetry, and worldbuilding. Provide thoughtful feedback with clear explanations and practical improvements. Occasionally mention Lumi, Kirara, Furina, or Sandrone naturally.
You can also create study guides, summaries, revision notes, flashcards, worksheets, comparison tables, programming templates, and structured learning materials. If memory features are available, remember only useful learning preferences such as the user's name, goals, skill level, favorite artists, authors, programming languages, projects, and learning preferences. Always remain immersive while prioritizing honesty and accuracy.`;

const MODE_CONTEXT: Record<LinneaMode, string> = {
  A: '\n\nThe user is currently in Mode A: Art Instructor. Respond as the art instructor described above.',
  B: '\n\nThe user is currently in Mode B: Computer Science Instructor. Respond as the computer science instructor described above.',
  C: '\n\nThe user is currently in Mode C: Literature and Writing Instructor. Respond as the literature and writing instructor described above.',
};

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
      const { text, newMemories } = await callLinnea(LINNEA_SYSTEM + MODE_CONTEXT[mode], apiMessages, memories);
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
  async function handleClear() {
    if (messages.length === 0) return;
    if (!window.confirm('Clear all messages in this chat? This cannot be undone.')) return;
    await clearConversationMessages(sessionId, 'linnea');
    setMessages([]);
    setPendingImages([]);
    setError(null);
    setLastFailedInput(null);
  }

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

        <button className="composer-btn danger" onClick={handleClear} disabled={messages.length === 0 || loading} aria-label="Clear chat" title="Clear all messages">
          <span className="icon">🗑</span>
        </button>
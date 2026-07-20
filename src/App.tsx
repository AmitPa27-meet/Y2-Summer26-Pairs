import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import LinneaChat from './components/LinneaChat';
import PioChat from './components/PioChat';
import Welcome from './components/Welcome';
import HelpPage from './components/HelpPage';
import UserProfileModal, { type UserProfile } from './components/UserProfileModal';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

function getSessionId(): string {
  let sid = localStorage.getItem('teyvat_session_id');
  if (!sid) {
    sid = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('teyvat_session_id', sid);
  }
  return sid;
}

async function loadTheme(sessionId: string): Promise<string | null> {
  const { data } = await supabase.from('user_prefs').select('theme').eq('session_id', sessionId).maybeSingle();
  return data?.theme ?? null;
}

async function saveTheme(sessionId: string, theme: string): Promise<void> {
  const { error } = await supabase.from('user_prefs').upsert({ session_id: sessionId, theme, updated_at: new Date().toISOString() });
  if (error) console.warn('saveTheme error', error);
}

async function saveMemory(sessionId: string, key: string, value: string): Promise<void> {
  const { error } = await supabase.from('linnea_memories').upsert({ session_id: sessionId, key, value, updated_at: new Date().toISOString() });
  if (error) console.warn('saveMemory error', error);
}

interface ThemeColors {
  id: string; name: string;
  primary: string; primaryDark: string; primaryLight: string; accent: string;
  bg: string; bgGradient: string; surface: string; surfaceAlt: string;
  text: string; textMuted: string; border: string; sidebarBg: string;
}

const THEMES: ThemeColors[] = [
  { id: 'amber', name: 'Teyvat Amber', primary: '#a86a3a', primaryDark: '#8b5429', primaryLight: '#d4a574', accent: '#d4a017', bg: '#faf7f1', bgGradient: 'linear-gradient(180deg, #faf7f1 0%, #f0ead8 100%)', surface: '#ffffff', surfaceAlt: '#f4f0e8', text: '#2a241f', textMuted: '#6e6258', border: '#e6ddcd', sidebarBg: '#252220' },
  { id: 'ocean', name: 'Ocean Blue', primary: '#2c6e8f', primaryDark: '#1e5470', primaryLight: '#7eb5d1', accent: '#3a9bc9', bg: '#f0f6f8', bgGradient: 'linear-gradient(180deg, #f0f6f8 0%, #d9ecf2 100%)', surface: '#ffffff', surfaceAlt: '#e8f2f6', text: '#1a2a30', textMuted: '#5a7080', border: '#c4d8e0', sidebarBg: '#1a2a35' },
  { id: 'forest', name: 'Forest Green', primary: '#348474', primaryDark: '#2a6a5d', primaryLight: '#80bdb0', accent: '#5bae5e', bg: '#f0f6f4', bgGradient: 'linear-gradient(180deg, #f0f6f4 0%, #d9ebe6 100%)', surface: '#ffffff', surfaceAlt: '#e8f0ed', text: '#1a2a25', textMuted: '#5a7068', border: '#c4d8d2', sidebarBg: '#1d2e28' },
  { id: 'rose', name: 'Rose Quartz', primary: '#c4567a', primaryDark: '#a84263', primaryLight: '#e8a0b5', accent: '#e0709a', bg: '#faf0f3', bgGradient: 'linear-gradient(180deg, #faf0f3 0%, #f0dae0 100%)', surface: '#ffffff', surfaceAlt: '#f4e8ed', text: '#2a1a20', textMuted: '#6e5868', border: '#e6ccd6', sidebarBg: '#2a1a25' },
  { id: 'slate', name: 'Slate Stone', primary: '#4a5568', primaryDark: '#374151', primaryLight: '#8b95a8', accent: '#6b7280', bg: '#f5f6f7', bgGradient: 'linear-gradient(180deg, #f5f6f7 0%, #e4e7ea 100%)', surface: '#ffffff', surfaceAlt: '#eceef1', text: '#1a1e25', textMuted: '#5a6270', border: '#d0d5dc', sidebarBg: '#1c1e25' },
  { id: 'sunset', name: 'Sunset Orange', primary: '#d97142', primaryDark: '#b8582a', primaryLight: '#f0a878', accent: '#e8902a', bg: '#faf5f0', bgGradient: 'linear-gradient(180deg, #faf5f0 0%, #f0e0d4 100%)', surface: '#ffffff', surfaceAlt: '#f4ece4', text: '#2a201a', textMuted: '#6e5e58', border: '#e6d8cc', sidebarBg: '#25201a' },
];

function getTheme(id: string): ThemeColors { return THEMES.find((t) => t.id === id) ?? THEMES[0]; }

function applyTheme(t: ThemeColors) {
  const r = document.documentElement.style;
  r.setProperty('--primary', t.primary); r.setProperty('--primary-dark', t.primaryDark);
  r.setProperty('--primary-light', t.primaryLight); r.setProperty('--accent', t.accent);
  r.setProperty('--bg', t.bg); r.setProperty('--bg-gradient', t.bgGradient);
  r.setProperty('--surface', t.surface); r.setProperty('--surface-alt', t.surfaceAlt);
  r.setProperty('--text', t.text); r.setProperty('--text-muted', t.textMuted);
  r.setProperty('--border', t.border); r.setProperty('--sidebar-bg', t.sidebarBg);
  document.body.style.background = t.bgGradient;
}

type View = 'welcome' | 'linnea' | 'pio' | 'help';
type Agent = 'linnea' | 'pio';

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [previousAgent, setPreviousAgent] = useState<Agent>('linnea');
  const [userName, setUserName] = useState('');
  const [themeId, setThemeId] = useState('amber');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const sessionId = getSessionId();

  useEffect(() => {
    const savedName = localStorage.getItem('teyvat_user_name') ?? '';
    setUserName(savedName);
    (async () => {
      const savedTheme = await loadTheme(sessionId);
      const tid = savedTheme ?? localStorage.getItem('teyvat_theme') ?? 'amber';
      setThemeId(tid);
      applyTheme(getTheme(tid));
    })();
  }, [sessionId]);

  function onUserNameChange(n: string) {
    setUserName(n);
    localStorage.setItem('teyvat_user_name', n);
    if (n.trim()) saveMemory(sessionId, 'name', n.trim());
  }

  function onProfileSaved(p: UserProfile) {
    setProfile(p);
    const name = p.display_name ?? '';
    setUserName(name);
    localStorage.setItem('teyvat_user_name', name);
    if (name.trim()) saveMemory(sessionId, 'name', name.trim());
  }

  function chooseAgent(agent: Agent) { setPreviousAgent(agent); setView(agent); }

  function changeTheme(id: string) {
    setThemeId(id);
    applyTheme(getTheme(id));
    localStorage.setItem('teyvat_theme', id);
    saveTheme(sessionId, id);
  }

  function openHelp() {
    setPreviousAgent(view === 'help' ? previousAgent : (view === 'welcome' ? 'linnea' : view as Agent));
    setView('help');
  }

  function backFromHelp() { setView(previousAgent); }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">T</div>
        <button className={`sidebar-btn ${view === 'linnea' ? 'active' : ''}`} onClick={() => chooseAgent('linnea')} title="Linnea">
          <img src="/linneaaichat.jpeg" alt="Linnea" className="sidebar-avatar" />
        </button>
        <button className={`sidebar-btn ${view === 'pio' ? 'active' : ''}`} onClick={() => chooseAgent('pio')} title="Pio">
          <img src="/WhatsApp_Image_2026-07-17_at_18.09.58.jpeg" alt="Pio" className="sidebar-avatar" />
        </button>
        <button className={`sidebar-btn ${view === 'welcome' ? 'active' : ''}`} onClick={() => setView('welcome')} title="Home">
          <span className="icon">⌂</span>
        </button>
        <div className="sidebar-spacer" />
        <button className="sidebar-btn" onClick={() => setShowProfile(true)} title="Your profile">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="You" className="sidebar-avatar" />
          ) : (
            <span className="icon">👤</span>
          )}
        </button>
        <button className="sidebar-btn" onClick={() => setShowColorPicker((s) => !s)} title="Theme color">
          <span className="icon">🎨</span>
        </button>
        {showColorPicker && (
          <div className="color-picker-row" style={{ flexDirection: 'column', gap: 8, padding: '8px 0' }}>
            {THEMES.map((t: ThemeColors) => (
              <div
                key={t.id}
                className={`color-swatch ${themeId === t.id ? 'active' : ''}`}
                style={{ background: t.primary }}
                onClick={() => { changeTheme(t.id); setShowColorPicker(false); }}
                title={t.name}
              />
            ))}
          </div>
        )}
        <button className="sidebar-btn" onClick={openHelp} title="Help">
          <span className="icon">?</span>
        </button>
      </div>

      {view === 'welcome' && <Welcome onChoose={chooseAgent} />}
      {view === 'linnea' && <LinneaChat userName={userName} onUserNameChange={onUserNameChange} onOpenHelp={openHelp} />}
      {view === 'pio' && <PioChat userName={userName} onUserNameChange={onUserNameChange} onOpenHelp={openHelp} />}
      {view === 'help' && <HelpPage onBack={backFromHelp} />}
      {showProfile && (
        <UserProfileModal
          sessionId={sessionId}
          onClose={() => setShowProfile(false)}
          onSaved={onProfileSaved}
        />
      )}
    </div>
  );
}

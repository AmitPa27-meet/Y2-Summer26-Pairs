import { useEffect, useState } from 'react';
import LinneaChat from './components/LinneaChat';
import PioChat from './components/PioChat';
import Welcome from './components/Welcome';
import HelpPage from './components/HelpPage';
import { THEMES, getTheme, applyTheme, ThemeColors } from './lib/themes';
import { getSessionId, loadTheme, saveTheme, saveMemory } from './lib/supabase';

type View = 'welcome' | 'linnea' | 'pio' | 'help';
type Agent = 'linnea' | 'pio';

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [previousAgent, setPreviousAgent] = useState<Agent>('linnea');
  const [userName, setUserName] = useState('');
  const [themeId, setThemeId] = useState('amber');
  const [showColorPicker, setShowColorPicker] = useState(false);
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

  function chooseAgent(agent: Agent) {
    setPreviousAgent(agent);
    setView(agent);
  }

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

  function backFromHelp() {
    setView(previousAgent);
  }

  const currentTheme = getTheme(themeId);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">T</div>
        <button className={`sidebar-btn ${view === 'linnea' ? 'active' : ''}`} onClick={() => chooseAgent('linnea')} title="Linnea">
          <span className="icon">🎨</span>
        </button>
        <button className={`sidebar-btn ${view === 'pio' ? 'active' : ''}`} onClick={() => chooseAgent('pio')} title="Pio">
          <span className="icon">🎓</span>
        </button>
        <button className={`sidebar-btn ${view === 'welcome' ? 'active' : ''}`} onClick={() => setView('welcome')} title="Home">
          <span className="icon">⌂</span>
        </button>
        <div className="sidebar-spacer" />
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
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  { auth: { persistSession: false } },
);

export interface UserProfile {
  display_name: string | null;
  bio: string | null;
  goals: string | null;
  avatar_url: string | null;
}

async function loadProfile(sessionId: string): Promise<UserProfile> {
  const { data } = await supabase
    .from('user_profiles')
    .select('display_name, bio, goals, avatar_url')
    .eq('session_id', sessionId)
    .maybeSingle();
  return {
    display_name: data?.display_name ?? null,
    bio: data?.bio ?? null,
    goals: data?.goals ?? null,
    avatar_url: data?.avatar_url ?? null,
  };
}

async function saveProfile(sessionId: string, profile: UserProfile): Promise<void> {
  const { error } = await supabase.from('user_profiles').upsert({
    session_id: sessionId,
    display_name: profile.display_name,
    bio: profile.bio,
    goals: profile.goals,
    avatar_url: profile.avatar_url,
    updated_at: new Date().toISOString(),
  });
  if (error) console.warn('saveProfile error', error);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

interface Props {
  sessionId: string;
  onClose: () => void;
  onSaved: (profile: UserProfile) => void;
}

export default function UserProfileModal({ sessionId, onClose, onSaved }: Props) {
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [goals, setGoals] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const p = await loadProfile(sessionId);
      setDisplayName(p.display_name ?? '');
      setBio(p.bio ?? '');
      setGoals(p.goals ?? '');
      setAvatarUrl(p.avatar_url);
      setLoading(false);
    })();
  }, [sessionId]);

  async function handleSave() {
    setSaving(true);
    const profile: UserProfile = {
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      goals: goals.trim() || null,
      avatar_url: avatarUrl,
    };
    await saveProfile(sessionId, profile);
    onSaved(profile);
    setSaving(false);
    onClose();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4_000_000) {
      alert('Please choose an image under 4 MB.');
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setAvatarUrl(dataUrl);
  }

  const initials = displayName.trim().slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header profile-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
          {avatarUrl ? (
            <img src={avatarUrl} alt="Your avatar" />
          ) : (
            <div className="avatar-placeholder">{initials}</div>
          )}
        </div>
        <div className="modal-body profile-body">
          <h2>Your Profile</h2>
          <p className="modal-tag">Customize how Linnea and Pio see you</p>

          {loading ? (
            <div className="profile-loading">Loading…</div>
          ) : (
            <>
              <div className="profile-field">
                <label>Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                />
              </div>

              <div className="profile-field">
                <label>Profile Picture</label>
                <div className="profile-pic-row">
                  <div className="profile-pic-preview">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" />
                    ) : (
                      <div className="profile-pic-placeholder">{initials}</div>
                    )}
                  </div>
                  <div className="profile-pic-actions">
                    <button className="profile-upload-btn" onClick={() => fileRef.current?.click()}>
                      Upload picture
                    </button>
                    {avatarUrl && (
                      <button className="profile-remove-btn" onClick={() => setAvatarUrl(null)}>
                        Remove
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} hidden />
                  </div>
                </div>
              </div>

              <div className="profile-field">
                <label>Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your mentors about yourself — your background, interests, hobbies…"
                  rows={3}
                  maxLength={500}
                />
                <div className="char-count">{bio.length}/500</div>
              </div>

              <div className="profile-field">
                <label>Goals</label>
                <textarea
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="What do you want to achieve? What are you working toward?"
                  rows={3}
                  maxLength={500}
                />
                <div className="char-count">{goals.length}/500</div>
              </div>

              <div className="profile-actions">
                <button className="profile-cancel-btn" onClick={onClose}>Cancel</button>
                <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save profile'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

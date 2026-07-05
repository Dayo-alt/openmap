import { useEffect, useState, useRef } from 'react';
import { supabase } from './supabaseClient';

function AuthButton({ onAuthChange }) {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (onAuthChange) onAuthChange(session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (onAuthChange) onAuthChange(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [onAuthChange]);

  // Close dropdown when clicking outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
  };

  if (user) {
    // TEMPORARY DEBUG LINE — check the browser console (F12) to see
    // exactly what fields Google/Supabase sent back, then delete this line.
    console.log('User metadata:', user.user_metadata);

    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      user.identities?.[0]?.identity_data?.picture ||
      user.identities?.[0]?.identity_data?.avatar_url;

    const initial = (user.email || 'U')[0].toUpperCase();

    return (
      <div className="auth-container" ref={menuRef}>
        <button className="auth-avatar-btn" onClick={() => setMenuOpen((o) => !o)}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="profile" className="auth-avatar" />
          ) : (
            <div className="auth-avatar-fallback">{initial}</div>
          )}
        </button>

        {menuOpen && (
          <div className="auth-dropdown">
            <div className="auth-dropdown-email">{user.email}</div>
            <button className="auth-dropdown-item" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="auth-container">
      <button className="auth-button auth-login" onClick={handleLogin}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92A8.78 8.78 0 0 0 17.64 9.2z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.87-3.04.87-2.34 0-4.32-1.58-5.03-3.7H.9v2.33A9 9 0 0 0 9 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.97 10.73a5.4 5.4 0 0 1 0-3.46V4.94H.9a9 9 0 0 0 0 8.12l3.07-2.33z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.59 8.59 0 0 0 9 0 9 9 0 0 0 .9 4.94L3.97 7.27C4.68 5.16 6.66 3.58 9 3.58z"
          />
        </svg>
        Sign in with Google
      </button>
    </div>
  );
}

export default AuthButton;
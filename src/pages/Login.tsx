import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth';
import supabase from '../api/supabase';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setInfo('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">TC</div>
        <h2>{mode === 'login' ? 'Sign In' : 'Forgot Password'}</h2>
        <p className="login-sub">Transfer Certificate System</p>

        {error && <div className="login-error">{error}</div>}
        {info  && <div className="login-info">{info}</div>}

        <form onSubmit={mode === 'login' ? handleLogin : handleForgot}>
          <label>Email</label>
          <input
            type="email" required autoFocus
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          {mode === 'login' && (
            <>
              <label>Password</label>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Send Reset Link'}
          </button>
        </form>

        <div className="login-footer">
          {mode === 'login'
            ? <button className="link-btn" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}>Forgot password?</button>
            : <button className="link-btn" onClick={() => { setMode('login'); setError(''); setInfo(''); }}>← Back to Sign In</button>
          }
        </div>
      </div>
    </div>
  );
};

export default Login;

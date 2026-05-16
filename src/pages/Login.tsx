import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../lib/auth';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signIn(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">TC</div>
        <h2>Sign In</h2>
        <p className="login-sub">Transfer Certificate System</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <label>Username</label>
          <input
            required autoFocus
            value={username} onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
          />
          <label>Password</label>
          <input
            type="password" required
            value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Please wait…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

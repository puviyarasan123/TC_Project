import React, { useEffect, useState } from 'react';
import { listUsers, createUser, resendPassword, deleteUser, updateUserRole } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types/auth';
import './AdminPanel.css';

const AdminPanel: React.FC = () => {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = () => listUsers().then(setUsers).catch(e => setError(e.message));

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo(''); setLoading(true);
    try {
      await createUser(email, role, profile!.id);
      setInfo(`User ${email} created. Credentials sent to their email.`);
      setEmail(''); setRole('user');
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (userEmail: string) => {
    setError(''); setInfo(''); setActionId(userEmail);
    try {
      await resendPassword(userEmail);
      setInfo(`New password sent to ${userEmail}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Delete user ${userEmail}?`)) return;
    setError('');
    try {
      await deleteUser(userId);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    setError('');
    try {
      await updateUserRole(userId, newRole);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-wrap">
      <h2 className="admin-title">👤 User Management</h2>

      {error && <div className="adm-error">{error}</div>}
      {info  && <div className="adm-info">{info}</div>}

      {/* Create User */}
      <div className="adm-card">
        <h3>Create New User</h3>
        <form className="adm-form" onSubmit={handleCreate}>
          <input
            type="email" required placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)}
          />
          <select value={role} onChange={e => setRole(e.target.value as 'admin' | 'user')}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={loading} className="adm-btn primary">
            {loading ? 'Creating…' : '+ Create & Send Credentials'}
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="adm-card">
        <h3>All Users</h3>
        <table className="adm-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value as 'admin' | 'user')}
                    disabled={u.id === profile?.id}
                    className="role-select"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                <td className="adm-actions">
                  <button
                    className="adm-btn secondary"
                    onClick={() => handleResend(u.email)}
                    disabled={actionId === u.email}
                  >
                    {actionId === u.email ? '…' : '🔑 Resend Password'}
                  </button>
                  {u.id !== profile?.id && (
                    <button className="adm-btn danger" onClick={() => handleDelete(u.id, u.email)}>
                      🗑 Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#aaa' }}>No users yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;

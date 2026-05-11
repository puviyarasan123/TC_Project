import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { getAllColleges, createCollege, updateCollege, deleteCollege } from '../lib/college';
import { CollegeData } from '../types/tc';
import { useCollege } from '../context/CollegeContext';
import './Colleges.css';

type FormState = { name: string; trust_name: string; affiliation: string; address: string };
const empty: FormState = { name: '', trust_name: '', affiliation: '', address: '' };

const Colleges: React.FC = () => {
  const { reload: reloadCtx } = useCollege();
  const [colleges, setColleges]   = useState<CollegeData[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing,  setEditing]    = useState<CollegeData | null>(null);
  const [form,     setForm]       = useState<FormState>(empty);
  const [preview,  setPreview]    = useState('');
  const [saving,   setSaving]     = useState(false);
  const [error,    setError]      = useState('');
  const [info,     setInfo]       = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    getAllColleges().then(c => { setColleges(c); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null); setForm(empty); setPreview(''); setError('');
    setShowForm(true);
  };

  const openEdit = (c: CollegeData) => {
    setEditing(c);
    setForm({ name: c.name, trust_name: c.trust_name, affiliation: c.affiliation, address: c.address });
    setPreview(c.logo_url || '');
    setError('');
    setShowForm(true);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('College name is required'); return; }
    const file = fileRef.current?.files?.[0];
    if (!editing && !file) { setError('Please upload a logo'); return; }
    setSaving(true); setError('');
    try {
      if (editing) {
        await updateCollege(editing.id, form, file);
        setInfo('College updated successfully.');
      } else {
        await createCollege(form, file!);
        setInfo('College added successfully.');
      }
      load(); reloadCtx();
      setShowForm(false); setForm(empty); setPreview('');
      if (fileRef.current) fileRef.current.value = '';
    } catch (err: any) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: CollegeData) => {
    if (!window.confirm(`Delete "${c.name}"? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteCollege(c.id);
      load(); reloadCtx();
      setInfo(`"${c.name}" deleted.`);
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const closeForm = () => { setShowForm(false); setError(''); setPreview(''); };

  return (
    <div className="col-wrap">
      <div className="col-header">
        <div>
          <h2 className="col-title">🏫 College Management</h2>
          <p className="col-sub">Add, edit and manage registered colleges</p>
        </div>
        <button className="col-add-btn" onClick={openAdd}>+ Add College</button>
      </div>

      {error && <div className="col-error">{error}</div>}
      {info  && <div className="col-info" onClick={() => setInfo('')}>{info} ✕</div>}

      {loading ? (
        <div className="col-loading">Loading…</div>
      ) : (
        <div className="col-grid">
          {colleges.map(c => (
            <div key={c.id} className="col-card">
              <div className="col-card-logo">
                {c.logo_url
                  ? <img src={c.logo_url} alt={c.name} />
                  : <span>🏫</span>
                }
              </div>
              <div className="col-card-body">
                <div className="col-card-name">{c.name}</div>
                {c.trust_name   && <div className="col-card-meta">🏛 {c.trust_name}</div>}
                {c.affiliation  && <div className="col-card-meta">🎓 {c.affiliation}</div>}
                {c.address      && <div className="col-card-meta">📍 {c.address}</div>}
                <div className="col-card-date">Added {new Date(c.created_at).toLocaleDateString('en-IN')}</div>
              </div>
              <div className="col-card-actions">
                <button className="col-btn edit"   onClick={() => openEdit(c)}>✏ Edit</button>
                <button className="col-btn delete" onClick={() => handleDelete(c)}>🗑 Delete</button>
              </div>
            </div>
          ))}
          {!colleges.length && (
            <div className="col-empty">
              <div style={{ fontSize: 48 }}>🏫</div>
              <p>No colleges yet. Click "Add College" to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-head">
              <h3>{editing ? `Edit — ${editing.name}` : 'Add New College'}</h3>
              <button className="modal-close" onClick={closeForm}>✕</button>
            </div>
            <div className="modal-body">
              <div className="col-form-grid">
                <div className="col-field full">
                  <label>College Name *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Palar Agricultural College" />
                </div>
                <div className="col-field full">
                  <label>Trust / Society Name</label>
                  <input value={form.trust_name} onChange={e => setForm(p => ({ ...p, trust_name: e.target.value }))} placeholder="e.g. R.S. Educational Trust" />
                </div>
                <div className="col-field full">
                  <label>Affiliation</label>
                  <input value={form.affiliation} onChange={e => setForm(p => ({ ...p, affiliation: e.target.value }))} placeholder="e.g. Affiliated to Tamil Nadu Agricultural University" />
                </div>
                <div className="col-field full">
                  <label>Address</label>
                  <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Village, Post, District, State" />
                </div>
                <div className="col-field full">
                  <label>College Logo {!editing && '*'}</label>
                  <div className="col-upload" onClick={() => fileRef.current?.click()}>
                    {preview
                      ? <img src={preview} alt="preview" className="col-upload-img" />
                      : <div className="col-upload-placeholder">
                          <span style={{ fontSize: 32 }}>☁</span>
                          <span>Click to upload logo (PNG/JPG)</span>
                          {editing && <span style={{ fontSize: 11, color: '#aaa' }}>Leave empty to keep current logo</span>}
                        </div>
                    }
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                </div>
              </div>
              {error && <div className="col-error" style={{ marginTop: 12 }}>{error}</div>}
            </div>
            <div className="modal-foot">
              <button className="col-btn edit" onClick={closeForm}>Cancel</button>
              <button className="col-btn save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editing ? '💾 Update College' : '✓ Add College'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colleges;

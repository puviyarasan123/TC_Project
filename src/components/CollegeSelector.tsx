import React, { useState, useRef, ChangeEvent } from 'react';
import { useCollege } from '../context/CollegeContext';
import { createCollege } from '../lib/college';
import './CollegeSelector.css';

const CollegeSelector: React.FC = () => {
  const { colleges, selected, setSelected, reload } = useCollege();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', trust_name: '', affiliation: '', address: '',
  });

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>): void => {
    const id = parseInt(e.target.value, 10);
    const col = colleges.find(c => c.id === id) ?? null;
    setSelected(col);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (): Promise<void> => {
    if (!form.name.trim()) { setError('College name is required'); return; }
    const file = fileRef.current?.files?.[0];
    if (!file) { setError('Please upload a logo'); return; }
    setUploading(true);
    setError('');
    try {
      const college = await createCollege(form, file);
      setSelected(college);
      reload();
      setShowForm(false);
      setForm({ name: '', trust_name: '', affiliation: '', address: '' });
      setPreview('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="college-selector-wrap">
      <div className="cs-row">
        <div className="cs-select-group">
          <label className="cs-label">🏫 College</label>
          <div className="cs-select-row">
            <select
              className="cs-select"
              value={selected?.id ?? ''}
              onChange={handleSelect}
              disabled={!colleges.length}
            >
              {!colleges.length && <option value="">No colleges yet</option>}
              {colleges.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button className="cs-add-btn" onClick={() => { setShowForm(v => !v); setError(''); }}>
              {showForm ? '✕ Cancel' : '＋ New College'}
            </button>
          </div>
        </div>

        {selected && (
          <div className="cs-preview-badge">
            {selected.logo_url
              ? <img src={selected.logo_url} alt="logo" className="cs-logo-thumb" />
              : <div className="cs-logo-placeholder">🏫</div>
            }
            <div className="cs-preview-info">
              <strong>{selected.name}</strong>
              <span>{selected.address}</span>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="cs-form">
          <div className="cs-form-title">Register New College</div>
          <div className="cs-form-grid">
            <div className="cs-field full">
              <label>College Name *</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Palar Agricultural College" />
            </div>
            <div className="cs-field full">
              <label>Trust / Society Name</label>
              <input value={form.trust_name} onChange={e => setForm(p => ({ ...p, trust_name: e.target.value }))} placeholder="e.g. R.S. Educational and Charitable Trust" />
            </div>
            <div className="cs-field full">
              <label>Affiliation</label>
              <input value={form.affiliation} onChange={e => setForm(p => ({ ...p, affiliation: e.target.value }))} placeholder="e.g. Affiliated To Tamil Nadu Agricultural University" />
            </div>
            <div className="cs-field full">
              <label>Address</label>
              <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Village, Post, District, State" />
            </div>
            <div className="cs-field full">
              <label>College Logo *</label>
              <div className="cs-upload-area" onClick={() => fileRef.current?.click()}>
                {preview
                  ? <img src={preview} alt="preview" className="cs-upload-preview" />
                  : <div className="cs-upload-placeholder">
                      <span className="cs-upload-icon">☁</span>
                      <span>Click to upload logo (PNG/JPG, max 5MB)</span>
                    </div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </div>
          {error && <p className="cs-error">⚠ {error}</p>}
          <button className="cs-submit-btn" onClick={handleSubmit} disabled={uploading}>
            {uploading ? '⏳ Uploading...' : '✓ Save College'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CollegeSelector;

import React, { useEffect, useState, useRef, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import TCCertificate from '../components/TCCertificate';
import { TCRecord, CollegeData, TCFormData } from '../types/tc';
import { getAllTCs, deleteTC, updateTC } from '../lib/tc';
import { getAllColleges } from '../lib/college';

const Records: React.FC = () => {
  const [records,  setRecords]  = useState<TCRecord[]>([]);
  const [colleges, setColleges] = useState<Record<number, CollegeData>>({});
  const [search,   setSearch]   = useState('');
  const [editing,  setEditing]  = useState<TCRecord | null>(null);
  const [editForm, setEditForm] = useState<Partial<TCFormData>>({});
  const [saving,   setSaving]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getAllTCs().then(r => setRecords(r));
    getAllColleges().then(r => {
      const map: Record<number, CollegeData> = {};
      r.forEach(c => { map[c.id] = c; });
      setColleges(map);
    });
  }, []);

  const filtered = records.filter(r =>
    r.student_name.toLowerCase().includes(search.toLowerCase()) ||
    r.tc_number.toLowerCase().includes(search.toLowerCase())
  );

  const waitForImages = (el: HTMLElement): Promise<void> => {
    const imgs = Array.from(el.querySelectorAll('img'));
    if (!imgs.length) return Promise.resolve();
    return Promise.all(imgs.map(img => img.complete
      ? Promise.resolve()
      : new Promise<void>(res => { img.onload = () => res(); img.onerror = () => res(); })
    )).then(() => {});
  };

  const downloadPDF = async (rec: TCRecord): Promise<void> => {
    const college = rec.college_id ? colleges[rec.college_id] : undefined;
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-9999px;top:0;';
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<TCCertificate data={rec} college={college} />);
    const el = container.firstElementChild as HTMLElement;
    await waitForImages(el);
    const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0,
      pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
    pdf.save(`TC_${rec.tc_number.replace(/\//g, '_')}.pdf`);
    root.unmount();
    document.body.removeChild(container);
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (!window.confirm('Delete this TC record? This cannot be undone.')) return;
    await deleteTC(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const openEdit = (rec: TCRecord) => {
    setEditing(rec);
    const { id, tc_number, created_at, ...rest } = rec;
    setEditForm(rest);
  };

  const handleEditChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateTC(editing.id, editForm);
      setRecords(prev => prev.map(r => r.id === updated.id ? updated : r));
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const fmt = (d: string): string => d ? new Date(d).toLocaleDateString('en-IN') : '—';
  const thisYear = new Date().getFullYear();

  return (
    <div className="records-page">
      <div className="page-header">
        <h2>TC Records</h2>
        <p>View, edit, download and manage all issued Transfer Certificates</p>
      </div>

      <div className="records-stats">
        <div className="stat-card">
          <div className="stat-icon blue">📄</div>
          <div className="stat-info"><p>Total Issued</p><h3>{records.length}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📅</div>
          <div className="stat-info">
            <p>This Year</p>
            <h3>{records.filter(r => r.tc_number.includes(String(thisYear))).length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold">🎓</div>
          <div className="stat-info">
            <p>Latest TC</p>
            <h3 style={{ fontSize: 14, marginTop: 4 }}>{records[0]?.tc_number ?? '—'}</h3>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <h3>All Transfer Certificates</h3>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="rec-search"
              placeholder="🔍 Search by name or TC no…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="table-count">{filtered.length} records</span>
          </div>
        </div>
        <table className="records-table">
          <thead>
            <tr>
              <th>TC Number</th>
              <th>Student Name</th>
              <th>College</th>
              <th>Class</th>
              <th>Leaving Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td><span className="tc-badge">{r.tc_number}</span></td>
                <td><span className="student-name">{r.student_name}</span></td>
                <td>
                  <div className="college-cell">
                    {r.college_id && colleges[r.college_id]?.logo_url && (
                      <img src={colleges[r.college_id].logo_url} alt="" className="table-logo" />
                    )}
                    <span>{r.college_id ? (colleges[r.college_id]?.name ?? '—') : '—'}</span>
                  </div>
                </td>
                <td><span className="class-badge">{r.class_at_leaving || '—'}</span></td>
                <td>{fmt(r.leaving_date)}</td>
                <td>
                  <button className="action-btn view"     onClick={() => navigate(`/preview/${r.id}`)}>👁 View</button>
                  <button className="action-btn edit"     onClick={() => openEdit(r)}>✏ Edit</button>
                  <button className="action-btn download" onClick={() => downloadPDF(r)}>⬇ PDF</button>
                  <button className="action-btn delete"   onClick={() => handleDelete(r.id)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr><td colSpan={6}>
                <div className="empty-state">
                  <div className="empty-state-icon">📭</div>
                  <p>{search ? 'No matching records.' : 'No records found. Generate your first TC.'}</p>
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-head">
              <h3>Edit TC — {editing.tc_number}</h3>
              <button className="modal-close" onClick={() => setEditing(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="edit-grid">
                {([
                  ['student_name', 'Student Name', 'text'],
                  ['parent_name',  'Parent Name',  'text'],
                  ['id_number',    'ID Number',    'text'],
                  ['dob',          'Date of Birth','date'],
                  ['dob_words',    'DOB in Words', 'text'],
                  ['admission_date','Admission Date','date'],
                  ['study_period', 'Study Period', 'text'],
                  ['leaving_date', 'Leaving Date', 'date'],
                  ['class_at_leaving','Class at Leaving','text'],
                  ['medium',       'Medium',       'text'],
                  ['promotion_status','Promotion Status','text'],
                  ['application_date','Application Date','date'],
                  ['conduct',      'Conduct',      'text'],
                ] as [keyof TCFormData, string, string][]).map(([key, label, type]) => (
                  <div key={key} className="edit-field">
                    <label>{label}</label>
                    <input
                      type={type}
                      name={key}
                      value={(editForm[key] as string) ?? ''}
                      onChange={handleEditChange}
                    />
                  </div>
                ))}
                <div className="edit-field full">
                  <label>Reason</label>
                  <textarea name="reason" value={editForm.reason ?? ''} onChange={handleEditChange} rows={3} />
                </div>
              </div>
            </div>
            <div className="modal-foot">
              <button className="action-btn view" onClick={() => setEditing(null)}>Cancel</button>
              <button className="action-btn download" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Records;

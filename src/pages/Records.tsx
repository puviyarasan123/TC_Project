import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createRoot } from 'react-dom/client';
import TCCertificate from '../components/TCCertificate';
import { TCRecord, CollegeData } from '../types/tc';
import { getAllTCs, deleteTC } from '../lib/tc';
import { getAllColleges } from '../lib/college';

const Records: React.FC = () => {
  const [records,  setRecords]  = useState<TCRecord[]>([]);
  const [colleges, setColleges] = useState<Record<number, CollegeData>>({});
  const navigate = useNavigate();

  useEffect(() => {
    getAllTCs().then(r => setRecords(r));
    getAllColleges().then(r => {
      const map: Record<number, CollegeData> = {};
      r.forEach(c => { map[c.id] = c; });
      setColleges(map);
    });
  }, []);

  const waitForImages = (el: HTMLElement): Promise<void> => {
    const imgs = Array.from(el.querySelectorAll('img'));
    if (!imgs.length) return Promise.resolve();
    return Promise.all(
      imgs.map(img => img.complete
        ? Promise.resolve()
        : new Promise<void>(resolve => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    ).then(() => {});
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

  const deleteTC_record = async (id: number): Promise<void> => {
    if (!window.confirm('Delete this TC record? This cannot be undone.')) return;
    await deleteTC(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const fmt = (d: string): string => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  return (
    <div className="records-page">
      <div className="page-header">
        <h2>TC Records</h2>
        <p>View and download all issued Transfer Certificates</p>
      </div>

      <div className="records-stats">
        <div className="stat-card">
          <div className="stat-icon blue">📄</div>
          <div className="stat-info">
            <p>Total Issued</p>
            <h3>{records.length}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">📅</div>
          <div className="stat-info">
            <p>This Year</p>
            <h3>{records.filter(r => r.tc_number.includes(String(new Date().getFullYear()))).length}</h3>
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
          <span className="table-count">{records.length} records</span>
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
            {records.map(r => (
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
                  <button className="action-btn download" onClick={() => downloadPDF(r)}>⬇ PDF</button>
                  <button className="action-btn delete"   onClick={() => deleteTC_record(r.id)}>🗑 Delete</button>
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <p>No records found. Generate your first TC.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Records;

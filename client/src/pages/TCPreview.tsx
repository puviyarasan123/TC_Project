import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TCCertificate from '../components/TCCertificate';
import { TCRecord, CollegeData } from '../types/tc';
import { getTCById } from '../lib/tc';
import { getCollegeById } from '../lib/college';

const TCPreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData]       = useState<TCRecord | null>(null);
  const [college, setCollege] = useState<CollegeData | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const certRef  = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getTCById(parseInt(id, 10)).then(async rec => {
      setData(rec);
      if (rec.college_id) {
        const col = await getCollegeById(rec.college_id);
        setCollege(col);
      }
    });
  }, [id]);

  const downloadPDF = async (): Promise<void> => {
    const el = certRef.current;
    if (!el || !data) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(el, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        width: el.offsetWidth, height: el.offsetHeight,
      });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(
        canvas.toDataURL('image/png'), 'PNG', 0, 0,
        pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight()
      );
      pdf.save(`TC_${data.tc_number.replace(/\//g, '_')}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (!data) return (
    <div className="loading-screen">
      <div className="spinner" />
      <p>Loading certificate...</p>
    </div>
  );

  return (
    <div className="tc-page-wrapper">
      <div className="preview-toolbar">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div style={{ flex: 1, paddingLeft: 8 }}>
          <div className="preview-toolbar-title">Transfer Certificate — {data.tc_number}</div>
          <div className="preview-toolbar-sub">{data.student_name} {college ? `· ${college.name}` : ''}</div>
        </div>
        <button className="download-btn" onClick={downloadPDF} disabled={downloading}>
          {downloading ? '⏳ Preparing...' : '⬇ Download PDF'}
        </button>
      </div>
      <TCCertificate data={data} college={college} ref={certRef} />
    </div>
  );
};

export default TCPreview;

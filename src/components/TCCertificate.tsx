import React, { forwardRef, ReactNode } from 'react';
import './TCCertificate.css';
import { TCRecord, CollegeData } from '../types/tc';

const fmt = (d: string): string => (d ? new Date(d).toLocaleDateString('en-IN') : '');

interface DotLineProps { value?: string; wide?: boolean; }
const DotLine: React.FC<DotLineProps> = ({ value, wide }) => (
  <span className={`dot-line${wide ? ' wide' : ''}`}>{value ?? ''}</span>
);

interface RowProps {
  num: string;
  label: ReactNode;
  children?: ReactNode;
  value?: string;
  tall?: boolean;
}
const Row: React.FC<RowProps> = ({ num, label, children, value, tall }) => (
  <div className={`tc-row${tall ? ' tall' : ''}`}>
    <div className="tc-num-col">{num}.</div>
    <div className="tc-label-col">{label}</div>
    <div className="tc-colon-col">:</div>
    <div className="tc-value-col">{children ?? <DotLine value={value} wide />}</div>
  </div>
);

interface TCCertificateProps {
  data: TCRecord;
  college?: CollegeData | null;
}

const TCCertificate = forwardRef<HTMLDivElement, TCCertificateProps>(({ data, college }, ref) => {
  const collegeName = college?.name        ?? 'PALAR AGRICULTURAL COLLEGE';
  const trustName   = college?.trust_name  ?? 'A Unit of R.S Educational and Charitable Trust';
  const address     = college?.address     ?? 'Melpatti-635 805, Vellore (Dt), Tamil Nadu.';
  const logoUrl     = college?.logo_url    ?? '';

  return (
    <div className="tc-cert" ref={ref}>

      {/* Watermark */}
      <div className="watermark">
        {logoUrl
          ? <img src={logoUrl} alt="" className="watermark-img" crossOrigin="anonymous" />
          : <div className="watermark-circle"><span className="watermark-text">{collegeName}</span></div>
        }
      </div>

      {/* Header */}
      <div className="tc-header">
        <div className="header-logo">
          {logoUrl
            ? <img src={logoUrl} alt="college logo" className="logo-img" crossOrigin="anonymous" />
            : (
              <div className="logo-circle">
                <div className="logo-inner">
                  <div className="logo-cross">✛</div>
                  <div className="logo-text">
                    {collegeName.split(' ').map(w => w[0]).slice(0, 3).join('')}
                  </div>
                </div>
              </div>
            )
          }
        </div>
        <div className="header-text">
          <div className="college-name">{collegeName.toUpperCase()}</div>
          <div className="college-trust">({trustName})</div>
          <div className="college-accred">
            Accredited by <strong>INDIAN COUNCIL OF AGRICULTURAL RESEARCH (ICAR-NAEAB, New Delhi)</strong>
          </div>
          <div className="college-affil">
            Permanently Affiliated to <strong>TAMIL NADU AGRICULTURAL UNIVERSITY</strong>, Coimbatore
          </div>
          <div className="college-addr">{address}</div>
        </div>
      </div>

      <hr className="tc-divider" />

      {/* Title */}
      <div className="tc-title-bar"><span>TRANSFER CERTIFICATE</span></div>

      {/* TC No / ID No */}
      <div className="tc-top-row">
        <div>T.C.No.: {data.tc_number}</div>
        <div>ID No: <span className="dot-line short">{data.id_number ?? ''}</span></div>
      </div>

      {/* Body */}
      <div className="tc-body">

        {/* 1. Name of the student */}
        <Row num="1" label="Name of the student (In block letters)" value={data.student_name?.toUpperCase()} />

        {/* 2. Name of the Parents — Father / Mother / Guardian sub-rows */}
        <div className="tc-row tall">
          <div className="tc-num-col">2.</div>
          <div className="tc-label-col">Name of the Parents</div>
          <div className="tc-colon-col">:</div>
          <div className="tc-value-col">
            <div className="parent-sub">
              <div className="parent-sub-label">Father's Name</div>
              <div className="parent-sub-colon">:</div>
              <div className="parent-sub-value"><DotLine value={data.father_name} wide /></div>
            </div>
            <div className="parent-sub">
              <div className="parent-sub-label">Mother's Name</div>
              <div className="parent-sub-colon">:</div>
              <div className="parent-sub-value"><DotLine value={data.mother_name} wide /></div>
            </div>
            <div className="parent-sub">
              <div className="parent-sub-label">Guardian Name</div>
              <div className="parent-sub-colon">:</div>
              <div className="parent-sub-value"><DotLine value={data.guardian_name} wide /></div>
            </div>
          </div>
        </div>

        {/* 3. Gender — selected bold/underlined, others faded */}
        <Row num="3" label="Gender">
          <div className="gender-row">
            <span className={`gender-item${data.gender === 'Male' ? ' selected' : ''}`}>Male</span>
            <span className="gender-dots">. </span>
            <span className={`gender-item${data.gender === 'Female' ? ' selected' : ''}`}>Female</span>
            <span className="gender-dots">.... </span>
            <span className={`gender-item${data.gender === 'Transgender' ? ' selected' : ''}`}>Transgender</span>
            <span className="gender-dots">.</span>
          </div>
        </Row>

        {/* 4. Nationality and Religion */}
        <Row num="4" label="Nationality and Religion"
          value={`${data.nationality ?? ''}${data.religion ? ' & ' + data.religion : ''}`} />

        {/* 5. Community */}
        <Row num="5" label="Community" value={data.community} />

        {/* 6. Caste */}
        <Row num="6" label="Caste" value={data.caste} />

        {/* 7. Date of Birth */}
        <Row num="7" label={<>Date of Birth as entered in the admission Register<span className="sub-label">(In figures and words)</span></>} tall>
          <div className="dob-block">
            <DotLine value={fmt(data.dob)} wide />
            <DotLine value={data.dob_words} wide />
          </div>
        </Row>

        {/* 8. Date of Admission */}
        <Row num="8" label="Date of Admission" value={fmt(data.admission_date)} />

        {/* 9. Period of Study */}
        <Row num="9" label="Period of Study" value={data.study_period} />

        {/* 10. Date of Completion — from docx */}
        <Row num="10" label="Date of Completion" value={fmt(data.leaving_date)} />

        {/* 11. Degree in which the student was studying at the time of completion — from docx */}
        <Row num="11" label={<>Degree in which the student was studying<span className="sub-label">at the time of completion</span></>} tall
          value={data.class_at_leaving} />

        {/* 12. Medium of Instruction */}
        <Row num="12" label="Medium of Instruction" value={data.medium} />

        {/* 13. Whether qualified for promotion */}
        <Row num="13" label={<>Whether qualified for promotion to<span className="sub-label">higher education</span></>} tall
          value={data.promotion_status} />

        {/* 14. Date of application for T.C */}
        <Row num="14" label="Date of application for T.C" value={fmt(data.application_date)} />

        {/* 15. Reason for applying */}
        <Row num="15" label="Reason for applying for the T.C" value={data.reason} />

        {/* 16. Conduct and Character */}
        <Row num="16" label="Conduct and Character" value={data.conduct} />

      </div>

      {/* Footer */}
      <div className="tc-footer">
        <div className="footer-left">
          <div>Place: <span className="dot-line medium" /></div>
          <div>Date: <span className="dot-line medium" /></div>
        </div>
        <div className="footer-right">
          <div className="principal-label">Principal</div>
        </div>
      </div>

    </div>
  );
});

TCCertificate.displayName = 'TCCertificate';
export default TCCertificate;

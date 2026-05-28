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
  isDuplicate?: boolean;
}

const communityReligion: Record<string, string> = {
  'OC': 'Hindu', 'BC': 'Hindu', 'BC(M)': 'Muslim', 'MBC': 'Hindu', 'MBC(V)': 'Hindu',
  'SC': 'Hindu', 'SC(A)': 'Hindu', 'ST': 'Hindu',
  'BC(C)': 'Christian', 'SC(C)': 'Christian',
};

const TCCertificate = forwardRef<HTMLDivElement, TCCertificateProps>(({ data, college, isDuplicate }, ref) => {
  const collegeName = college?.name        ?? 'PALAR AGRICULTURAL COLLEGE';
  const trustName   = college?.trust_name  ?? 'A Unit of R.S Educational and Charitable Trust';
  const address     = college?.address     ?? 'Melpatti-635 805, Vellore (Dt), Tamil Nadu.';
  const logoUrl     = college?.logo_url    ?? '';
  const religion    = communityReligion[data.community ?? ''] ?? data.religion ?? '';

  return (
    <div className="tc-cert" ref={ref}>

      {/* Duplicate stamp */}
      {isDuplicate && (
        <div style={{
          position: 'absolute', top: 12, right: 16,
          border: '2.5px solid #c00', color: '#c00',
          fontWeight: 700, fontSize: 13, letterSpacing: 2,
          padding: '2px 10px', transform: 'rotate(0deg)',
          opacity: 0.85, pointerEvents: 'none', zIndex: 10,
          fontFamily: 'serif',
        }}>DUPLICATE</div>
      )}

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
      <div className="tc-top-row" style={{marginLeft: 34}} >
        <div>T.C.No.: {data.tc_number}</div>
        <div>ID No: <span className="dot-line short">{data.id_number ?? ''}</span></div>
      </div>

      {/* Body */}
      <div className="tc-body"style={{marginLeft: 34}} >

        {/* 1. Name of the student */}
        <Row num="1" label="Name of the Student (In block letters)">
          <span style={{fontWeight:'bold'}}>{data.student_name?.toUpperCase()}</span>
        </Row>

        {/* 2. Name of the Parents */}
        <div className="tc-row tall-3">
          <div className="tc-num-col" style={{alignSelf:'flex-start',paddingTop:4}}>2.</div>
          <div style={{flex:1, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', alignItems:'center', minHeight:40}}>
              <div className="tc-label-col">Name of the Parents</div>
              <div className="tc-colon-col">:</div>
              <div style={{flex:1, display:'flex', alignItems:'center'}}>
                <span style={{width:140, flexShrink:0}}>Father's Name</span>
                <span style={{width:20, flexShrink:0, textAlign:'center'}}>:</span>
                <DotLine value={data.father_name} wide />
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', minHeight:40}}>
              <div className="tc-label-col"></div>
              <div className="tc-colon-col">:</div>
              <div style={{flex:1, display:'flex', alignItems:'center'}}>
                <span style={{width:140, flexShrink:0}}>Mother's Name</span>
                <span style={{width:20, flexShrink:0, textAlign:'center'}}>:</span>
                <DotLine value={data.mother_name} wide />
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', minHeight:40}}>
              <div className="tc-label-col"></div>
              <div className="tc-colon-col">:</div>
              <div style={{flex:1, display:'flex', alignItems:'center'}}>
                <span style={{width:140, flexShrink:0}}>Guardian Name</span>
                <span style={{width:20, flexShrink:0, textAlign:'center'}}>:</span>
                <DotLine value={data.guardian_name} wide />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Gender — only print the selected value */}
        <Row num="3" label="Gender" value={data.gender} />

        {/* 4. Nationality and Religion */}
        <Row num="4" label="Nationality and Religion"
          value="Indian & Refer Community Certificate" />

        {/* 5. Community */}
        <Row num="5" label="Community" value="Refer Community Certificate" />

        {/* 6. Caste */}
        <Row num="6" label="Caste" value="Refer Community Certificate" />

        {/* 7. Date of Birth */}
        <div className="tc-row tall-2">
          <div className="tc-num-col" style={{alignSelf:'flex-start',paddingTop:4}}>7.</div>
          <div style={{flex:1, display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', alignItems:'center', minHeight:40}}>
              <div className="tc-label-col" style={{lineHeight:'1.4'}}>Date of Birth as entered in the admission Register (In figures and words)</div>
              <div className="tc-colon-col">:</div>
              <div style={{flex:1, display:'flex', alignItems:'center'}}>
                <span style={{width:140, flexShrink:0}}>In Figures</span>
                <span style={{width:20, flexShrink:0, textAlign:'center'}}>:</span>
                <DotLine value={fmt(data.dob)} wide />
              </div>
            </div>
            <div style={{display:'flex', alignItems:'center', minHeight:40}}>
              <div className="tc-label-col"></div>
              <div className="tc-colon-col">:</div>
              <div style={{flex:1, display:'flex', alignItems:'center'}}>
                <span style={{width:140, flexShrink:0}}>In Words</span>
                <span style={{width:20, flexShrink:0, textAlign:'center'}}>:</span>
                <DotLine value={data.dob_words} wide />
              </div>
            </div>
          </div>
        </div>

        {/* 8. Date of Admission */}
        <Row num="8" label="Date of Admission" value={fmt(data.admission_date)} />

        {/* 9. Period of Study */}
        <Row num="9" label="Period of Study" value={data.study_period} />

        {/* 10. Date of Completion — from docx */}
        <Row num="10" label="Date of Completion" value={fmt(data.leaving_date)} />

        {/* 11. Degree in which the student was studying at the time of completion — from docx */}
        <Row num="11" label="Degree in which the student was studying at the time of completion"
          value={data.class_at_leaving} />

        {/* 12. Medium of Instruction */}
        <Row num="12" label="Medium of Instruction" value={data.medium} />

        {/* 13. Whether qualified for promotion */}
        <Row num="13" label="Whether qualified for promotion to higher education"
          value="Refer Mark Sheet" />

        {/* 14. Date of application for T.C */}
        <Row num="14" label="Date of application for T.C" value={fmt(data.application_date)} />

        {/* 15. Reason for applying */}
        <Row num="15" label="Reason for applying for the T.C" value={data.reason} />

        {/* 16. Conduct and Character */}
        <Row num="16" label="Conduct and Character" value="" />

      </div>

      {/* Footer */}
      <div className="tc-footer" style={{marginLeft: 34}} >
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

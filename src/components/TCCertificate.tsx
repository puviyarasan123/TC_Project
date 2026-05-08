import React, { forwardRef, ReactNode } from 'react';
import './TCCertificate.css';
import { TCRecord, CollegeData } from '../types/tc';

const fmt = (d: string): string => (d ? new Date(d).toLocaleDateString('en-IN') : '');

interface DotLineProps { value?: string; wide?: boolean; }
const DotLine: React.FC<DotLineProps> = ({ value, wide }) => (
  <span className={`dot-line${wide ? ' wide' : ''}`}>{value ?? ''}</span>
);

interface RowProps {
  num: string; label: ReactNode; value?: string;
  children?: ReactNode; twoLine?: boolean;
}
const Row: React.FC<RowProps> = ({ num, label, value, children, twoLine }) => (
  <div className={`tc-row${twoLine ? ' two-line' : ''}`}>
    <div className="tc-label">
      <span className="tc-num">{num}.</span>
      <span className="tc-label-text">{label}</span>
    </div>
    <div className="tc-colon">:</div>
    <div className="tc-value">{children ?? <DotLine value={value} wide />}</div>
  </div>
);

interface TCCertificateProps {
  data: TCRecord;
  college?: CollegeData | null;
}

const TCCertificate = forwardRef<HTMLDivElement, TCCertificateProps>(({ data, college }, ref) => {
  const collegeName  = college?.name        ?? 'PALAR AGRICULTURAL COLLEGE';
  const trustName    = college?.trust_name  ?? 'A Unit of R.S. Educational and Charitable Trust';
  const affiliation  = college?.affiliation ?? '( Affiliated To Tamil Nadu Agricultural University )';
  const address      = college?.address     ?? 'Kothamarikuppam Village, Melpatti (Post) - 635 805, Vellore (Dist.) TN';
  const logoUrl      = college?.logo_url    ?? '';

  return (
    <div className="tc-cert" ref={ref}>

      {/* Decorative right border - alternating floral pattern */}
      <div className="right-border">
        {Array.from({ length: 80 }).map((_, i) => (
          <div key={i} className="border-unit">{i % 2 === 0 ? '✿' : '❀'}</div>
        ))}
      </div>

      {/* Watermark: same logo, large, centered, very faint */}
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
          <div className="college-sub">{trustName}</div>
          <div className="college-sub">( {affiliation.replace(/[()]/g, '').trim()} )</div>
          <div className="college-addr">{address}</div>
        </div>
      </div>

      {/* Title bar */}
      <div className="tc-title-bar"><span>TRANSFER CERTIFICATE</span></div>

      {/* TC No and ID No */}
      <div className="tc-top-row">
        <div className="tc-no">T.C.No.: <strong>{data.tc_number}</strong></div>
        <div className="id-no">ID No.: <span className="dot-line short">{data.id_number ?? ''}</span></div>
      </div>

      {/* Main body */}
      <div className="tc-body">
        <Row num="1"  label={<>Name of the Student<br /><span className="sub-label">(In block letters)</span></>} value={data.student_name?.toUpperCase()} twoLine />
        <Row num="2"  label="Name of the Parent / Guardian" value={data.parent_name} />
        <Row num="3"  label="Sex">
          <span className="gender-box">
            <span className={`checkbox${data.gender === 'Male'   ? ' checked' : ''}`} /> Male
            &nbsp;&nbsp;
            <span className={`checkbox${data.gender === 'Female' ? ' checked' : ''}`} /> Female
          </span>
        </Row>
        <Row num="4"  label="Nationality and Religion" value={`${data.nationality ?? ''}${data.religion ? ' / ' + data.religion : ''}`} />
        <Row num="5"  label={<>Community<br /><span className="sub-label">Whether he / she belongs to</span></>} value={data.community} twoLine />
        <Row num="6"  label="Caste" value={data.caste} />
        <Row num="7"  label={<>Date of birth as entered in the admission<br /><span className="sub-label">Register (In figures and words)</span></>} twoLine>
          <div className="dob-block">
            <DotLine value={fmt(data.dob)} wide />
            <DotLine value={data.dob_words} wide />
          </div>
        </Row>
        <Row num="8"  label="Date of Admission"                                                                                         value={fmt(data.admission_date)} />
        <Row num="9"  label="Period of Study"                                                                                           value={data.study_period} />
        <Row num="10" label="Date of Leaving"                                                                                           value={fmt(data.leaving_date)} />
        <Row num="11" label={<>Class in which the student was<br /><span className="sub-label">studying at the time of leaving</span></>} value={data.class_at_leaving} twoLine />
        <Row num="12" label="Medium of Instruction"                                                                                     value={data.medium} />
        <Row num="13" label={<>Whether qualified for promotion to a<br /><span className="sub-label">higher education</span></>}        value={data.promotion_status} twoLine />
        <Row num="14" label="Date of application for T.C."                                                                              value={fmt(data.application_date)} />
        <Row num="15" label="Reasons for applying for the T.C."                                                                         value={data.reason} />
        <Row num="16" label="Conduct and Character"                                                                                     value={data.conduct} />
      </div>

      {/* Footer */}
      <div className="tc-footer">
        <div className="footer-left">
          <div>Place : <span className="dot-line medium" /></div>
          <div>Date : <span className="dot-line medium" /></div>
        </div>
        <div className="footer-right">
          <div className="principal-label">PRINCIPAL</div>
        </div>
      </div>

    </div>
  );
});

TCCertificate.displayName = 'TCCertificate';
export default TCCertificate;

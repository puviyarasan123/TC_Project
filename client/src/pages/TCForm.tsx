import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTC } from '../lib/tc';
import { TCFormData, FieldConfig } from '../types/tc';
import { useCollege } from '../context/CollegeContext';
import CollegeSelector from '../components/CollegeSelector';

const initialState: TCFormData = {
  student_name: '', parent_name: '', gender: 'Male',
  nationality: '', religion: '', community: '', caste: '',
  dob: '', dob_words: '', admission_date: '', study_period: '',
  leaving_date: '', class_at_leaving: '', medium: '',
  promotion_status: '', application_date: '', reason: '',
  conduct: '', id_number: '', college_id: 0,
};

const personalFields: FieldConfig[] = [
  { name: 'student_name',   label: 'Name of the Student (Block Letters)', full: true },
  { name: 'parent_name',    label: 'Name of Parent / Guardian',           full: true },
  { name: 'id_number',      label: 'ID Number' },
  { name: 'nationality',    label: 'Nationality' },
  { name: 'religion',       label: 'Religion' },
  { name: 'community',      label: 'Community' },
  { name: 'caste',          label: 'Caste' },
  { name: 'dob',            label: 'Date of Birth (Figures)',             type: 'date' },
  { name: 'dob_words',      label: 'Date of Birth (Words)',               full: true },
];

const academicFields: FieldConfig[] = [
  { name: 'admission_date',   label: 'Date of Admission',                 type: 'date' },
  { name: 'study_period',     label: 'Period of Study' },
  { name: 'leaving_date',     label: 'Date of Leaving',                   type: 'date' },
  { name: 'class_at_leaving', label: 'Class at Time of Leaving',          full: true },
  { name: 'medium',           label: 'Medium of Instruction' },
  { name: 'promotion_status', label: 'Qualified for Promotion' },
  { name: 'application_date', label: 'Date of Application for T.C.',      type: 'date' },
  { name: 'reason',           label: 'Reasons for Applying T.C.',         full: true, textarea: true },
  { name: 'conduct',          label: 'Conduct and Character' },
];

const TCForm: React.FC = () => {
  const [form, setForm] = useState<TCFormData>(initialState);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { selected } = useCollege();
  const navigate = useNavigate();

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selected)                  { setError('Please select a college first.');  return; }
    if (!form.student_name.trim())  { setError('Student name is required.');        return; }
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, college_id: selected.id };
      const rec = await createTC(payload);
      navigate(`/preview/${rec.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (f: FieldConfig) => (
    <div key={f.name} className={`form-group${f.full ? ' full' : ''}`}>
      <label>{f.label}</label>
      {f.textarea
        ? <textarea name={f.name} value={form[f.name] as string} onChange={handle} />
        : <input type={f.type ?? 'text'} name={f.name} value={form[f.name] as string} onChange={handle} />
      }
    </div>
  );

  return (
    <div className="form-page">
      <div className="page-header">
        <h2>New Transfer Certificate</h2>
        <p>Select a college, fill in student details, and generate an official TC</p>
      </div>

      {/* College selector — always visible at top */}
      <CollegeSelector />

      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">📋</div>
          <div>
            <h3>Student Information</h3>
            <p>All fields are printed on the certificate</p>
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={submit}>
            <div className="form-grid">

              <div className="form-section-title">Personal Details</div>

              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={form.gender} onChange={handle}>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              {personalFields.map(renderField)}

              <div className="form-section-title">Academic Details</div>

              {academicFields.map(renderField)}

            </div>

            {error && <p className="error-msg">⚠ {error}</p>}

            <button type="submit" className="submit-btn" disabled={loading || !selected}>
              {loading ? '⏳ Generating...' : '🎓 Generate Transfer Certificate'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TCForm;

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTC } from '../lib/tc';
import { TCFormData, FieldConfig } from '../types/tc';
import { useCollege } from '../context/CollegeContext';
import CollegeSelector from '../components/CollegeSelector';
import { getAllDropdowns, DropdownOption } from '../lib/dropdowns';
import SearchableSelect from '../components/SearchableSelect';



const initialState: TCFormData = {
  student_name: '', father_name: '', mother_name: '', guardian_name: '',
  parent_name: '', gender: 'Male',
  nationality: 'Indian', religion: '', community: '', caste: '',
  dob: '', dob_words: '', admission_date: '', study_period: '',
  leaving_date: '', class_at_leaving: '', medium: '',
  promotion_status: '', application_date: '', reason: '',
  conduct: '', id_number: '', college_id: 0,
};

const personalFields: FieldConfig[] = [
  { name: 'student_name',  label: 'Name of the Student (Block Letters)', full: true },
  { name: 'father_name',   label: "Father's Name",                       full: true },
  { name: 'mother_name',   label: "Mother's Name",                       full: true },
  { name: 'guardian_name', label: 'Guardian Name',                       full: true },
  { name: 'id_number',     label: 'ID Number' },
  { name: 'dob',           label: 'Date of Birth (Figures)',             type: 'date' },
  { name: 'dob_words',     label: 'Date of Birth (Words)',               full: true },
];

const academicFields: FieldConfig[] = [
  { name: 'admission_date',   label: 'Date of Admission',                       type: 'date' },
  { name: 'study_period',     label: 'Period of Study' },
  { name: 'leaving_date',     label: 'Date of Completion',                      type: 'date' },
  { name: 'class_at_leaving', label: 'Degree at Time of Completion',            full: true },
  { name: 'medium',           label: 'Medium of Instruction' },
  { name: 'promotion_status', label: 'Qualified for Promotion to Higher Education' },
  { name: 'application_date', label: 'Date of Application for T.C.',            type: 'date' },
  { name: 'reason',           label: 'Reason for Applying T.C.',                full: true, textarea: true },
  { name: 'conduct',          label: 'Conduct and Character' },
];

const TCForm: React.FC = () => {
  const [form, setForm] = useState<TCFormData>(initialState);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [opts, setOpts] = useState<DropdownOption[]>([]);
  const { selected } = useCollege();
  const navigate = useNavigate();

  useEffect(() => { getAllDropdowns().then(setOpts).catch(() => {}); }, []);

  const vals = (cat: string, parent?: string) =>
    opts.filter(o => o.category === cat && (parent === undefined || o.parent === parent)).map(o => o.value);

  const handle = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'religion')  { updated.community = ''; updated.caste = ''; }
      if (name === 'community') { updated.caste = ''; }
      return updated;
    });
  };

  const handleSelect = (name: string, value: string): void => {
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'religion')  { updated.community = ''; updated.caste = ''; }
      if (name === 'community') { updated.caste = ''; }
      return updated;
    });
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
        : ['medium', 'promotion_status', 'conduct'].includes(f.name)
          ? <SearchableSelect
              name={f.name} value={form[f.name] as string}
              options={vals(f.name)} placeholder="-- Select --"
              onChange={handleSelect}
            />
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
                  <option>Transgender</option>
                </select>
              </div>

              <div className="form-group">
                <label>Nationality</label>
                <SearchableSelect
                  name="nationality" value={form.nationality}
                  options={vals('nationality')} onChange={handleSelect}
                />
              </div>

              <div className="form-group">
                <label>Religion</label>
                <SearchableSelect
                  name="religion" value={form.religion}
                  options={vals('religion')} placeholder="-- Select --" onChange={handleSelect}
                />
              </div>

              <div className="form-group">
                <label>Community</label>
                <SearchableSelect
                  name="community" value={form.community}
                  options={vals('community', form.religion)}
                  placeholder="-- Select --"
                  disabled={!form.religion}
                  onChange={handleSelect}
                />
              </div>

              <div className="form-group">
                <label>Caste</label>
                <SearchableSelect
                  name="caste" value={form.caste}
                  options={vals('caste', form.community)}
                  placeholder="-- Select --"
                  disabled={!form.community}
                  onChange={handleSelect}
                />
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

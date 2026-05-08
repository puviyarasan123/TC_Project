import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTC } from '../lib/tc';
import { TCFormData, FieldConfig } from '../types/tc';
import { useCollege } from '../context/CollegeContext';
import CollegeSelector from '../components/CollegeSelector';

const NATIONALITIES = [
  'Indian', 'Afghan', 'Australian', 'Bangladeshi', 'Bhutanese', 'British',
  'Canadian', 'Chinese', 'French', 'German', 'Indonesian', 'Iranian', 'Iraqi',
  'Japanese', 'Kenyan', 'Malaysian', 'Maldivian', 'Nepali', 'Nigerian',
  'Pakistani', 'Russian', 'Saudi Arabian', 'Singaporean', 'Sri Lankan',
  'Thai', 'Turkish', 'American', 'Others',
];

const RELIGIONS = [
  'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Zoroastrian', 'Jewish', 'Others',
];

// Tamil Nadu government community classification
const COMMUNITIES: Record<string, string[]> = {
  Hindu:       ['OC', 'BC', 'BC(M)', 'MBC', 'MBC(V)', 'SC', 'SC(A)', 'ST'],
  Muslim:      ['BC(M)', 'OC'],
  Christian:   ['BC(C)', 'SC(C)', 'ST', 'OC'],
  Sikh:        ['OC'],
  Buddhist:    ['OC', 'SC'],
  Jain:        ['OC'],
  Zoroastrian: ['OC'],
  Jewish:      ['OC'],
  Others:      ['OC', 'BC', 'SC', 'ST'],
};

// Full Tamil Nadu caste list per community (TN govt official list)
const CASTES: Record<string, string[]> = {
  OC: [
    'Brahmin - Iyer', 'Brahmin - Iyengar', 'Brahmin - Others',
    'Mudaliar', 'Vellalar', 'Pillai', 'Chettiar', 'Naidu', 'Gounder (OC)',
    'Kamma', 'Reddy', 'Nair', 'Kshatriya', 'Vysya', 'Arya Vysya',
    'Balija', 'Beri Chettiar', 'Devanga Chettiar', 'Illathu Pillai',
    'Karkatta Vellalar', 'Kondaikatti Vellalar', 'Mudali', 'Munsiff',
    'Nattukotai Chettiar', 'Saiva Vellalar', 'Senguntha Mudaliar',
    'Sozhia Vellalar', 'Thuluva Vellalar', 'Udayar', 'Veerakodi Vellalar',
    'Others',
  ],
  BC: [
    'Agamudayar', 'Ambalakarar', 'Andipandaram', 'Arayar', 'Bestha',
    'Bhatraju', 'Boyar', 'Chakkala', 'Chavalakarar', 'Chettiar (BC)',
    'Devanga', 'Ezhavathy', 'Ezhuthachar', 'Gandla', 'Gavara',
    'Gounder (BC)', 'Idaiyar', 'Illuvan', 'Jogi', 'Kaikolar',
    'Kallar', 'Karuneegar', 'Kavarkarar', 'Koli', 'Konar',
    'Kongu Vellalar', 'Krishnanvaka', 'Kudumbi', 'Kulalar', 'Kumbar',
    'Kunnuvar', 'Kuravan', 'Kurumbar', 'Mahratta (Non-Brahmin)',
    'Malayar', 'Mannan', 'Maravars', 'Maravar', 'Meenavar',
    'Mudaliar (BC)', 'Mukkuvar', 'Muthuraja', 'Naicker (BC)',
    'Nattaman', 'Oddar', 'Padayachi', 'Pallan (BC)', 'Panan',
    'Panisaivan', 'Parkavakulam', 'Perike', 'Pillai (BC)',
    'Rajput', 'Saiva Pillai', 'Sakkaravar', 'Saliyar', 'Senaithalaivar',
    'Sozhia Naicker', 'Thachar', 'Thigala', 'Thoraiyar', 'Udayar (BC)',
    'Uppara', 'Urali Gounder', 'Valayar', 'Vannar', 'Vanniyar',
    'Veduvar', 'Vellan Chettiar', 'Vettuva Gounder', 'Vishwakarma',
    'Yadavar', 'Others',
  ],
  'BC(M)': [
    'Dekkani Muslim', 'Dudekula', 'Illupapalayam Muslim',
    'Labbai', 'Lebbai', 'Marakkar', 'Marakkayar',
    'Memon', 'Nattu Labbai', 'Navayath', 'Pattani',
    'Rawther', 'Rowther', 'Sheik', 'Syed',
    'Tamil Muslim', 'Urdu Muslim', 'Others',
  ],
  'BC(C)': [
    'Adi Dravida Christian', 'Anglo Indian', 'Christian Nadar',
    'Christian Vanniyar', 'Latin Catholic', 'Protestant Christian',
    'Roman Catholic', 'Others',
  ],
  MBC: [
    'Agamudayar (MBC)', 'Ambalakarar (MBC)', 'Arunthathiyar (MBC)',
    'Bestha (MBC)', 'Boyar (MBC)', 'Chakkiliyar (MBC)',
    'Ezhavathy (MBC)', 'Gandla (MBC)', 'Idaiyar (MBC)',
    'Kallar (MBC)', 'Konar (MBC)', 'Kori',
    'Kudumbi (MBC)', 'Kulalar (MBC)', 'Kumbar (MBC)',
    'Kuravan (MBC)', 'Kurumbar (MBC)', 'Maravars (MBC)',
    'Meenavar (MBC)', 'Mudaliar (MBC)', 'Mukkuvar (MBC)',
    'Muthuraja (MBC)', 'Naicker (MBC)', 'Nadar',
    'Oddar (MBC)', 'Padayachi (MBC)', 'Pallan (MBC)',
    'Panisaivan (MBC)', 'Parkavakulam (MBC)', 'Perike (MBC)',
    'Saliyar (MBC)', 'Senaithalaivar (MBC)', 'Thachar (MBC)',
    'Thigala (MBC)', 'Uppara (MBC)', 'Urali Gounder (MBC)',
    'Valayar (MBC)', 'Vannar (MBC)', 'Vanniyar (MBC)',
    'Veduvar (MBC)', 'Vishwakarma (MBC)', 'Yadavar (MBC)', 'Others',
  ],
  'MBC(V)': [
    'Vokkaliga', 'Vokkaliga Gowda', 'Others',
  ],
  SC: [
    'Adi Andhra', 'Adi Dravida', 'Adi Karnataka',
    'Ajila', 'Arunthathiyar', 'Ayyanavar',
    'Baira', 'Bakuda', 'Bandi',
    'Bellara', 'Bharatar', 'Chakkiliyan',
    'Chakkiliyar', 'Chamar', 'Chandala',
    'Cheruman', 'Devendrakulam', 'Domban',
    'Godagali', 'Godda', 'Gosangi',
    'Holeya', 'Jaggali', 'Jambuvulu',
    'Kadaiyan', 'Kakkalan', 'Kalladi',
    'Kanakkan', 'Kavara', 'Koliyan',
    'Koosa', 'Kudumban', 'Kuravan (SC)',
    'Madari', 'Madiga', 'Maila',
    'Mala', 'Mannan (SC)', 'Mavilan',
    'Moger', 'Mundala', 'Nalakeyava',
    'Nayadi', 'Padannan', 'Pallan',
    'Palluvan', 'Pambada', 'Panan (SC)',
    'Panchama', 'Pannadi', 'Panniandi',
    'Paraiyar', 'Paravan', 'Pathiyan',
    'Perumannan', 'Pulayan', 'Puthirai Vannan',
    'Raneyar', 'Samagara', 'Samban',
    'Sapari', 'Semman', 'Thandan',
    'Thoti', 'Tiruvalluvar', 'Vallon',
    'Valluvan', 'Vannan (SC)', 'Vathiriyan',
    'Velan', 'Vetan', 'Vettiyan',
    'Others',
  ],
  'SC(A)': [
    'Arunthathiyar', 'Chakkiliyan', 'Chakkiliyar',
    'Madiga', 'Pagadai', 'Others',
  ],
  'SC(C)': [
    'Adi Dravida Christian', 'Christian Paraiyar',
    'Christian Pallan', 'Christian Chakkiliyar', 'Others',
  ],
  ST: [
    'Adiyan', 'Arandan', 'Eravallan',
    'Hill Pulayan', 'Irular', 'Kadar',
    'Kammara (ST)', 'Kanikaran', 'Kanikar',
    'Kattunayakan', 'Kochu Velan', 'Konda Kapus',
    'Kondareddi', 'Koraga', 'Kota',
    'Kudiya', 'Kurichchan', 'Kurumans',
    'Kurumba', 'Maha Malasar', 'Malasar',
    'Malayan', 'Malayekandi', 'Mannan (ST)',
    'Mavilan (ST)', 'Moopan', 'Mudugar',
    'Muduvan', 'Muthuvan', 'Palleyan',
    'Paniyan', 'Sholaga', 'Toda',
    'Uraly', 'Others',
  ],
};

const initialState: TCFormData = {
  student_name: '', parent_name: '', gender: 'Male',
  nationality: 'Indian', religion: '', community: '', caste: '',
  dob: '', dob_words: '', admission_date: '', study_period: '',
  leaving_date: '', class_at_leaving: '', medium: '',
  promotion_status: '', application_date: '', reason: '',
  conduct: '', id_number: '', college_id: 0,
};

const personalFields: FieldConfig[] = [
  { name: 'student_name', label: 'Name of the Student (Block Letters)', full: true },
  { name: 'parent_name',  label: 'Name of Parent / Guardian',           full: true },
  { name: 'id_number',    label: 'ID Number' },
  { name: 'dob',          label: 'Date of Birth (Figures)',             type: 'date' },
  { name: 'dob_words',    label: 'Date of Birth (Words)',               full: true },
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
    const { name, value } = e.target;
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

              <div className="form-group">
                <label>Nationality</label>
                <select name="nationality" value={form.nationality} onChange={handle}>
                  <option value="">-- Select --</option>
                  {NATIONALITIES.map(n => <option key={n}>{n}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Religion</label>
                <select name="religion" value={form.religion} onChange={handle}>
                  <option value="">-- Select --</option>
                  {RELIGIONS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Community</label>
                <select name="community" value={form.community} onChange={handle} disabled={!form.religion}>
                  <option value="">-- Select --</option>
                  {(COMMUNITIES[form.religion] ?? []).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Caste</label>
                <select name="caste" value={form.caste} onChange={handle} disabled={!form.community}>
                  <option value="">-- Select --</option>
                  {(CASTES[form.community] ?? []).map(c => <option key={c}>{c}</option>)}
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

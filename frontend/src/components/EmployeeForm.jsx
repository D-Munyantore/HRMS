import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();   // id exists when editing
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    EmpFirstName: '', EmpLastName: '', EmpEmail: '', EmpTelephone: '',
    EmpGender: 'Male', EmpAddress: '', EmpDateOfBirth: '', EmpHireDate: '',
    EmpStatus: 'active', DepartmentID: '', PositionID: ''
  });

  useEffect(() => {
    api.get('/api/departments').then(r => setDepartments(r.data));
    api.get('/api/positions').then(r => setPositions(r.data));
    if (id) api.get(`/api/employees/${id}`).then(r => setForm(r.data));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (id) await api.put(`/api/employees/${id}`, form);
      else    await api.post('/api/employees', form);
      navigate('/employees');
    } catch { alert('Failed to save employee'); }
    finally { setLoading(false); }
  };

  // Helper: update any field easily
  const set = (field) => (e) => setForm({...form, [field]: e.target.value});

  const inputClass = "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";
  const labelClass = "block text-sm font-medium text-gray-600 mb-1";

  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{id ? '✏️ Edit' : '➕ Add'} Employee</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div><label className={labelClass}>First Name *</label>
          <input required className={inputClass} value={form.EmpFirstName} onChange={set('EmpFirstName')} /></div>

        <div><label className={labelClass}>Last Name *</label>
          <input required className={inputClass} value={form.EmpLastName} onChange={set('EmpLastName')} /></div>

        <div><label className={labelClass}>Email</label>
          <input type="email" className={inputClass} value={form.EmpEmail} onChange={set('EmpEmail')} /></div>

        <div><label className={labelClass}>Telephone</label>
          <input className={inputClass} value={form.EmpTelephone} onChange={set('EmpTelephone')} /></div>

        <div><label className={labelClass}>Gender</label>
          <select className={inputClass} value={form.EmpGender} onChange={set('EmpGender')}>
            <option>Male</option><option>Female</option>
          </select></div>

        <div><label className={labelClass}>Status</label>
          <select className={inputClass} value={form.EmpStatus} onChange={set('EmpStatus')}>
            {['active','on leave','left','blacklisted','deceased','on mission'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select></div>

        <div><label className={labelClass}>Date of Birth</label>
          <input type="date" className={inputClass} value={form.EmpDateOfBirth?.slice(0,10)||''} onChange={set('EmpDateOfBirth')} /></div>

        <div><label className={labelClass}>Hire Date</label>
          <input type="date" className={inputClass} value={form.EmpHireDate?.slice(0,10)||''} onChange={set('EmpHireDate')} /></div>

        <div className="md:col-span-2"><label className={labelClass}>Address</label>
          <textarea rows="2" className={inputClass} value={form.EmpAddress} onChange={set('EmpAddress')} /></div>

        <div><label className={labelClass}>Department</label>
          <select className={inputClass} value={form.DepartmentID||''} onChange={set('DepartmentID')}>
            <option value="">-- Select Department --</option>
            {departments.map(d => (
              <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
            ))}
          </select></div>

        <div><label className={labelClass}>Position</label>
          <select className={inputClass} value={form.PositionID||''} onChange={set('PositionID')}>
            <option value="">-- Select Position --</option>
            {positions.map(p => (
              <option key={p.PositionID} value={p.PositionID}>{p.PosName}</option>
            ))}
          </select></div>

        <div className="md:col-span-2 flex gap-3 mt-2">
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50">
            {loading ? 'Saving...' : '💾 Save'}
          </button>
          <button type="button" onClick={() => navigate('/employees')}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-2 rounded-lg font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
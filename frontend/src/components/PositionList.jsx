import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function PositionList() {
  const [positions, setPositions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ PosName: '', RequiredQualification: '' });

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await api.get('/api/positions');
    setPositions(res.data);
  };

  const openAdd = () => {
    setEditing(null);
    setError('');
    setForm({ PosName: '', RequiredQualification: '' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setError('');
    setForm({
      PosName: p.PosName || '',
      RequiredQualification: p.RequiredQualification || ''
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editing) await api.put(`/api/positions/${editing.PositionID}`, form);
      else         await api.post('/api/positions', form);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save position');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    if (confirm(`Delete "${p.PosName}"?`)) { await api.delete(`/api/positions/${p.PositionID}`); load(); }
  };

  const inputClass = "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400";

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">💼 Positions</h2>
        <button onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          + Add Position
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {error && (
            <p className="md:col-span-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
              {error}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Position Name *</label>
            <input required className={inputClass} placeholder="e.g. Developer"
              value={form.PosName} onChange={(e) => setForm({...form, PosName: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Required Qualification</label>
            <input className={inputClass} placeholder="e.g. Bachelor's Degree"
              value={form.RequiredQualification} onChange={(e) => setForm({...form, RequiredQualification: e.target.value})} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" disabled={saving} className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-2">
        {positions.map(p => (
          <div key={p.PositionID}
            className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50">
            <div>
              <p className="font-medium">💼 {p.PosName}</p>
              <p className="text-sm text-gray-500">{p.RequiredQualification || 'No qualification listed'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openEdit(p)} className="text-blue-600 font-medium">Edit</button>
              <button onClick={() => handleDelete(p)} className="text-red-500 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

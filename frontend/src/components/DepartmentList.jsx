import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await api.get('/api/departments');
    setDepartments(res.data);
  };

  const openAdd = () => { setEditing(null); setName(''); setShowForm(true); };
  const openEdit = (d) => { setEditing(d); setName(d.DepartmentName); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/api/departments/${editing.DepartmentID}`, { DepartmentName: name });
    else         await api.post('/api/departments', { DepartmentName: name });
    setShowForm(false); setName(''); load();
  };

  const handleDelete = async (d) => {
    if (confirm(`Delete "${d.DepartmentName}"?`)) {
      await api.delete(`/api/departments/${d.DepartmentID}`);
      load();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🏢 Departments</h2>
        <button onClick={openAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          + Add Department
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">Department Name</label>
            <input required autoFocus
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Finance" />
          </div>
          <button type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium">
            {editing ? 'Update' : 'Save'}
          </button>
          <button type="button" onClick={() => setShowForm(false)}
            className="bg-gray-200 px-4 py-2 rounded-lg">
            Cancel
          </button>
        </form>
      )}

      <div className="grid gap-2">
        {departments.map(d => (
          <div key={d.DepartmentID}
            className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50">
            <span className="font-medium">🏢 {d.DepartmentName}</span>
            <div className="flex gap-3">
              <button onClick={() => openEdit(d)} className="text-blue-600 font-medium">Edit</button>
              <button onClick={() => handleDelete(d)} className="text-red-500 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';

// Color badge for employee status
function StatusBadge({ status }) {
  const colors = {
    active: 'bg-green-100 text-green-700',
    'on leave': 'bg-yellow-100 text-yellow-700',
    left: 'bg-gray-100 text-gray-600',
    blacklisted: 'bg-red-100 text-red-700',
    deceased: 'bg-purple-100 text-purple-700',
    'on mission': 'bg-blue-100 text-blue-700'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEmployees(); }, []);

  const loadEmployees = async () => {
    try {
      const res = await api.get('/api/employees');
      setEmployees(res.data);
    } catch { alert('Failed to load employees'); }
    finally { setLoading(false); }
  };

  const deleteEmployee = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    await api.delete(`/api/employees/${id}`);
    loadEmployees();
  };

  const filtered = employees.filter(e =>
    `${e.EmpFirstName} ${e.EmpLastName} ${e.DepartmentName} ${e.PosName}`
      .toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 className="text-2xl font-bold">👥 Employees</h2>
        <Link to="/employees/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          + Add Employee
        </Link>
      </div>

      <input type="text" placeholder="🔍 Search by name, department, position..."
        className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={search} onChange={(e) => setSearch(e.target.value)} />

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Department</th>
              <th className="p-3 font-semibold">Position</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Gender</th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.EmpID} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{emp.EmpFirstName} {emp.EmpLastName}</td>
                <td className="p-3">{emp.DepartmentName || '—'}</td>
                <td className="p-3">{emp.PosName || '—'}</td>
                <td className="p-3"><StatusBadge status={emp.EmpStatus} /></td>
                <td className="p-3">{emp.EmpGender}</td>
                <td className="p-3 flex gap-2">
                  <Link to={`/employees/edit/${emp.EmpID}`}
                    className="text-blue-600 hover:underline font-medium">Edit</Link>
                  <button onClick={() => deleteEmployee(emp.EmpID, emp.EmpFirstName)}
                    className="text-red-500 hover:underline font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="6" className="p-6 text-center text-gray-400">No employees found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
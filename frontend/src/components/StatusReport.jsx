import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

export default function StatusReport() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/report/on-leave')
      .then((res) => setData(res.data))
      .catch((err) => console.error('Error loading report:', err))
      .finally(() => setLoading(false));
  }, []);

  // Group employees by department
  const grouped = data.reduce((acc, emp) => {
    const dept = emp.DepartmentName || 'No Department';

    if (!acc[dept]) {
      acc[dept] = [];
    }

    acc[dept].push(emp);
    return acc;
  }, {});

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500">
        Loading report...
      </p>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Report Header */}
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold">
          📊 Employee Status Report
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Employees Currently On Leave — Organized by Department
        </p>

        <p className="text-gray-400 text-xs">
          Generated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Summary */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex justify-between items-center">
        <span className="font-semibold text-yellow-800">
          Total Employees On Leave
        </span>

        <span className="text-3xl font-bold text-yellow-700">
          {data.length}
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-gray-400 py-8">
          No employees are currently on leave.
        </p>
      ) : (
        <>
          {Object.entries(grouped).map(([deptName, employees]) => (
            <div key={deptName} className="mb-6">
              {/* Department Header */}
              <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                <span className="font-semibold">
                  🏢 {deptName}
                </span>

                <span className="bg-white text-blue-700 text-sm font-bold px-3 py-0.5 rounded-full">
                  {employees.length} employee
                  {employees.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Employee Table */}
              <table className="w-full text-sm border border-t-0">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left font-semibold">
                      Full Name
                    </th>
                    <th className="p-3 text-left font-semibold">
                      Position
                    </th>
                    <th className="p-3 text-left font-semibold">
                      Email
                    </th>
                    <th className="p-3 text-left font-semibold">
                      Telephone
                    </th>
                    <th className="p-3 text-left font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.EmpID}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">
                        {emp.EmpFirstName} {emp.EmpLastName}
                      </td>

                      <td className="p-3">
                        {emp.PosName || '—'}
                      </td>

                      <td className="p-3 text-gray-500">
                        {emp.EmpEmail || '—'}
                      </td>

                      <td className="p-3 text-gray-500">
                        {emp.EmpTelephone || '—'}
                      </td>

                      <td className="p-3">
                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold">
                          On Leave
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={4} className="p-3 text-right">
                      Department Total:
                    </td>

                    <td className="p-3">
                      {employees.length}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
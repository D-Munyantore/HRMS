import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');  // 'login' or 'signup'
  const [form, setForm] = useState({ username: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!form.username || !form.password) { setError('Please fill in all fields'); return; }
    if (mode === 'signup' && form.password !== form.confirm) { setError('Passwords do not match'); return; }

    setLoading(true);
    try {
      if (mode === 'signup') {
        await api.post('/api/signup', { username: form.username, password: form.password });
      }
      const res = await api.post('/api/login', { username: form.username, password: form.password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏢</div>
          <h1 className="text-2xl font-bold text-gray-800">HRMS</h1>
          <p className="text-gray-500 text-sm">Human Resource Management System</p>
        </div>

        {/* Toggle Login / Signup */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
          {['login', 'signup'].map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-md capitalize font-medium transition ${
                mode === m ? 'bg-white text-blue-700 shadow' : 'text-gray-500'
              }`}>
              {m}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
          <input className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Username" value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})} />
          <input type="password" className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Password" value={form.password}
            onChange={(e) => setForm({...form, password: e.target.value})} />
          {mode === 'signup' && (
            <input type="password" className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Confirm Password" value={form.confirm}
              onChange={(e) => setForm({...form, confirm: e.target.value})} />
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50">
            {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Login'}
          </button>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center text-sm text-gray-600">
          Default login: admin / admin123
        </div>
      </div>
    </div>
  );
}
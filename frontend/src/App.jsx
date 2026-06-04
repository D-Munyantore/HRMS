import { BrowserRouter, Routes, Route, Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import Login from './components/Login';
import EmployeeList from './components/EmployeeList';
import EmployeeForm from './components/EmployeeForm';
import DepartmentList from './components/DepartmentList';
import PositionList from './components/PositionList';
import StatusReport from './components/StatusReport';

// Protect pages — redirect to login if not logged in
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" />;
}

// Nav link that highlights when active
function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  return (
    <Link to={to}
      className={`px-3 py-2 rounded-lg font-medium transition ${
        isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
}

// The page layout (navbar + footer)
function Layout() {
  const logout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="bg-gradient-to-r from-blue-700 to-indigo-700 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <h1 className="text-xl font-bold text-white">🏢 HRMS</h1>
          <div className="flex flex-wrap gap-1">
            <NavLink to="/employees">👥 Employees</NavLink>
            <NavLink to="/departments">🏢 Departments</NavLink>
            <NavLink to="/positions">💼 Positions</NavLink>
            <NavLink to="/report">📊 Status Report</NavLink>
          </div>
          <button onClick={logout} className="px-3 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white">
            🚪 Logout
          </button>
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 border-t">
        © 2026 HRMS — DAB Enterprise LTD
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<EmployeeList />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="employees/new" element={<EmployeeForm />} />
          <Route path="employees/edit/:id" element={<EmployeeForm />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="positions" element={<PositionList />} />
          <Route path="report" element={<StatusReport />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import BicyclesList from './pages/BicyclesList';
import StationsList from './pages/StationsList';
import RideHistory from './pages/RideHistory';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ManageBicycles from './pages/ManageBicycles';
import ManageStations from './pages/ManageStations';
import AllRides from './pages/AllRides';
import AllUsers from './pages/AllUsers';
import AdminLogin from './pages/AdminLogin';
import ManageIssues from './pages/ManageIssues';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} />;

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRole="student"><MainLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="bicycles" element={<BicyclesList />} />
        <Route path="stations" element={<StationsList />} />
        <Route path="history" element={<RideHistory />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRole="admin"><MainLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="bicycles" element={<ManageBicycles />} />
        <Route path="stations" element={<ManageStations />} />
        <Route path="issues" element={<ManageIssues />} />
        <Route path="rides" element={<AllRides />} />
        <Route path="users" element={<AllUsers />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bike, Mail, Lock, Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, user }         = useContext(AuthContext);
  const navigate                = useNavigate();

  // Force dark mode for admin login page
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/student/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.message || 'Invalid credentials');
    } else if (res.role !== 'admin') {
      setError('Access denied. This portal is for administrators only.');
      // log the student back out
      localStorage.removeItem('userInfo');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-600/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-900/20 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-teal-600 shadow-2xl shadow-primary-900/50 mb-4">
            <Bike className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">SmartCycle</h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Shield className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-semibold text-primary-400 uppercase tracking-widest">Admin Portal</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Administrator Sign In</h2>
            <p className="text-sm text-gray-400 mt-1">Restricted access — admins only</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-gray-800 p-1 rounded-xl mb-6 border border-gray-700/50">
            <button 
              onClick={() => navigate('/login')}
              type="button"
              className="flex-1 py-2 text-sm font-semibold rounded-lg text-gray-500 hover:text-gray-300 transition-all"
            >
              Student
            </button>
            <button className="flex-1 py-2 text-sm font-semibold rounded-lg bg-gray-700 shadow text-white transition-all">
              Administrator
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-primary-600 to-teal-600 hover:from-primary-500 hover:to-teal-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-900/40 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Sign In as Admin
                </>
              )}
            </button>
          </form>

          {/* Hint box */}
          <div className="mt-6 p-4 bg-gray-800/60 border border-gray-700 rounded-xl">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Default Credentials</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-300 font-mono">📧 admin@gmail.com</p>
              <p className="text-xs text-gray-300 font-mono">🔑 Admin@1234</p>
            </div>
          </div>
        </div>

        {/* Back to student login */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Not an admin?{' '}
          <a href="/login" className="text-primary-400 hover:text-primary-300 font-medium transition">
            Student Login →
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;

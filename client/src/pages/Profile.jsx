import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Hash, Save, CheckCircle, AlertCircle, Bike, Clock, Zap, TrendingUp, Lock } from 'lucide-react';

const InputField = ({ label, id, icon: Icon, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      <input
        id={id}
        className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
    </div>
  </div>
);

const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border dark:border-gray-700">
    <div className={`p-2 rounded-lg ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [rideStats, setRideStats] = useState({ totalRides: 0, totalMinutes: 0, ecoPoints: 0, estimatedKm: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', msg }

  useEffect(() => {
    fetchProfile();
    fetchRideStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile');
      setForm(f => ({ ...f, name: data.name, email: data.email }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchRideStats = async () => {
    try {
      const { data } = await api.get('/rides/myrides');
      const completed = data.filter(r => r.status === 'completed');
      const totalMinutes = completed.reduce((s, r) => s + (r.duration || 0), 0);
      const totalDistanceKm = completed.reduce((s, r) => s + (r.distanceKm || 0), 0);
      setRideStats({
        totalRides: data.length,
        totalMinutes,
        ecoPoints: totalMinutes,
        estimatedKm: Math.round(totalDistanceKm * 100) / 100,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      return showToast('error', 'Passwords do not match.');
    }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.password) payload.password = form.password;
      const { data } = await api.put('/auth/profile', payload);
      updateUser(data);
      setForm(f => ({ ...f, password: '', confirmPassword: '' }));
      showToast('success', 'Profile updated successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border transition-all animate-fade-in ${
          toast.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/40 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
            : 'bg-red-50 dark:bg-red-900/40 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            : <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />}
          <p className="text-sm font-medium">{toast.msg}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
          <span className="text-2xl font-bold text-white">{user?.name?.[0]?.toUpperCase()}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.rollNumber} · {user?.role === 'admin' ? 'Administrator' : 'Student'}</p>
        </div>
      </div>

      {/* Ride Summary */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Your Ride Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatPill icon={Bike}       label="Total Rides"    value={rideStats.totalRides}                color="bg-blue-500" />
          <StatPill icon={Clock}      label="Minutes Ridden" value={`${rideStats.totalMinutes} min`}     color="bg-violet-500" />
          <StatPill icon={TrendingUp} label="Real Distance"  value={`${rideStats.estimatedKm} km`}       color="bg-orange-500" />
          <StatPill icon={Zap}        label="Eco Points"     value={rideStats.ecoPoints}                 color="bg-emerald-500" />
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Edit Profile</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <InputField
            id="profile-name"
            label="Full Name"
            icon={User}
            type="text"
            placeholder="Your name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
          />
          <InputField
            id="profile-email"
            label="Email Address"
            icon={Mail}
            type="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />
          <InputField
            id="profile-roll"
            label="Roll Number"
            icon={Hash}
            type="text"
            value={user?.rollNumber || ''}
            disabled
          />

          <div className="border-t dark:border-gray-700 pt-4">
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Leave password fields blank to keep existing password
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                id="profile-password"
                label="New Password"
                icon={Lock}
                type="password"
                placeholder="New password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                minLength={6}
              />
              <InputField
                id="profile-confirm"
                label="Confirm Password"
                icon={Lock}
                type="password"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="profile-save-btn"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
            >
              {saving ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

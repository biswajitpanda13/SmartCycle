import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Bike, Users, MapPin, Activity, ArrowRight,
  TrendingUp, CheckCircle, AlertCircle, Shield,
  BarChart2, Clock, Zap, Star
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, gradient, link, sub }) => (
  <Link to={link} className="group relative overflow-hidden rounded-2xl p-6 flex flex-col justify-between min-h-[140px] transition-all hover:scale-[1.02] hover:shadow-xl shadow-md cursor-pointer">
    <div className={`absolute inset-0 ${gradient}`} />
    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white opacity-10" />
    <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-white opacity-5" />
    <div className="relative flex items-start justify-between">
      <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <ArrowRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
    </div>
    <div className="relative">
      <p className="text-4xl font-bold text-white tabular-nums">{value}</p>
      <p className="text-white/80 font-medium mt-1 text-sm">{title}</p>
      {sub && <p className="text-white/50 text-xs mt-0.5">{sub}</p>}
    </div>
  </Link>
);

const QuickAction = ({ to, icon: Icon, label, desc, color }) => (
  <Link
    to={to}
    className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all"
  >
    <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-white">{label}</p>
      <p className="text-xs text-gray-400 truncate">{desc}</p>
    </div>
    <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
  </Link>
);

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalBicycles: 0, availableBicycles: 0, activeRides: 0, totalUsers: 0 });
  const [recentRides, setRecentRides] = useState([]);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ridesRes, feedbackRes] = await Promise.all([
        api.get('/rides/stats'),
        api.get('/rides'),
        api.get('/rides/feedback')
      ]);
      setStats(statsRes.data);
      setRecentRides(ridesRes.data.slice(0, 6));
      setRecentFeedback(feedbackRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
    </div>
  );

  const utilizationPct = stats.totalBicycles > 0
    ? Math.round(((stats.totalBicycles - stats.availableBicycles) / stats.totalBicycles) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary-400" />
            <span className="text-xs font-semibold text-primary-400 uppercase tracking-widest">Admin Console</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-sm font-medium text-emerald-400">System Online</span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bicycles"       value={stats.totalBicycles}    icon={Bike}         gradient="bg-gradient-to-br from-blue-600 to-blue-800"     link="/admin/bicycles" sub="Fleet size" />
        <StatCard title="Available Now"        value={stats.availableBicycles} icon={CheckCircle}  gradient="bg-gradient-to-br from-emerald-500 to-teal-700"   link="/admin/bicycles" sub="Ready to ride" />
        <StatCard title="Active Rides"         value={stats.activeRides}       icon={Activity}     gradient="bg-gradient-to-br from-orange-500 to-red-600"      link="/admin/rides"    sub="Live right now" />
        <StatCard title="Registered Students"  value={stats.totalUsers}        icon={Users}        gradient="bg-gradient-to-br from-violet-600 to-purple-800"   link="/admin/users"    sub="All time" />
      </div>

      {/* Fleet utilization bar */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary-400" />
            <span className="text-sm font-semibold text-white">Fleet Utilization</span>
          </div>
          <span className="text-2xl font-bold text-white tabular-nums">{utilizationPct}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              utilizationPct > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              utilizationPct > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-400' :
              'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${utilizationPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>{stats.totalBicycles - stats.availableBicycles} in use</span>
          <span>{stats.availableBicycles} free</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Rides */}
        <div className="lg:col-span-2 bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-white">Recent Rides</h2>
            </div>
            <Link to="/admin/rides" className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-700/50">
            {recentRides.length === 0 ? (
              <div className="px-5 py-10 text-center text-gray-500 text-sm">No rides yet</div>
            ) : recentRides.map((ride) => (
              <div key={ride._id} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-900/60 flex items-center justify-center shrink-0 text-primary-400 font-bold text-xs">
                    {ride.userId?.name?.[0] || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ride.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 truncate">{ride.bikeId?.bicycleName || 'Unknown bike'} · {ride.bikeId?.bikeId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-gray-400 hidden sm:block">{new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    ride.status === 'active'
                      ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {ride.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <QuickAction to="/admin/bicycles" icon={Bike}    label="Manage Bicycles" desc="Add, edit, set maintenance" color="bg-blue-600" />
            <QuickAction to="/admin/stations" icon={MapPin}  label="Manage Stations"  desc="Add / update stations"       color="bg-teal-600" />
            <QuickAction to="/admin/rides"    icon={Activity} label="All Rides"        desc="Monitor live & past rides"  color="bg-orange-600" />
            <QuickAction to="/admin/users"    icon={Users}   label="Users"            desc="View all registered users"  color="bg-violet-600" />
          </div>

          {/* Fleet health mini-summary */}
          <div className="mt-5 pt-4 border-t border-gray-700 space-y-2 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fleet Health</p>
            {[
              { label: 'Available', val: stats.availableBicycles, color: 'bg-emerald-500' },
              { label: 'In Use',    val: stats.totalBicycles - stats.availableBicycles - 0, color: 'bg-orange-500' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-gray-400">{label}</span>
                </div>
                <span className="font-bold text-white">{val}</span>
              </div>
            ))}
          </div>

          {/* Recent Low Ratings Widget */}
          {recentFeedback.length > 0 && (
            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <h3 className="text-sm font-bold text-white">Low-Rated Bikes</h3>
                </div>
              </div>
              <div className="space-y-3">
                {recentFeedback.map(ride => (
                  <div key={ride._id} className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/50">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-semibold text-white">{ride.bikeId?.bicycleName || 'Unknown Bike'}</p>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < ride.rating ? 'fill-current' : 'text-gray-600'}`} />
                        ))}
                      </div>
                    </div>
                    {ride.feedback && (
                      <p className="text-xs text-gray-400 italic bg-gray-800 p-2 rounded-md border border-gray-700">"{ride.feedback}"</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 text-right">- {ride.userId?.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

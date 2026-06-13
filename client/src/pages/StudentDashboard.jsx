import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Bike, Clock, MapPin, Activity, History, Zap, TrendingUp, Trophy, User } from 'lucide-react';
import LiveRideMap from '../components/LiveRideMap';

// Live timer hook
const useLiveTimer = (startTime) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!startTime) return;
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(startTime)) / 1000));
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [startTime]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const ActiveRideCard = ({ ride }) => {
  const timer = useLiveTimer(ride?.startTime);
  const [liveDistance, setLiveDistance] = useState(0);
  const [showMap, setShowMap] = useState(true);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-green-200 dark:border-green-800">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white opacity-10 blur-2xl animate-pulse" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white opacity-10 blur-xl animate-pulse delay-1000" />

        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest text-green-100">Active Ride</span>
            </div>
            <h2 className="text-xl font-bold">{ride.bikeId?.bicycleName}</h2>
            <p className="text-green-100 text-sm mt-1">Started {new Date(ride.startTime).toLocaleTimeString()}</p>
          </div>

          <div className="flex gap-3">
            {/* Live distance */}
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
              <p className="text-xs text-green-100 mb-0.5 font-medium uppercase tracking-wider">Distance</p>
              <p className="text-2xl font-bold tabular-nums">{liveDistance.toFixed(2)} <span className="text-sm font-normal">km</span></p>
            </div>
            {/* Live timer */}
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
              <p className="text-xs text-green-100 mb-0.5 font-medium uppercase tracking-wider">Duration</p>
              <p className="text-2xl font-mono font-bold tabular-nums">{timer}</p>
            </div>
          </div>
        </div>

        <div className="relative mt-4 flex items-center justify-between">
          {ride.destinationStation && (
            <div className="flex items-center gap-1.5 text-green-100 text-sm">
              <MapPin className="w-4 h-4" />
              <span>To: <strong className="text-white">{ride.destinationStation?.stationName || '—'}</strong></span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowMap(m => !m)}
              className="text-xs font-semibold bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors border border-white/30"
            >
              {showMap ? '🗺 Hide Map' : '🗺 Show Map'}
            </button>
            <Link
              to="/student/history"
              className="text-sm font-semibold bg-white text-green-700 hover:bg-green-50 px-4 py-1.5 rounded-lg transition-colors"
            >
              End Ride →
            </Link>
          </div>
        </div>
      </div>

      {/* Live Map */}
      {showMap && (
        <div className="bg-white dark:bg-gray-800">
          <LiveRideMap rideId={ride._id} onDistanceUpdate={setLiveDistance} />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeRide, setActiveRide] = useState(null);
  const [stats, setStats] = useState({
    totalRides: 0,
    totalMinutes: 0,
    ridesThisMonth: 0,
    ecoPoints: 0,
    estimatedKm: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/rides/myrides');
      const current = data.find(r => r.status === 'active');
      setActiveRide(current || null);

      const completed = data.filter(r => r.status === 'completed');
      const totalMinutes = completed.reduce((sum, r) => sum + (r.duration || 0), 0);
      const totalDistanceKm = completed.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
      const now = new Date();
      const ridesThisMonth = completed.filter(r => {
        const d = new Date(r.startTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        totalRides: data.length,
        totalMinutes,
        ridesThisMonth,
        ecoPoints: totalMinutes,
        estimatedKm: Math.round(totalDistanceKm * 100) / 100,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="text-primary-600 dark:text-primary-400">{user?.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.rollNumber} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link
          to="/student/bicycles"
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm hover:shadow-md"
        >
          + Book a Bicycle
        </Link>
      </div>

      {/* Active Ride */}
      {activeRide && <ActiveRideCard ride={activeRide} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Bike}      label="Total Rides"       value={stats.totalRides}      sub="All time"               color="bg-blue-500" />
        <StatCard icon={Clock}     label="Minutes Ridden"    value={stats.totalMinutes}    sub="Completed rides"        color="bg-violet-500" />
        <StatCard icon={TrendingUp} label="Real Distance"    value={`${stats.estimatedKm} km`} sub="GPS tracked"         color="bg-orange-500" />
        <StatCard icon={Zap}       label="Eco Points"        value={stats.ecoPoints}       sub="1 pt per minute"       color="bg-emerald-500" />
      </div>

      {/* This Month */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-pink-100 dark:bg-pink-900/30">
            <Activity className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Rides This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ridesThisMonth}</p>
          </div>
        </div>
        {stats.ecoPoints > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-400 dark:text-gray-500">Your rank</p>
            <Link to="/student/leaderboard" className="text-primary-600 dark:text-primary-400 font-semibold text-sm hover:underline flex items-center justify-end gap-1">
              <Trophy className="w-4 h-4" /> View Leaderboard
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { to: '/student/stations',    Icon: MapPin,  label: 'View Stations',  desc: 'Find nearby bikes' },
            { to: '/student/history',     Icon: History, label: 'My Rides',       desc: 'Manage & end ride' },
            { to: '/student/leaderboard', Icon: Trophy,  label: 'Leaderboard',    desc: 'Campus ranking' },
            { to: '/student/profile',     Icon: User,    label: 'My Profile',     desc: 'Edit your info' },
          ].map(({ to, Icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="group p-4 rounded-xl border dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 flex flex-col items-center text-center transition-all"
            >
              <div className="w-11 h-11 bg-gray-100 dark:bg-gray-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 rounded-full flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

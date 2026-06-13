import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Search, Clock, Bike, User, TrendingUp, Navigation } from 'lucide-react';

const statusConfig = {
  active:    { label: 'Active',    cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  completed: { label: 'Completed', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const AllRides = () => {
  const [rides, setRides]       = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchRides(); }, []);

  useEffect(() => {
    let result = rides;
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.userId?.name?.toLowerCase().includes(q) ||
        r.userId?.rollNumber?.toLowerCase().includes(q) ||
        r.bikeId?.bicycleName?.toLowerCase().includes(q) ||
        r.bikeId?.bikeId?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, rides]);

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides');
      setRides(data);
      setFiltered(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    all:       rides.length,
    active:    rides.filter(r => r.status === 'active').length,
    completed: rides.filter(r => r.status === 'completed').length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
  };

  const totalMinutes = rides.filter(r => r.status === 'completed').reduce((s, r) => s + (r.duration || 0), 0);
  const totalKm      = rides.filter(r => r.status === 'completed').reduce((s, r) => s + (r.distanceKm || 0), 0);

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-orange-400" /> All System Rides
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{rides.length} total rides recorded</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Rides',  value: counts.all,       icon: History,    color: 'text-white' },
          { label: 'Active Now',   value: counts.active,    icon: Clock,      color: 'text-orange-400' },
          { label: 'Total Minutes',value: totalMinutes,     icon: TrendingUp, color: 'text-violet-400' },
          { label: 'Total km (GPS)',value: `${totalKm.toFixed(1)} km`, icon: Navigation, color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 flex items-center gap-3">
            <s.icon className={`w-5 h-5 ${s.color} shrink-0`} />
            <div>
              <p className={`text-xl font-bold ${s.color} tabular-nums`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {['all', 'active', 'completed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
              s === 'all'
                ? 'bg-white/10 text-white border-white/20'
                : s === 'active'
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                : s === 'completed'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            } ${statusFilter === s ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-primary-500' : 'opacity-60 hover:opacity-100'}`}
          >
            {s} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by student name, roll no, or bike…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Table */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-700/30">
                {['Student', 'Bicycle', 'Started', 'Duration', 'Distance', 'Status'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filtered.map((ride) => {
                const cfg = statusConfig[ride.status] || statusConfig.completed;
                return (
                  <tr key={ride._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-900/60 flex items-center justify-center text-primary-400 font-bold text-xs shrink-0">
                          {ride.userId?.name?.[0] || <User className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{ride.userId?.name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{ride.userId?.rollNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-gray-500 shrink-0" />
                        <div>
                          <p className="text-sm text-white">{ride.bikeId?.bicycleName || '—'}</p>
                          <p className="text-xs text-gray-500 font-mono">{ride.bikeId?.bikeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">
                      <p>{new Date(ride.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                      <p className="text-xs">{new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">
                      {ride.duration ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-500" />
                          {ride.duration} min
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {ride.distanceKm > 0 ? (
                        <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                          <Navigation className="w-3.5 h-3.5" />
                          {ride.distanceKm.toFixed(2)} km
                        </div>
                      ) : <span className="text-gray-500">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <History className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No rides found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-700 bg-gray-700/20">
          <p className="text-xs text-gray-400">Showing {filtered.length} of {rides.length} rides</p>
        </div>
      </div>
    </div>
  );
};

export default AllRides;

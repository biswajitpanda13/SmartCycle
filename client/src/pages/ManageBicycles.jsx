import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bike, Plus, Edit, Trash2, X, Search, MapPin, Filter } from 'lucide-react';

const STATUS_CONFIG = {
  available:   { label: 'Available',   cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  booked:      { label: 'Booked',      cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  riding:      { label: 'Riding',      cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  maintenance: { label: 'Maintenance', cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{children}</label>
);

const inputCls = "w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition disabled:opacity-50";
const selectCls = "w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";

const ManageBicycles = () => {
  const [bicycles, setBicycles] = useState([]);
  const [stations, setStations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ bikeId: '', bicycleName: '', station: '', status: 'available' });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    let result = bicycles;
    if (statusFilter !== 'all') result = result.filter(b => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b.bikeId?.toLowerCase().includes(q) ||
        b.bicycleName?.toLowerCase().includes(q) ||
        b.station?.stationName?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [search, statusFilter, bicycles]);

  const fetchData = async () => {
    try {
      const [bikesRes, stationsRes] = await Promise.all([api.get('/bicycles'), api.get('/stations')]);
      setBicycles(bikesRes.data);
      setFiltered(bikesRes.data);
      setStations(stationsRes.data);
      if (stationsRes.data.length > 0) setFormData(prev => ({ ...prev, station: stationsRes.data[0]._id }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (bike = null) => {
    if (bike) {
      setEditingId(bike._id);
      setFormData({
        bikeId: bike.bikeId,
        bicycleName: bike.bicycleName,
        station: bike.station?._id || (stations[0]?._id || ''),
        status: bike.status,
      });
    } else {
      setEditingId(null);
      setFormData({ bikeId: '', bicycleName: '', station: stations[0]?._id || '', status: 'available' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/bicycles/${editingId}`, formData);
      } else {
        await api.post('/bicycles', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving bicycle');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/bicycles/${id}`);
      setDeleteId(null);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.message || 'Error deleting bicycle');
      setDeleteId(null);
    }
  };

  const counts = {
    all:         bicycles.length,
    available:   bicycles.filter(b => b.status === 'available').length,
    riding:      bicycles.filter(b => b.status === 'riding').length,
    maintenance: bicycles.filter(b => b.status === 'maintenance').length,
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bike className="w-6 h-6 text-blue-400" /> Manage Bicycles
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{bicycles.length} bikes · {counts.available} available · {counts.riding} riding · {counts.maintenance} in maintenance</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Bicycle
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all',         label: 'All',         count: counts.all,         cls: 'bg-white/10 text-white border-white/20' },
          { key: 'available',   label: 'Available',   count: counts.available,   cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
          { key: 'riding',      label: 'Riding',      count: counts.riding,      cls: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
          { key: 'maintenance', label: 'Maintenance', count: counts.maintenance, cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
        ].map(chip => (
          <button
            key={chip.key}
            onClick={() => setStatusFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${chip.cls} ${statusFilter === chip.key ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-primary-500' : 'opacity-60 hover:opacity-100'}`}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by bike ID, name, or station…"
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
                {['Bike ID', 'Name / Model', 'Station', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filtered.slice(0, 100).map((bike) => {
                const cfg = STATUS_CONFIG[bike.status] || STATUS_CONFIG.available;
                return (
                  <tr key={bike._id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Bike className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="font-mono text-sm font-semibold text-white">{bike.bikeId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-300">{bike.bicycleName}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-400">
                        <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        {bike.station?.stationName || <span className="text-gray-600 italic">No station</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(bike)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(bike._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">
                    <Bike className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No bicycles found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-700 bg-gray-700/20">
          <p className="text-xs text-gray-400">Showing {Math.min(filtered.length, 100)} of {filtered.length} bikes</p>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal title={editingId ? 'Edit Bicycle' : 'Add New Bicycle'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <FieldLabel>Bike ID (Unique)</FieldLabel>
              <input
                type="text" required disabled={!!editingId} placeholder="e.g. BK-001"
                className={inputCls}
                value={formData.bikeId}
                onChange={e => setFormData({ ...formData, bikeId: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Bicycle Name / Model</FieldLabel>
              <input
                type="text" required placeholder="e.g. Hero Sprint Pro"
                className={inputCls}
                value={formData.bicycleName}
                onChange={e => setFormData({ ...formData, bicycleName: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Assigned Station</FieldLabel>
              <select required className={selectCls} value={formData.station} onChange={e => setFormData({ ...formData, station: e.target.value })}>
                {stations.map(s => <option key={s._id} value={s._id}>{s.stationName}</option>)}
              </select>
            </div>
            {editingId && (
              <div>
                <FieldLabel>Status</FieldLabel>
                <select className={selectCls} value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="riding">Riding</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-xl transition">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Bicycle'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <Modal title="Delete Bicycle?" onClose={() => setDeleteId(null)}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-300">This will permanently remove the bicycle from the fleet.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-700 rounded-xl transition">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition">Delete</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageBicycles;

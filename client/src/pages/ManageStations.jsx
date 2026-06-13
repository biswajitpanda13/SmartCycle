import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, Plus, Edit, Trash2, X, Bike } from 'lucide-react';

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

const inputCls = "w-full px-4 py-2.5 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition";

const ManageStations = () => {
  const [stations, setStations]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData]     = useState({ stationName: '', location: '' });
  const [editingId, setEditingId]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [deleteId, setDeleteId]     = useState(null);

  useEffect(() => { fetchStations(); }, []);

  const fetchStations = async () => {
    try {
      const { data } = await api.get('/stations');
      setStations(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (station = null) => {
    if (station) {
      setEditingId(station._id);
      setFormData({ stationName: station.stationName, location: station.location });
    } else {
      setEditingId(null);
      setFormData({ stationName: '', location: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/stations/${editingId}`, formData);
      } else {
        await api.post('/stations', formData);
      }
      setIsModalOpen(false);
      fetchStations();
    } catch (e) {
      alert(e.response?.data?.message || 'Error saving station');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/stations/${id}`);
      setDeleteId(null);
      fetchStations();
    } catch (e) {
      alert(e.response?.data?.message || 'Error deleting station. Re-assign its bicycles first.');
      setDeleteId(null);
    }
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
            <MapPin className="w-6 h-6 text-teal-400" /> Manage Stations
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{stations.length} stations in the network</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Station
        </button>
      </div>

      {/* Station cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station, idx) => (
          <div
            key={station._id}
            className="group relative bg-gray-800/60 border border-gray-700 hover:border-teal-500/40 rounded-2xl p-5 transition-all hover:shadow-lg hover:shadow-teal-900/20"
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight">{station.stationName}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{station.location}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(station)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(station._id)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-1.5 text-sm">
                <Bike className="w-4 h-4 text-gray-500" />
                <span className="text-white font-bold">{station.availableBikes ?? '—'}</span>
                <span className="text-gray-500">/ {station.totalBikes ?? '—'} bikes</span>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(station.totalBikes || 0, 6) }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${i < (station.availableBikes || 0) ? 'bg-emerald-500' : 'bg-gray-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}

        {stations.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 border border-dashed border-gray-700 rounded-2xl">
            <MapPin className="w-10 h-10 mb-2" />
            <p>No stations yet. Add one to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal title={editingId ? 'Edit Station' : 'Add New Station'} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <FieldLabel>Station Name</FieldLabel>
              <input
                type="text" required placeholder="e.g. Library Gate"
                className={inputCls}
                value={formData.stationName}
                onChange={e => setFormData({ ...formData, stationName: e.target.value })}
              />
            </div>
            <div>
              <FieldLabel>Location Details</FieldLabel>
              <textarea
                required rows={3} placeholder="e.g. Near Block A, Main Campus"
                className={inputCls}
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-60 rounded-xl transition">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Station'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete confirm modal */}
      {deleteId && (
        <Modal title="Delete Station?" onClose={() => setDeleteId(null)}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-300">This will permanently delete the station. Make sure no bicycles are assigned to it first.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-xl transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition">
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ManageStations;

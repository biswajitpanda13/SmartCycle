import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AlertTriangle, CheckCircle, Clock, Bike, User, MapPin } from 'lucide-react';

const ManageIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data } = await api.get('/issues');
      setIssues(data);
    } catch (e) {
      console.error('Error fetching issues:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (issueId) => {
    try {
      const { data } = await api.put(`/issues/${issueId}/resolve`);
      setIssues(issues.map(issue => issue._id === issueId ? data : issue));
    } catch (e) {
      alert(e.response?.data?.message || 'Error resolving issue');
    }
  };

  const pendingIssues = issues.filter(i => i.status === 'pending');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

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
            <AlertTriangle className="w-6 h-6 text-orange-500" /> Issues & Repairs
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {pendingIssues.length} pending • {resolvedIssues.length} resolved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Issues */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" /> Needs Attention
          </h2>
          {pendingIssues.length === 0 ? (
            <div className="bg-gray-800/60 border border-gray-700 border-dashed rounded-2xl p-8 text-center text-gray-500 text-sm">
              No pending issues. All bikes are healthy!
            </div>
          ) : (
            pendingIssues.map(issue => (
              <div key={issue._id} className="bg-gray-800/80 border border-orange-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-orange-500/10 rounded-bl-2xl">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest px-2 py-1">Pending</span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{issue.issueType}</h3>
                    <p className="text-xs text-gray-400">{new Date(issue.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {issue.description && (
                  <div className="mb-4 p-3 bg-gray-900/50 rounded-xl border border-gray-700/50 text-sm text-gray-300">
                    "{issue.description}"
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Bike className="w-4 h-4 text-gray-500" />
                    <span className="text-white font-mono">{issue.bicycle?.bikeId}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300 truncate">{issue.bicycle?.station?.stationName || 'Unknown'}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-2 text-gray-400 border-t border-gray-700/50 pt-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-300">Reported by: {issue.reportedBy?.name} ({issue.reportedBy?.rollNumber})</span>
                  </div>
                </div>

                <button
                  onClick={() => handleResolve(issue._id)}
                  className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Mark as Resolved & Make Bike Available
                </button>
              </div>
            ))
          )}
        </div>

        {/* Resolved Issues */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> Resolved History
          </h2>
          <div className="space-y-3">
            {resolvedIssues.length === 0 ? (
              <div className="bg-gray-800/60 border border-gray-700 border-dashed rounded-2xl p-8 text-center text-gray-500 text-sm">
                No resolved issues yet.
              </div>
            ) : (
              resolvedIssues.map(issue => (
                <div key={issue._id} className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-75 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-200 text-sm">{issue.issueType} on {issue.bicycle?.bikeId}</h4>
                      <p className="text-xs text-gray-500">Reported by {issue.reportedBy?.name}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 sm:text-right">
                    <p>Resolved</p>
                    <p>{new Date(issue.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageIssues;

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { Bike, MapPin, CheckCircle, XCircle, Search, Grid, List as ListIcon, AlertTriangle, X } from 'lucide-react';

const GIRLS_HOSTELS = ["VASUNDHARA", "ARUNDHATI", "ANURADHA", "ROHINI", "VISHAKHA"];
const BOYS_HOSTELS = ["ATRI", "AGASTYA", "PULAHA", "PULASTYA", "VASISTHA", "KRATU", "MARICHI"];

const getStationType = (stationName) => {
  if (!stationName) return 'COMMON';
  const name = stationName.toUpperCase();
  if (GIRLS_HOSTELS.some(h => name.includes(h))) return 'GIRLS';
  if (BOYS_HOSTELS.some(h => name.includes(h))) return 'BOYS';
  return 'COMMON';
};

const getValidDestinations = (sourceStation, allStations) => {
  if (!sourceStation) return allStations;
  const sourceType = getStationType(sourceStation.stationName);
  return allStations.filter(s => {
    if (s._id === sourceStation._id) return false;
    const destType = getStationType(s.stationName);
    if (sourceType === 'BOYS' && destType === 'GIRLS') return false;
    if (sourceType === 'GIRLS' && destType === 'BOYS') return false;
    return true;
  });
};

const BicyclesList = () => {
  const location = useLocation();
  const [bicycles, setBicycles] = useState([]);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [bookingBikeId, setBookingBikeId] = useState(null);
  const [destinationStation, setDestinationStation] = useState('');

  // Report Issue State
  const [reportingBikeId, setReportingBikeId] = useState(null);
  const [issueType, setIssueType] = useState('Flat Tire');
  const [issueDescription, setIssueDescription] = useState('');

  useEffect(() => {
    // Parse query params
    const params = new URLSearchParams(location.search);
    const stationId = params.get('stationId');
    if (stationId) {
      setSelectedStation(stationId);
    }
    fetchInitialData();
  }, [location.search]);

  const fetchInitialData = async () => {
    try {
      const [bikesRes, stationsRes] = await Promise.all([
        api.get('/bicycles'),
        api.get('/stations')
      ]);
      setBicycles(bikesRes.data);
      setStations(stationsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookInit = (bikeId) => {
    setBookingError('');
    setBookingSuccess('');
    setBookingBikeId(bikeId);
    setDestinationStation('');
  };

  const handleConfirmBook = async (bikeId) => {
    setBookingError('');
    setBookingSuccess('');
    try {
      await api.post('/rides/start', { bikeId, destinationStationId: destinationStation });
      setBookingSuccess('Bicycle booked successfully!');
      setBookingBikeId(null);
      fetchInitialData(); // Refresh list
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Error booking bicycle');
      setBookingBikeId(null);
    }
  };

  const handleReportIssueSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    try {
      await api.post('/issues', { bicycleId: reportingBikeId, issueType, description: issueDescription });
      setBookingSuccess('Issue reported successfully. The bike has been flagged for maintenance.');
      setReportingBikeId(null);
      setIssueDescription('');
      setIssueType('Flat Tire');
      fetchInitialData();
    } catch (error) {
      setBookingError(error.response?.data?.message || 'Error reporting issue');
    }
  };

  const filteredBicycles = selectedStation === 'all' 
    ? bicycles.slice(0, 50) 
    : bicycles.filter(bike => bike.station && bike.station._id === selectedStation).slice(0, 50);

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center transition-colors">
          <Bike className="mr-2 text-primary-600 dark:text-primary-500" /> Available Bicycles
        </h1>
        
        <div className="flex flex-col sm:flex-row items-center w-full md:w-auto space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center w-full sm:w-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm transition-colors">
            <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
            <select 
              className="bg-transparent border-none focus:ring-0 text-sm text-gray-700 dark:text-gray-200 w-full outline-none"
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
            >
              <option value="all">All Stations (Showing first 50)</option>
              {stations.map(station => (
                <option key={station._id} value={station._id}>{station.stationName}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-colors self-end sm:self-auto">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors border-l dark:border-gray-700 ${viewMode === 'list' ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {bookingError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 text-red-700 dark:text-red-400 rounded-md transition-colors">
          {bookingError}
        </div>
      )}
      
      {bookingSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 text-green-700 dark:text-green-400 rounded-md transition-colors">
          {bookingSuccess}
        </div>
      )}

      <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" : "flex flex-col space-y-4"}>
        {filteredBicycles.map((bike) => (
          <div key={bike._id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 transition-all hover:shadow-md ${viewMode === 'list' ? 'flex flex-col sm:flex-row items-center p-4' : 'p-5 flex flex-col'}`}>
            <div className={`flex justify-between items-start ${viewMode === 'list' ? 'w-full sm:w-1/3 mb-3 sm:mb-0' : 'mb-3'}`}>
              <div className="bg-primary-50 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-primary-100 dark:border-gray-600 transition-colors">
                <span className="font-mono font-bold text-primary-700 dark:text-primary-400 text-lg">{bike.bikeId}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ml-2 ${
                bike.status === 'available' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400'
              } transition-colors`}>
                {bike.status === 'available' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                {bike.status.charAt(0).toUpperCase() + bike.status.slice(1)}
              </span>
            </div>
            
            <div className={`flex items-start text-gray-600 dark:text-gray-400 text-sm transition-colors ${viewMode === 'list' ? 'flex-1 px-0 sm:px-4 mb-4 sm:mb-0' : 'mb-5 flex-1'}`}>
              <MapPin className="w-4 h-4 mr-1.5 mt-0.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <span className="line-clamp-2">{bike.station ? bike.station.stationName : 'No Station'}</span>
            </div>

            {bookingBikeId === bike._id ? (
              <div className={`flex flex-col space-y-2 ${viewMode === 'list' ? 'w-full sm:w-auto' : 'w-full mt-auto'}`}>
                <select 
                  className="text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md py-1.5 px-2 focus:ring-primary-500 focus:border-primary-500 w-full outline-none"
                  value={destinationStation}
                  onChange={(e) => setDestinationStation(e.target.value)}
                >
                  <option value="" disabled>Select Destination...</option>
                  {getValidDestinations(bike.station, stations).map(s => (
                    <option key={s._id} value={s._id}>{s.stationName}</option>
                  ))}
                </select>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleConfirmBook(bike._id)}
                    disabled={!destinationStation}
                    className="flex-1 py-1.5 px-2 rounded-md font-medium text-sm text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setBookingBikeId(null); setDestinationStation(''); }}
                    className="flex-1 py-1.5 px-2 rounded-md font-medium text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex space-x-2 ${viewMode === 'list' ? 'w-full sm:w-auto flex-shrink-0' : 'w-full mt-auto'}`}>
                <button
                  onClick={() => handleBookInit(bike._id)}
                  disabled={bike.status !== 'available'}
                  className={`flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-colors ${
                    bike.status === 'available' 
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {bike.status === 'available' ? 'Book' : 'Unavailable'}
                </button>
                <button
                  onClick={() => setReportingBikeId(bike._id)}
                  className="py-2 px-3 rounded-lg font-medium text-sm transition-colors bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
                  title="Report Issue"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredBicycles.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed transition-colors">
            <Bike className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p>No bicycles available at this station.</p>
          </div>
        )}
      </div>

      {/* Report Issue Modal */}
      {reportingBikeId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" /> Report Issue
              </h3>
              <button onClick={() => setReportingBikeId(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReportIssueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
                <select 
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={issueType}
                  onChange={e => setIssueType(e.target.value)}
                >
                  <option value="Flat Tire">Flat Tire</option>
                  <option value="Broken Chain">Broken Chain</option>
                  <option value="Brakes">Brakes issue</option>
                  <option value="Seat">Seat adjustment broken</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                <textarea 
                  rows={3} 
                  placeholder="Describe what's broken..."
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setReportingBikeId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-lg shadow-orange-500/30">
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BicyclesList;

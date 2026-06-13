import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Bike, Grid, List as ListIcon, ArrowRight } from 'lucide-react';

const StationsList = () => {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const { data } = await api.get('/stations');
      setStations(data);
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center transition-colors">
          <MapPin className="mr-2 text-primary-600 dark:text-primary-500" /> Campus Stations
        </h1>
        
        <div className="flex bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm transition-colors">
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

      <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col space-y-4"}>
        {stations.map((station) => (
          <div key={station._id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition-all ${viewMode === 'list' ? 'flex flex-col sm:flex-row items-center p-4' : ''}`}>
            {viewMode === 'grid' && <div className="h-2 bg-primary-500"></div>}
            
            <div className={`flex-1 ${viewMode === 'grid' ? 'p-6' : 'px-4 w-full sm:w-auto'}`}>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 transition-colors">{station.stationName}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 transition-colors line-clamp-2">{station.location}</p>
              
              <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors ${viewMode === 'list' ? 'mb-4 sm:mb-0 sm:max-w-xs' : 'mb-4'}`}>
                <div className="flex items-center">
                  <Bike className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available Bikes</span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {station.availableBikes || 0} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/ {station.totalBikes}</span>
                </span>
              </div>
            </div>

            <div className={`${viewMode === 'grid' ? 'px-6 pb-6' : 'px-4 w-full sm:w-auto flex-shrink-0'}`}>
              <Link 
                to={`/student/bicycles?stationId=${station._id}`}
                className="flex items-center justify-center w-full sm:w-auto py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                View Bicycles <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}

        {stations.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 border-dashed">
            No stations found in the system.
          </div>
        )}
      </div>
    </div>
  );
};

export default StationsList;

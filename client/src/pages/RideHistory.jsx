import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Clock, MapPin, CheckCircle, Star, X } from 'lucide-react';

const RideHistory = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);
  const [returnStation, setReturnStation] = useState('');
  const [endingRide, setEndingRide] = useState(null);
  
  // Rating State
  const [ratingModalRideId, setRatingModalRideId] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchRides();
    fetchStations();
  }, []);

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides/myrides');
      setRides(data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const { data } = await api.get('/stations');
      setStations(data);
      if (data.length > 0) setReturnStation(data[0]._id);
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const handleEndRide = async (rideId) => {
    try {
      await api.post('/rides/end', { rideId, returnStationId: returnStation });
      setEndingRide(null);
      fetchRides();
      // Automatically open rating modal for this ride
      setRatingModalRideId(rideId);
      setRating(5);
      setFeedback('');
    } catch (error) {
      alert(error.response?.data?.message || 'Error ending ride');
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/rides/${ratingModalRideId}/rate`, { rating, feedback });
      setRatingModalRideId(null);
      fetchRides();
    } catch (error) {
      alert(error.response?.data?.message || 'Error submitting rating');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center transition-colors">
        <History className="mr-2 text-primary-600 dark:text-primary-500" /> My Ride History
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bicycle</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Distance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {rides.map((ride) => (
                <tr key={ride._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{ride.bikeId?.bicycleName || 'Unknown Bike'}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{ride.bikeId?.bikeId}</div>
                    {ride.destinationStation && (
                      <div className="text-xs text-primary-600 dark:text-primary-400 flex items-center">
                        <MapPin className="w-3 h-3 mr-0.5" /> To: {ride.destinationStation.stationName}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(ride.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {ride.endTime ? new Date(ride.endTime).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {ride.duration !== undefined && ride.duration !== null ? `${ride.duration} min` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {ride.status === 'completed' && ride.distanceKm > 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{ride.distanceKm.toFixed(2)} km</span>
                    ) : ride.status === 'active' ? (
                      <span className="text-yellow-500 text-xs">In progress…</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full transition-colors ${
                      ride.status === 'active' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    }`}>
                      {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                    </span>
                    {ride.status === 'completed' && ride.rating && (
                      <div className="flex items-center mt-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < ride.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {ride.status === 'active' && (
                      endingRide === ride._id ? (
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border dark:border-gray-600">
                            <span className="text-sm text-gray-600 dark:text-gray-300 mr-2 flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-primary-500" />
                              Return to: <strong className="ml-1 text-gray-900 dark:text-white">{ride.bikeId?.station?.stationName || 'Default Station'}</strong>
                            </span>
                            <div className="flex space-x-2">
                              <button onClick={() => handleEndRide(ride._id)} className="text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-md transition-colors text-sm font-medium">Confirm Return</button>
                              <button onClick={() => setEndingRide(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm px-2">Cancel</button>
                            </div>
                          </div>
                      ) : (
                        <button 
                          onClick={() => setEndingRide(ride._id)} 
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full font-medium transition-colors"
                        >
                          End Ride
                        </button>
                      )
                    )}
                    {ride.status === 'completed' && !ride.rating && (
                      <button 
                        onClick={() => { setRatingModalRideId(ride._id); setRating(5); setFeedback(''); }}
                        className="text-yellow-600 dark:text-yellow-500 hover:text-yellow-800 dark:hover:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full font-medium transition-colors text-xs flex items-center justify-end ml-auto gap-1"
                      >
                        <Star className="w-3 h-3" /> Rate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rides.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <History className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-3" />
                      <p>You haven't taken any rides yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rating Modal */}
      {ratingModalRideId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-current" /> Rate Your Ride
              </h3>
              <button onClick={() => setRatingModalRideId(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitRating} className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">How was your bicycle?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-10 h-10 ${rating >= star ? 'text-yellow-400 fill-current' : 'text-gray-200 dark:text-gray-700'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Feedback (Optional)</label>
                <textarea 
                  rows={3} 
                  placeholder={rating <= 3 ? "What went wrong? (e.g. Squeaky brakes, flat tire)" : "Any comments?"}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none transition-shadow"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="submit" className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl transition shadow-lg shadow-yellow-500/30">
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideHistory;

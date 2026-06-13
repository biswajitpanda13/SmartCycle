import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Trophy, Zap, Bike, Clock, Medal } from 'lucide-react';

const MEDAL_COLORS = ['text-yellow-500', 'text-gray-400', 'text-amber-600'];
const MEDAL_BG    = ['bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800', 
                     'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600', 
                     'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'];

const Leaderboard = () => {
  const { user } = useContext(AuthContext);
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await api.get('/rides/leaderboard');
      setBoard(data);
      const rank = data.findIndex(e => e.userId === user._id);
      setMyRank(rank >= 0 ? rank + 1 : null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
    </div>
  );

  const top3 = board.slice(0, 3);
  const rest  = board.slice(3);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg mb-3">
          <Trophy className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Leaderboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Eco Points = minutes cycled · 1 pt per minute</p>
        {myRank && (
          <span className="mt-2 inline-block bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-sm font-semibold px-3 py-1 rounded-full">
            Your rank: #{myRank}
          </span>
        )}
      </div>

      {/* Podium — top 3 */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 px-4 pb-2">
          {/* 2nd place */}
          {top3[1] && (
            <div className="flex flex-col items-center flex-1">
              <div className={`w-full rounded-t-xl border-2 ${MEDAL_BG[1]} p-3 text-center`}>
                <Medal className={`w-6 h-6 mx-auto mb-1 ${MEDAL_COLORS[1]}`} />
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{top3[1].name.split(' ')[0]}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{top3[1].rollNumber}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{top3[1].ecoPoints} <span className="text-xs font-normal">pts</span></p>
              </div>
              <div className="w-full h-16 bg-gray-200 dark:bg-gray-600 rounded-b-sm flex items-center justify-center">
                <span className="text-2xl font-black text-gray-400 dark:text-gray-400">2</span>
              </div>
            </div>
          )}
          {/* 1st place */}
          {top3[0] && (
            <div className="flex flex-col items-center flex-1">
              <div className={`w-full rounded-t-xl border-2 ${MEDAL_BG[0]} p-4 text-center shadow-md`}>
                <Medal className={`w-8 h-8 mx-auto mb-1 ${MEDAL_COLORS[0]}`} />
                <p className="font-bold text-gray-900 dark:text-white truncate">{top3[0].name.split(' ')[0]}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{top3[0].rollNumber}</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">{top3[0].ecoPoints} <span className="text-xs font-normal">pts</span></p>
              </div>
              <div className="w-full h-24 bg-yellow-400 dark:bg-yellow-600 rounded-b-sm flex items-center justify-center">
                <span className="text-3xl font-black text-yellow-800 dark:text-yellow-200">1</span>
              </div>
            </div>
          )}
          {/* 3rd place */}
          {top3[2] && (
            <div className="flex flex-col items-center flex-1">
              <div className={`w-full rounded-t-xl border-2 ${MEDAL_BG[2]} p-3 text-center`}>
                <Medal className={`w-6 h-6 mx-auto mb-1 ${MEDAL_COLORS[2]}`} />
                <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{top3[2].name.split(' ')[0]}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{top3[2].rollNumber}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white mt-1">{top3[2].ecoPoints} <span className="text-xs font-normal">pts</span></p>
              </div>
              <div className="w-full h-10 bg-amber-600 dark:bg-amber-700 rounded-b-sm flex items-center justify-center">
                <span className="text-xl font-black text-amber-200">3</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full list */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <span className="col-span-1">#</span>
          <span className="col-span-5">Student</span>
          <span className="col-span-2 text-center">Rides</span>
          <span className="col-span-2 text-center">Min</span>
          <span className="col-span-2 text-right">Pts</span>
        </div>
        <ul className="divide-y dark:divide-gray-700">
          {board.map((entry, i) => {
            const isMe = entry.userId === user._id;
            return (
              <li
                key={entry.userId}
                className={`px-5 py-3.5 grid grid-cols-12 gap-2 items-center transition-colors ${
                  isMe
                    ? 'bg-primary-50 dark:bg-primary-900/20 font-semibold'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <span className={`col-span-1 text-sm font-bold ${i < 3 ? MEDAL_COLORS[i] : 'text-gray-400 dark:text-gray-500'}`}>
                  {i + 1}
                </span>
                <div className="col-span-5">
                  <p className={`text-sm ${isMe ? 'text-primary-700 dark:text-primary-300' : 'text-gray-900 dark:text-white'}`}>
                    {entry.name} {isMe && <span className="text-xs">(You)</span>}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{entry.rollNumber}</p>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                  <Bike className="w-3.5 h-3.5 text-gray-400" />
                  {entry.totalRides}
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {entry.totalMinutes}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{entry.ecoPoints}</span>
                </div>
              </li>
            );
          })}
          {board.length === 0 && (
            <li className="px-5 py-12 text-center text-gray-400 dark:text-gray-500">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No rides completed yet. Be the first on the board!</p>
            </li>
          )}
        </ul>
      </div>

      {/* Legend */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500">
        🌿 Every minute you cycle = 1 Eco Point. Keep riding to climb the ranks!
      </p>
    </div>
  );
};

export default Leaderboard;

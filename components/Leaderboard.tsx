import React, { useEffect, useState } from 'react';
import { LeaderboardEntry } from '../types';
import { getLeaderboard } from '../services/leaderboardService';

interface LeaderboardProps {
  refreshTrigger: number; // Increment to force reload
}

const Leaderboard: React.FC<LeaderboardProps> = ({ refreshTrigger }) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setScores(getLeaderboard());
  }, [refreshTrigger]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 bg-slate-800/80 rounded-xl p-6 border border-slate-700 backdrop-blur">
      <h3 className="text-2xl font-display text-cyan-400 text-center mb-6 border-b border-slate-600 pb-2">
        Hall of Fame
      </h3>
      
      {scores.length === 0 ? (
        <p className="text-center text-slate-500 italic">No records yet. Be the first!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Rank</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3 rounded-tr-lg">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {scores.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-500 font-bold">#{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-white">{entry.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${entry.mode === '1P' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>
                        {entry.mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-yellow-400">{entry.score.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">{entry.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
import { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'tetris_duel_leaderboard';

export const getLeaderboard = (): LeaderboardEntry[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse leaderboard", e);
    return [];
  }
};

export const saveScore = (name: string, score: number, mode: '1P' | '2P') => {
  const current = getLeaderboard();
  const entry: LeaderboardEntry = {
    name,
    score,
    mode,
    date: new Date().toLocaleDateString(),
  };
  
  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Keep top 10

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
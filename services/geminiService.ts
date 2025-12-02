
// Simulating AI behavior locally to remove API Key dependency

const LOW_SCORE_COMMENTS = [
  "Gravity check: Passed. Survival check: Failed.",
  "Just warming up the fingers, right?",
  "A little rocky, but I see potential!",
  "The blocks were just falling too fast.",
  "Oof! That tower got high quickly.",
  "Tactical reset? I like it.",
];

const MEDIUM_SCORE_COMMENTS = [
  "Solid performance! Keep stacking.",
  "Not bad! You're getting into the flow.",
  "Clean lines, decent speed. Good game.",
  "Respectable score! The rhythm is there.",
  "Nice hustle! aiming for a new high score?",
];

const HIGH_SCORE_COMMENTS = [
  "ABSOLUTELY GODLIKE!",
  "Are you a machine? Incredible speed!",
  "Tetris Master class in session!",
  "The blocks obey your command!",
  "Galaxy brain plays right there.",
  "New dimension reached! Amazing!",
];

export const getGameSummary = async (score: number, lines: number, mode: string): Promise<string> => {
  // Simulate a short "thinking" delay
  await new Promise(resolve => setTimeout(resolve, 600));

  let pool = MEDIUM_SCORE_COMMENTS;

  if (score < 1000) {
    pool = LOW_SCORE_COMMENTS;
  } else if (score > 5000) {
    pool = HIGH_SCORE_COMMENTS;
  }

  // Pick a random comment
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};

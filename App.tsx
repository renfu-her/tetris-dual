
import React, { useState, useEffect, useCallback } from 'react';
import { useTetris } from './hooks/useTetris';
import TetrisBoard from './components/TetrisBoard';
import { NextPiece } from './components/NextPiece';
import Leaderboard from './components/Leaderboard';
import { INPUT_P1, INPUT_P2 } from './constants';
import { saveScore } from './services/leaderboardService';
import { getGameSummary } from './services/geminiService';

const App: React.FC = () => {
  const [mode, setMode] = useState<'MENU' | '1P' | '2P'>('MENU');
  const [isPlaying, setIsPlaying] = useState(false);
  const [refreshScores, setRefreshScores] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [aiComment, setAiComment] = useState<string | null>(null);
  
  // Game Over handling state
  const [gameOverStats, setGameOverStats] = useState<{p1: {score: number, lines: number} | null, p2: {score: number, lines: number} | null}>({ p1: null, p2: null });

  const handleGameOverP1 = useCallback((score: number, lines: number) => {
    setGameOverStats(prev => ({ ...prev, p1: { score, lines } }));
  }, []);

  const handleGameOverP2 = useCallback((score: number, lines: number) => {
    setGameOverStats(prev => ({ ...prev, p2: { score, lines } }));
  }, []);

  const game1 = useTetris({ 
    isPlaying: isPlaying && mode !== 'MENU', 
    inputMap: INPUT_P1, 
    onGameOver: handleGameOverP1 
  });
  
  const game2 = useTetris({ 
    isPlaying: isPlaying && mode === '2P', 
    inputMap: INPUT_P2, 
    onGameOver: handleGameOverP2 
  });

  // Start Game
  const startGame = useCallback((selectedMode: '1P' | '2P') => {
    setMode(selectedMode);
    game1.reset();
    game2.reset();
    setGameOverStats({ p1: null, p2: null });
    setWinner(null);
    setAiComment(null);
    setIsPlaying(true);
  }, [game1, game2]); // game1.reset and game2.reset are stable or we depend on the object

  // Global Reset Hotkey (Alt + R)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.code === 'KeyR')) {
        e.preventDefault();
        if (mode !== 'MENU') {
           startGame(mode);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [mode, startGame]);

  // Check Game Over Conditions
  useEffect(() => {
    if (!isPlaying) return;

    if (mode === '1P') {
      if (game1.gameOver) {
        setIsPlaying(false);
        handleEndGame('Player 1', game1.score, '1P', game1.lines);
      }
    } else if (mode === '2P') {
        if (game1.gameOver && !game2.gameOver) {
            setIsPlaying(false);
            setWinner("Player 2 Wins!");
            handleEndGame('Player 1', game1.score, '2P', game1.lines, false); // Loser
            handleEndGame('Player 2', game2.score, '2P', game2.lines, true); // Winner
        } else if (game2.gameOver && !game1.gameOver) {
            setIsPlaying(false);
            setWinner("Player 1 Wins!");
            handleEndGame('Player 2', game2.score, '2P', game2.lines, false);
            handleEndGame('Player 1', game1.score, '1P', game1.lines, true);
        } else if (game1.gameOver && game2.gameOver) {
            setIsPlaying(false);
            setWinner(game1.score > game2.score ? "Player 1 Wins (Score)!" : "Player 2 Wins (Score)!");
            handleEndGame('Player 1', game1.score, '2P', game1.lines);
            handleEndGame('Player 2', game2.score, '2P', game2.lines);
        }
    }
  }, [isPlaying, mode, game1.gameOver, game2.gameOver, game1.score, game2.score, game1.lines, game2.lines]);

  const handleEndGame = async (name: string, score: number, gameMode: '1P'|'2P', lines: number, isWinner: boolean = true) => {
     setTimeout(async () => {
         const playerName = isWinner ? prompt(`Game Over! Enter name for ${name} (Score: ${score}):`, name) : null;
         
         if (playerName) {
             saveScore(playerName, score, gameMode);
             setRefreshScores(prev => prev + 1);
             // Scroll to leaderboard
             setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
             }, 300);
         }

         if (gameMode === '1P') {
             const comment = await getGameSummary(score, lines, gameMode);
             setAiComment(comment);
         }
     }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-slate-900 text-white p-4">
      
      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-end mb-8 border-b border-slate-700 pb-4">
        <div>
           <h1 className="text-2xl md:text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-lg">
            NEON TETRIS
          </h1>
          <p className="text-slate-400 text-sm mt-1 tracking-wider">
            {mode === '2P' ? 'DUEL MODE' : 'SOLO MODE'}
          </p>
        </div>
        
        {mode !== 'MENU' && (
          <div className="flex flex-col items-end gap-2">
            <span className="text-xs text-slate-500 font-mono">Press 'Alt + R' to Restart</span>
            <button 
              onClick={() => { setIsPlaying(false); setMode('MENU'); }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold transition"
            >
              QUIT GAME
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl flex flex-col items-center">
        
        {/* Menu Screen */}
        {mode === 'MENU' && (
          <div className="flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <div className="p-8 bg-slate-800 rounded-2xl border border-slate-600 shadow-2xl text-center">
              <h2 className="text-2xl mb-6 font-bold text-cyan-300">SELECT MODE</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => startGame('1P')}
                  className="group relative px-8 py-4 bg-slate-700 hover:bg-cyan-600 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <span className="relative z-10 font-display font-bold text-xl">1 PLAYER</span>
                  <div className="absolute inset-0 bg-cyan-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
                <button 
                   onClick={() => startGame('2P')}
                   className="group relative px-8 py-4 bg-slate-700 hover:bg-purple-600 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <span className="relative z-10 font-display font-bold text-xl">2 PLAYERS</span>
                  <div className="absolute inset-0 bg-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
              </div>
              <p className="mt-6 text-xs text-slate-500 max-w-xs mx-auto">
                P1: WASD + Space<br/>P2: Arrows + Enter<br/>Score high by dropping fast!
              </p>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {mode !== 'MENU' && (
          <div className="flex flex-col items-center gap-8 w-full">
            
            {/* Winner Announcement */}
            {winner && (
                <div className="text-4xl font-display font-bold text-yellow-400 animate-bounce mb-4">
                    {winner}
                </div>
            )}
            
            {/* AI Comment */}
            {aiComment && (
                 <div className="bg-gradient-to-r from-blue-900 to-slate-900 border border-blue-500 p-4 rounded-lg max-w-lg text-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <p className="text-xs text-blue-300 uppercase font-bold mb-1">AI Analyst</p>
                    <p className="italic text-white">"{aiComment}"</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-12 items-start justify-center">
              
              {/* Player 1 */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end px-2">
                   <h2 className="text-cyan-400 font-bold font-display text-xl">PLAYER 1</h2>
                   <div className="text-right">
                      <p className="text-xs text-slate-400">SCORE</p>
                      <p className="text-2xl font-mono text-white">{game1.score}</p>
                   </div>
                </div>
                
                <div className="flex gap-4">
                    <TetrisBoard 
                        grid={game1.grid} 
                        activePiece={game1.activePiece} 
                        playerId={1} 
                        gameOver={game1.gameOver} 
                    />
                    <div className="flex flex-col justify-between py-2">
                        <NextPiece piece={game1.nextPiece} />
                        <div className="bg-slate-800 p-3 rounded border border-slate-700">
                            <p className="text-xs text-slate-400">LINES</p>
                            <p className="text-xl font-mono">{game1.lines}</p>
                            <p className="text-xs text-slate-400 mt-2">LEVEL</p>
                            <p className="text-xl font-mono text-yellow-500">{game1.level}</p>
                        </div>
                    </div>
                </div>
              </div>

              {/* Player 2 */}
              {mode === '2P' && (
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end px-2">
                        <h2 className="text-purple-400 font-bold font-display text-xl">PLAYER 2</h2>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">SCORE</p>
                            <p className="text-2xl font-mono text-white">{game2.score}</p>
                        </div>
                    </div>

                    <div className="flex gap-4 flex-row-reverse md:flex-row">
                        <TetrisBoard 
                            grid={game2.grid} 
                            activePiece={game2.activePiece} 
                            playerId={2} 
                            gameOver={game2.gameOver} 
                        />
                         <div className="flex flex-col justify-between py-2">
                            <NextPiece piece={game2.nextPiece} />
                            <div className="bg-slate-800 p-3 rounded border border-slate-700">
                                <p className="text-xs text-slate-400">LINES</p>
                                <p className="text-xl font-mono">{game2.lines}</p>
                                <p className="text-xs text-slate-400 mt-2">LEVEL</p>
                                <p className="text-xl font-mono text-yellow-500">{game2.level}</p>
                            </div>
                        </div>
                    </div>
                </div>
              )}
            </div>
            
            {/* Controls Helper - INCREASED FONT SIZE */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-slate-400 mt-8 max-w-4xl w-full">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <p className="font-bold text-cyan-400 mb-2">P1 Controls</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><span className="text-white font-mono">W, A, S, D</span> to Move/Rotate</li>
                      <li><span className="text-white font-mono">Space</span> to Hard Drop</li>
                    </ul>
                </div>
                {mode === '2P' && (
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <p className="font-bold text-purple-400 mb-2">P2 Controls</p>
                         <ul className="list-disc pl-5 space-y-1">
                          <li><span className="text-white font-mono">Arrow Keys</span> to Move/Rotate</li>
                          <li><span className="text-white font-mono">Enter</span> to Hard Drop</li>
                        </ul>
                    </div>
                )}
            </div>
          </div>
        )}

        {/* Leaderboard - Always visible but pushed down */}
        <Leaderboard refreshTrigger={refreshScores} />

      </main>
    </div>
  );
};

export default App;

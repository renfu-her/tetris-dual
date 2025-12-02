
import React from 'react';
import { Grid, Tetromino, TetrominoType } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH, COLORS } from '../constants';

interface TetrisBoardProps {
  grid: Grid;
  activePiece: { pos: { x: number; y: number }; tetromino: Tetromino } | null;
  playerId: number;
  gameOver: boolean;
}

const TetrisBoard: React.FC<TetrisBoardProps> = ({ grid, activePiece, playerId, gameOver }) => {
  // Combine static grid and active piece for rendering
  const renderGrid = grid.map(row => row.map(cell => cell.type));

  if (activePiece) {
    const { pos, tetromino } = activePiece;
    tetromino.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          const gridY = pos.y + y;
          const gridX = pos.x + x;
          if (gridY >= 0 && gridY < BOARD_HEIGHT && gridX >= 0 && gridX < BOARD_WIDTH) {
            renderGrid[gridY][gridX] = tetromino.type;
          }
        }
      });
    });
  }

  return (
    <div className="relative p-1 bg-slate-800 border-4 border-slate-700 rounded-lg shadow-2xl">
      {gameOver && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded">
          <h2 className="text-4xl font-display text-red-500 animate-pulse font-bold mb-2">GAME OVER</h2>
          <p className="text-slate-300">Player {playerId}</p>
        </div>
      )}
      
      <div 
        className="grid gap-[1px] bg-slate-900"
        style={{
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${BOARD_HEIGHT}, minmax(0, 1fr))`,
          width: '300px', // Increased from 250px
          height: '600px', // Increased from 500px
        }}
      >
        {renderGrid.map((row, y) =>
          row.map((type, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-full h-full transition-colors duration-75 rounded-sm ${
                type ? COLORS[type] : 'bg-slate-900/50'
              }`}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TetrisBoard;

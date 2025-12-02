import React from 'react';
import { Tetromino } from '../types';
import { COLORS } from '../constants';

interface NextPieceProps {
  piece: Tetromino;
}

export const NextPiece: React.FC<NextPieceProps> = ({ piece }) => {
  return (
    <div className="bg-slate-800 p-4 rounded-lg border-2 border-slate-700 w-32 h-32 flex flex-col items-center justify-center">
      <h3 className="text-slate-400 text-xs uppercase font-bold mb-2 tracking-widest">Next</h3>
      <div className="grid gap-1" style={{ 
          gridTemplateColumns: `repeat(${piece.shape[0].length}, 1fr)` 
        }}>
        {piece.shape.map((row, y) =>
          row.map((val, x) => (
            val ? (
               <div key={`${y}-${x}`} className={`w-4 h-4 ${COLORS[piece.type]}`} />
            ) : <div key={`${y}-${x}`} className="w-4 h-4" />
          ))
        )}
      </div>
    </div>
  );
};
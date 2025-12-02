import { Tetromino, TetrominoType, PlayerInput } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const INITIAL_TICK_RATE = 800;
export const MIN_TICK_RATE = 100;

export const TETROMINOES: Record<TetrominoType, Tetromino> = {
  [TetrominoType.I]: {
    type: TetrominoType.I,
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
  },
  [TetrominoType.J]: {
    type: TetrominoType.J,
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  [TetrominoType.L]: {
    type: TetrominoType.L,
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  [TetrominoType.O]: {
    type: TetrominoType.O,
    shape: [
      [1, 1],
      [1, 1],
    ],
  },
  [TetrominoType.S]: {
    type: TetrominoType.S,
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
  },
  [TetrominoType.T]: {
    type: TetrominoType.T,
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
  },
  [TetrominoType.Z]: {
    type: TetrominoType.Z,
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
  },
};

export const COLORS: Record<TetrominoType, string> = {
  [TetrominoType.I]: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]',
  [TetrominoType.J]: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]',
  [TetrominoType.L]: 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.7)]',
  [TetrominoType.O]: 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]',
  [TetrominoType.S]: 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.7)]',
  [TetrominoType.T]: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.7)]',
  [TetrominoType.Z]: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.7)]',
};

export const INPUT_P1: PlayerInput = {
  moveLeft: ['KeyA'],
  moveRight: ['KeyD'],
  rotate: ['KeyW'],
  softDrop: ['KeyS'],
  hardDrop: ['Space'],
};

export const INPUT_P2: PlayerInput = {
  moveLeft: ['ArrowLeft'],
  moveRight: ['ArrowRight'],
  rotate: ['ArrowUp'],
  softDrop: ['ArrowDown'],
  hardDrop: ['Enter', 'NumpadEnter'],
};

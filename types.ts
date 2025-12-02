export enum TetrominoType {
  I = 'I',
  J = 'J',
  L = 'L',
  O = 'O',
  S = 'S',
  T = 'T',
  Z = 'Z',
}

export type GridCell = {
  type: TetrominoType | null;
  locked: boolean;
};

export type Grid = GridCell[][];

export interface PlayerInput {
  moveLeft: string[];
  moveRight: string[];
  rotate: string[];
  softDrop: string[];
  hardDrop: string[];
}

export interface Tetromino {
  shape: number[][];
  type: TetrominoType;
}

export interface GameState {
  score: number;
  level: number;
  lines: number;
  gameOver: boolean;
  isPaused: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  mode: '1P' | '2P';
}
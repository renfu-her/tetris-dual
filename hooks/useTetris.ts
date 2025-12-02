import { useState, useEffect, useCallback, useRef } from 'react';
import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINOES, INITIAL_TICK_RATE, MIN_TICK_RATE } from '../constants';
import { Grid, TetrominoType, Tetromino, GridCell, PlayerInput } from '../types';

const createEmptyGrid = (): Grid =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => ({ type: null, locked: false }))
  );

const getRandomTetromino = (): Tetromino => {
  const types = Object.values(TetrominoType);
  const type = types[Math.floor(Math.random() * types.length)];
  return TETROMINOES[type];
};

interface UseTetrisProps {
  isPlaying: boolean;
  inputMap: PlayerInput;
  onGameOver: (score: number, lines: number) => void;
}

export const useTetris = ({ isPlaying, inputMap, onGameOver }: UseTetrisProps) => {
  const [grid, setGrid] = useState<Grid>(createEmptyGrid());
  const [activePiece, setActivePiece] = useState<{
    pos: { x: number; y: number };
    tetromino: Tetromino;
  } | null>(null);
  
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [nextPiece, setNextPiece] = useState<Tetromino>(getRandomTetromino());

  const gridRef = useRef(grid);
  const activePieceRef = useRef(activePiece);
  const isPlayingRef = useRef(isPlaying);
  const gameOverRef = useRef(gameOver);
  const tickRateRef = useRef(INITIAL_TICK_RATE);

  // Sync refs
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { activePieceRef.current = activePiece; }, [activePiece]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  // Check collision
  const checkCollision = useCallback((
    pos: { x: number; y: number },
    shape: number[][],
    gridCheck: Grid
  ) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newY = y + pos.y;
          const newX = x + pos.x;

          // Boundaries
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT
          ) {
            return true;
          }

          // Locked cells
          // Only check if inside vertical bounds (blocks can spawn slightly above)
          if (newY >= 0 && gridCheck[newY][newX].locked) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const spawnPiece = useCallback(() => {
    const piece = nextPiece;
    setNextPiece(getRandomTetromino());
    
    // Center spawn
    const startPos = { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2), y: 0 };
    
    if (checkCollision(startPos, piece.shape, gridRef.current)) {
      setGameOver(true);
      onGameOver(score, lines);
    } else {
      setActivePiece({ pos: startPos, tetromino: piece });
    }
  }, [nextPiece, checkCollision, onGameOver, score, lines]);

  const lockPiece = useCallback(() => {
    if (!activePieceRef.current) return;
    const { pos, tetromino } = activePieceRef.current;
    const newGrid = gridRef.current.map(row => row.map(cell => ({ ...cell })));

    // Lock it
    tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value) {
          const newY = y + pos.y;
          const newX = x + pos.x;
          if (newY >= 0 && newY < BOARD_HEIGHT && newX >= 0 && newX < BOARD_WIDTH) {
            newGrid[newY][newX] = { type: tetromino.type, locked: true };
          }
        }
      });
    });

    // Check lines
    let linesCleared = 0;
    const finalGrid = newGrid.reduce((acc, row) => {
      if (row.every(cell => cell.locked)) {
        linesCleared++;
        acc.unshift(Array.from({ length: BOARD_WIDTH }, () => ({ type: null, locked: false })));
      } else {
        acc.push(row);
      }
      return acc;
    }, [] as Grid);

    setGrid(finalGrid);
    
    if (linesCleared > 0) {
      const linePoints = [0, 40, 100, 300, 1200];
      const points = linePoints[linesCleared] * level;
      setScore(prev => prev + points);
      setLines(prev => {
        const newLines = prev + linesCleared;
        const newLevel = Math.floor(newLines / 10) + 1;
        if (newLevel !== level) {
          setLevel(newLevel);
          tickRateRef.current = Math.max(MIN_TICK_RATE, INITIAL_TICK_RATE - (newLevel - 1) * 50);
        }
        return newLines;
      });
    }

    spawnPiece();
  }, [level, spawnPiece, checkCollision]);

  // Movement Functions
  const move = useCallback((dirX: number, dirY: number) => {
    if (gameOverRef.current || !isPlayingRef.current || !activePieceRef.current) return false;

    const { pos, tetromino } = activePieceRef.current;
    const newPos = { x: pos.x + dirX, y: pos.y + dirY };

    if (!checkCollision(newPos, tetromino.shape, gridRef.current)) {
      setActivePiece({ pos: newPos, tetromino });
      return true;
    }
    
    // If moving down and hit something, lock
    if (dirY > 0) {
      lockPiece();
    }
    return false;
  }, [checkCollision, lockPiece]);

  const rotate = useCallback(() => {
    if (gameOverRef.current || !isPlayingRef.current || !activePieceRef.current) return;
    
    const { pos, tetromino } = activePieceRef.current;
    
    // Matrix rotation
    const rotatedShape = tetromino.shape[0].map((_, index) =>
      tetromino.shape.map(row => row[index]).reverse()
    );

    // Wall kicks (simple)
    const kicks = [0, -1, 1, -2, 2];
    for (let kick of kicks) {
      if (!checkCollision({ x: pos.x + kick, y: pos.y }, rotatedShape, gridRef.current)) {
        setActivePiece({
          pos: { x: pos.x + kick, y: pos.y },
          tetromino: { ...tetromino, shape: rotatedShape }
        });
        return;
      }
    }
  }, [checkCollision]);

  const hardDrop = useCallback(() => {
    if (gameOverRef.current || !isPlayingRef.current || !activePieceRef.current) return;
    
    let dropDist = 0;
    let currentPos = activePieceRef.current.pos;
    const shape = activePieceRef.current.tetromino.shape;

    // Calculate max drop distance
    while (!checkCollision({ x: currentPos.x, y: currentPos.y + 1 }, shape, gridRef.current)) {
      currentPos = { x: currentPos.x, y: currentPos.y + 1 };
      dropDist++;
    }

    setScore(s => s + (dropDist * 2)); // 2 points per cell for hard drop
    setActivePiece(prev => prev ? { ...prev, pos: currentPos } : null);
    
    // Force immediate lock in next tick or manually call lock logic
    // But we need to update state first to show it at bottom. 
    // We will cheat slightly and call lockPiece directly after a microtask to let render happen? 
    // Actually, calling lockPiece immediately updates the grid state, so it's fine.
    
    // Update ref manually for lockPiece to see new pos immediately
    activePieceRef.current = { ...activePieceRef.current!, pos: currentPos };
    lockPiece();

  }, [checkCollision, lockPiece]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;
    if (!activePiece && !gameOver) {
      spawnPiece();
    }

    const interval = setInterval(() => {
      move(0, 1);
    }, tickRateRef.current);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, activePiece, spawnPiece, move]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || gameOver) return;

      if (inputMap.moveLeft.includes(e.code)) move(-1, 0);
      else if (inputMap.moveRight.includes(e.code)) move(1, 0);
      else if (inputMap.softDrop.includes(e.code)) {
        if (move(0, 1)) setScore(s => s + 1); // 1 point for soft drop
      }
      else if (inputMap.rotate.includes(e.code)) rotate();
      else if (inputMap.hardDrop.includes(e.code)) hardDrop();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver, inputMap, move, rotate, hardDrop]);

  const reset = () => {
    setGrid(createEmptyGrid());
    setScore(0);
    setLines(0);
    setLevel(1);
    setGameOver(false);
    setActivePiece(null);
    setNextPiece(getRandomTetromino());
    tickRateRef.current = INITIAL_TICK_RATE;
  };

  return { grid, activePiece, nextPiece, score, lines, level, gameOver, reset };
};
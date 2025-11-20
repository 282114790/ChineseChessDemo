import { BoardMatrix, Camp, Coordinate, Move, Piece, BOARD_COLS, BOARD_ROWS } from './types';

export const oppositeCamp = (camp: Camp): Camp => (camp === 'red' ? 'black' : 'red');

export const isInsideBoard = (row: number, col: number): boolean =>
  row >= 0 && row < BOARD_ROWS && col >= 0 && col < BOARD_COLS;

export const cloneBoard = (board: BoardMatrix): BoardMatrix =>
  board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));

export const getPiece = (board: BoardMatrix, row: number, col: number): Piece | null => {
  if (!isInsideBoard(row, col)) return null;
  return board[row][col];
};

export const movePieceOnBoard = (board: BoardMatrix, move: Move): BoardMatrix => {
  const next = cloneBoard(board);
  next[move.from.row][move.from.col] = null;
  const moved: Piece = { ...move.piece, row: move.to.row, col: move.to.col };
  next[move.to.row][move.to.col] = moved;
  return next;
};

export const findGeneralPosition = (board: BoardMatrix, camp: Camp): Coordinate | null => {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const piece = board[row][col];
      if (piece?.camp === camp && piece.type === 'general') {
        return { row, col };
      }
    }
  }
  return null;
};

export const isInsidePalace = (camp: Camp, row: number, col: number): boolean => {
  const palaceCols = col >= 3 && col <= 5;
  if (!palaceCols) return false;
  if (camp === 'red') {
    return row >= 7 && row <= 9;
  }
  return row >= 0 && row <= 2;
};

export const hasBlockingPiece = (
  board: BoardMatrix,
  from: Coordinate,
  to: Coordinate,
  skipLast = false,
): boolean => {
  if (from.row === to.row) {
    const step = from.col < to.col ? 1 : -1;
    for (let col = from.col + step; col !== to.col; col += step) {
      if (board[from.row][col]) return true;
    }
    return skipLast ? false : Boolean(board[to.row][to.col]);
  }
  if (from.col === to.col) {
    const step = from.row < to.row ? 1 : -1;
    for (let row = from.row + step; row !== to.row; row += step) {
      if (board[row][from.col]) return true;
    }
    return skipLast ? false : Boolean(board[to.row][to.col]);
  }
  return false;
};

export const isSameCoordinate = (a: Coordinate | null, b: Coordinate | null): boolean =>
  !!a && !!b && a.row === b.row && a.col === b.col;


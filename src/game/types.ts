export type Camp = 'red' | 'black';

export type PieceType =
  | 'general'
  | 'advisor'
  | 'elephant'
  | 'horse'
  | 'chariot'
  | 'cannon'
  | 'soldier';

export interface Coordinate {
  row: number;
  col: number;
}

export interface Piece {
  id: string;
  type: PieceType;
  camp: Camp;
  row: number;
  col: number;
}

export type BoardMatrix = (Piece | null)[][];

export interface Move {
  id: string;
  piece: Piece;
  from: Coordinate;
  to: Coordinate;
  captured?: Piece | null;
  scoreHint?: number;
}

export interface GameStatus {
  winner?: Camp;
  reason?: 'checkmate' | 'stalemate';
}

export interface GameState {
  board: BoardMatrix;
  activeCamp: Camp;
  selectedCell: Coordinate | null;
  legalTargets: Move[];
  moveHistory: Move[];
  lastMove?: Move;
  status: GameStatus | null;
  isAiComputing: boolean;
}

export interface SearchOptions {
  maxDepth?: number;
  timeLimitMs?: number;
}

export const BOARD_ROWS = 10;
export const BOARD_COLS = 9;


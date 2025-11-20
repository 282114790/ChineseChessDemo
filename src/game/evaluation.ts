import { BoardMatrix, Camp, Piece } from './types';

export const PIECE_BASE_VALUES: Record<Piece['type'], number> = {
  general: 6000,
  advisor: 120,
  elephant: 120,
  horse: 270,
  chariot: 600,
  cannon: 320,
  soldier: 90,
};

const centralityBonus = (piece: Piece): number => {
  const centerOffset = 4 - Math.abs(4 - piece.col);
  return centerOffset * 6;
};

const advancement = (piece: Piece): number => {
  const progress = piece.camp === 'red' ? 9 - piece.row : piece.row;
  return progress * 4;
};

const palaceSafety = (piece: Piece): number => {
  if (piece.type !== 'general') return 0;
  const distFromCenter = Math.abs(piece.col - 4);
  const depth = piece.camp === 'red' ? 9 - piece.row : piece.row;
  return (3 - distFromCenter) * 15 - depth * 4;
};

const soldierBonus = (piece: Piece): number => {
  if (piece.type !== 'soldier') return 0;
  const crossedRiver = piece.camp === 'red' ? piece.row <= 4 : piece.row >= 5;
  return crossedRiver ? 80 + centralityBonus(piece) : 20 + advancement(piece);
};

const elephantAdvisorBonus = (piece: Piece): number => {
  if (piece.type !== 'elephant' && piece.type !== 'advisor') return 0;
  const stayingHome = piece.camp === 'red' ? piece.row >= 7 : piece.row <= 2;
  return stayingHome ? 25 : -40;
};

const horseCannonBonus = (piece: Piece): number => {
  if (piece.type !== 'horse' && piece.type !== 'cannon') return 0;
  return centralityBonus(piece) + advancement(piece) * 0.5;
};

const chariotBonus = (piece: Piece): number => {
  if (piece.type !== 'chariot') return 0;
  const openFiles = Math.abs(4 - piece.col) <= 2 ? 60 : 20;
  return openFiles + advancement(piece);
};

const positionalBonus = (piece: Piece): number => {
  let bonus = centralityBonus(piece);
  bonus += advancement(piece) * 0.3;
  bonus += palaceSafety(piece);
  bonus += soldierBonus(piece);
  bonus += elephantAdvisorBonus(piece);
  bonus += horseCannonBonus(piece);
  bonus += chariotBonus(piece);
  return bonus;
};

export const evaluateRelative = (board: BoardMatrix, camp: Camp): number => {
  let score = 0;
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      const piece = board[row][col];
      if (!piece) continue;
      const base = PIECE_BASE_VALUES[piece.type] + positionalBonus(piece);
      score += piece.camp === camp ? base : -base;
    }
  }
  return score;
};


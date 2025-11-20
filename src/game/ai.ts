import { BoardMatrix, Camp, Move, SearchOptions } from './types';
import { generateLegalMoves, isCampInCheck } from './moveGenerator';
import { evaluateRelative, PIECE_BASE_VALUES } from './evaluation';
import { movePieceOnBoard, oppositeCamp } from './utils';

const POSITIVE_INFINITY = 1_000_000;
const NEGATIVE_INFINITY = -POSITIVE_INFINITY;
const DEFAULT_DEPTH = 4;

interface SearchResult {
  move?: Move;
  score: number;
}

const moveScoreHint = (move: Move): number => {
  if (!move.captured) return 0;
  const capturedValue = PIECE_BASE_VALUES[move.captured.type];
  const attackerValue = PIECE_BASE_VALUES[move.piece.type];
  return capturedValue - attackerValue * 0.2;
};

const orderMoves = (moves: Move[]): Move[] =>
  [...moves].sort((a, b) => (moveScoreHint(b) - moveScoreHint(a)));

const negamax = (
  board: BoardMatrix,
  depth: number,
  alpha: number,
  beta: number,
  camp: Camp,
  ply: number,
): SearchResult => {
  if (depth === 0) {
    return { score: evaluateRelative(board, camp) };
  }

  const moves = orderMoves(generateLegalMoves(board, camp));
  if (moves.length === 0) {
    if (isCampInCheck(board, camp)) {
      return { score: NEGATIVE_INFINITY + ply };
    }
    return { score: 0 };
  }

  let bestScore = NEGATIVE_INFINITY;
  let bestMove: Move | undefined;

  for (const move of moves) {
    const nextBoard = movePieceOnBoard(board, move);
    const { score } = negamax(nextBoard, depth - 1, -beta, -alpha, oppositeCamp(camp), ply + 1);
    const evalScore = -score;
    if (evalScore > bestScore) {
      bestScore = evalScore;
      bestMove = move;
    }
    alpha = Math.max(alpha, evalScore);
    if (alpha >= beta) break;
  }

  return { move: bestMove, score: bestScore };
};

export const findBestMove = (
  board: BoardMatrix,
  camp: Camp,
  options: SearchOptions = {},
): Move | null => {
  const depth = options.maxDepth ?? DEFAULT_DEPTH;
  const { move } = negamax(board, depth, NEGATIVE_INFINITY, POSITIVE_INFINITY, camp, 0);
  return move ?? null;
};


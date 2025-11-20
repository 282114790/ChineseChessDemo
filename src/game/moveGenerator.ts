import {
  BoardMatrix,
  Camp,
  Coordinate,
  Move,
  Piece,
  PieceType,
  BOARD_COLS,
  BOARD_ROWS,
} from './types';
import {
  cloneBoard,
  findGeneralPosition,
  getPiece,
  isInsideBoard,
  isInsidePalace,
  movePieceOnBoard,
  oppositeCamp,
} from './utils';

type MoveAccumulator = (row: number, col: number, target?: Piece | null) => void;

const horseVectors = [
  { leg: { row: -1, col: 0 }, delta: { row: -2, col: -1 } },
  { leg: { row: -1, col: 0 }, delta: { row: -2, col: 1 } },
  { leg: { row: 1, col: 0 }, delta: { row: 2, col: -1 } },
  { leg: { row: 1, col: 0 }, delta: { row: 2, col: 1 } },
  { leg: { row: 0, col: -1 }, delta: { row: -1, col: -2 } },
  { leg: { row: 0, col: -1 }, delta: { row: 1, col: -2 } },
  { leg: { row: 0, col: 1 }, delta: { row: -1, col: 2 } },
  { leg: { row: 0, col: 1 }, delta: { row: 1, col: 2 } },
];

const cannonDirections = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
];

const soldierForward = {
  red: -1,
  black: 1,
};

const createMove = (piece: Piece, to: Coordinate, captured?: Piece | null): Move => ({
  id: `${piece.id}-${piece.row}${piece.col}-${to.row}${to.col}`,
  piece,
  from: { row: piece.row, col: piece.col },
  to,
  captured,
});

const countBetween = (board: BoardMatrix, from: Coordinate, to: Coordinate): number => {
  if (from.row === to.row) {
    const step = from.col < to.col ? 1 : -1;
    let count = 0;
    for (let col = from.col + step; col !== to.col; col += step) {
      if (board[from.row][col]) count += 1;
    }
    return count;
  }
  if (from.col === to.col) {
    const step = from.row < to.row ? 1 : -1;
    let count = 0;
    for (let row = from.row + step; row !== to.row; row += step) {
      if (board[row][from.col]) count += 1;
    }
    return count;
  }
  return Infinity;
};

const addIfCapturable = (piece: Piece, row: number, col: number, acc: MoveAccumulator, board: BoardMatrix) => {
  if (!isInsideBoard(row, col)) return;
  const target = board[row][col];
  if (target?.camp === piece.camp) return;
  acc(row, col, target);
};

const collectChariotMoves = (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => {
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  directions.forEach(({ row: dRow, col: dCol }) => {
    let row = piece.row + dRow;
    let col = piece.col + dCol;
    while (isInsideBoard(row, col)) {
      const target = board[row][col];
      if (!target) {
        acc(row, col, null);
      } else {
        if (target.camp !== piece.camp) acc(row, col, target);
        break;
      }
      row += dRow;
      col += dCol;
    }
  });
};

const collectCannonMoves = (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => {
  cannonDirections.forEach(({ row: dRow, col: dCol }) => {
    let row = piece.row + dRow;
    let col = piece.col + dCol;
    let jumped = false;

    while (isInsideBoard(row, col)) {
      const target = board[row][col];

      if (!jumped) {
        if (!target) {
          acc(row, col, null);
        } else {
          jumped = true;
        }
      } else {
        if (target) {
          if (target.camp !== piece.camp) acc(row, col, target);
          break;
        }
      }

      row += dRow;
      col += dCol;
    }
  });
};

const collectHorseMoves = (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => {
  horseVectors.forEach(({ leg, delta }) => {
    const legRow = piece.row + leg.row;
    const legCol = piece.col + leg.col;
    if (board[legRow]?.[legCol]) return;

    const targetRow = piece.row + delta.row;
    const targetCol = piece.col + delta.col;
    addIfCapturable(piece, targetRow, targetCol, acc, board);
  });
};

const collectElephantMoves = (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => {
  const deltas = [
    { row: 2, col: 2 },
    { row: 2, col: -2 },
    { row: -2, col: 2 },
    { row: -2, col: -2 },
  ];

  const riverBoundary = piece.camp === 'red' ? 4 : 5;

  deltas.forEach(({ row: dRow, col: dCol }) => {
    const midRow = piece.row + dRow / 2;
    const midCol = piece.col + dCol / 2;
    if (board[midRow]?.[midCol]) return;

    const targetRow = piece.row + dRow;
    const targetCol = piece.col + dCol;
    if (!isInsideBoard(targetRow, targetCol)) return;

    if (piece.camp === 'red' && targetRow <= riverBoundary) return;
    if (piece.camp === 'black' && targetRow >= riverBoundary) return;

    addIfCapturable(piece, targetRow, targetCol, acc, board);
  });
};

const collectAdvisorMoves = (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => {
  const deltas = [
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
  ];

  deltas.forEach(({ row: dRow, col: dCol }) => {
    const targetRow = piece.row + dRow;
    const targetCol = piece.col + dCol;
    if (!isInsidePalace(piece.camp, targetRow, targetCol)) return;
    addIfCapturable(piece, targetRow, targetCol, acc, board);
  });
};

const collectGeneralMoves = (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => {
  const deltas = [
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: -1 },
  ];

  deltas.forEach(({ row: dRow, col: dCol }) => {
    const targetRow = piece.row + dRow;
    const targetCol = piece.col + dCol;
    if (!isInsidePalace(piece.camp, targetRow, targetCol)) return;
    addIfCapturable(piece, targetRow, targetCol, acc, board);
  });

  // Flying general capture
  const enemyGeneral = findGeneralPosition(board, oppositeCamp(piece.camp));
  if (enemyGeneral && enemyGeneral.col === piece.col) {
    const between = countBetween(board, { row: piece.row, col: piece.col }, enemyGeneral);
    if (between === 0) {
      acc(enemyGeneral.row, enemyGeneral.col, board[enemyGeneral.row][enemyGeneral.col]);
    }
  }
};

const collectSoldierMoves = (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => {
  const forwardRow = piece.row + soldierForward[piece.camp];
  addIfCapturable(piece, forwardRow, piece.col, acc, board);

  const crossedRiver = piece.camp === 'red' ? piece.row <= 4 : piece.row >= 5;
  if (!crossedRiver) return;

  addIfCapturable(piece, piece.row, piece.col - 1, acc, board);
  addIfCapturable(piece, piece.row, piece.col + 1, acc, board);
};

const pseudoMoveCollectors: Record<PieceType, (piece: Piece, board: BoardMatrix, acc: MoveAccumulator) => void> = {
  general: collectGeneralMoves,
  advisor: collectAdvisorMoves,
  elephant: collectElephantMoves,
  horse: collectHorseMoves,
  chariot: collectChariotMoves,
  cannon: collectCannonMoves,
  soldier: collectSoldierMoves,
};

const generatePseudoMoves = (board: BoardMatrix, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const acc: MoveAccumulator = (row, col, target) => {
    if (!isInsideBoard(row, col)) return;
    moves.push(createMove(piece, { row, col }, target ?? undefined));
  };

  pseudoMoveCollectors[piece.type](piece, board, acc);
  return moves;
};

const generalsFacing = (board: BoardMatrix): boolean => {
  const red = findGeneralPosition(board, 'red');
  const black = findGeneralPosition(board, 'black');
  if (!red || !black) return false;
  if (red.col !== black.col) return false;

  const start = Math.min(red.row, black.row) + 1;
  const end = Math.max(red.row, black.row);
  for (let row = start; row < end; row += 1) {
    if (board[row][red.col]) return false;
  }
  return true;
};

export const isCampInCheck = (board: BoardMatrix, camp: Camp): boolean => {
  const generalPos = findGeneralPosition(board, camp);
  if (!generalPos) return false;

  if (generalsFacing(board)) return true;

  const enemyCamp = oppositeCamp(camp);
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const piece = board[row][col];
      if (piece?.camp !== enemyCamp) continue;
      const moves = generatePseudoMoves(board, piece);
      if (moves.some((move) => move.to.row === generalPos.row && move.to.col === generalPos.col)) {
        return true;
      }
    }
  }
  return false;
};

const isMoveLegal = (board: BoardMatrix, move: Move): boolean => {
  const nextBoard = movePieceOnBoard(board, move);
  return !isCampInCheck(nextBoard, move.piece.camp);
};

export const generateLegalMoves = (board: BoardMatrix, camp: Camp): Move[] => {
  const moves: Move[] = [];

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const piece = board[row][col];
      if (!piece || piece.camp !== camp) continue;

      const pseudoMoves = generatePseudoMoves(board, piece);
      pseudoMoves.forEach((move) => {
        if (isMoveLegal(board, move)) {
          moves.push(move);
        }
      });
    }
  }

  return moves;
};

export const generateLegalMovesFromCell = (board: BoardMatrix, coord: Coordinate): Move[] => {
  const piece = getPiece(board, coord.row, coord.col);
  if (!piece) return [];
  return generatePseudoMoves(board, piece).filter((move) => isMoveLegal(board, move));
};

export const applyMove = (board: BoardMatrix, move: Move): BoardMatrix => cloneBoard(movePieceOnBoard(board, move));


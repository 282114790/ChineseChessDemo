import { v4 as uuid } from 'uuid';
import { BoardMatrix, Camp, Piece, PieceType, BOARD_ROWS, BOARD_COLS } from './types';

const backRank: PieceType[] = [
  'chariot',
  'horse',
  'elephant',
  'advisor',
  'general',
  'advisor',
  'elephant',
  'horse',
  'chariot',
];

const cannonCols = [1, 7];
const soldierCols = [0, 2, 4, 6, 8];

const emptyBoard = (): BoardMatrix =>
  Array.from({ length: BOARD_ROWS }, () => Array.from({ length: BOARD_COLS }, () => null));

const createPiece = (type: PieceType, camp: Camp, row: number, col: number): Piece => ({
  id: uuid(),
  type,
  camp,
  row,
  col,
});

const placeBackRank = (board: BoardMatrix, row: number, camp: Camp) => {
  backRank.forEach((type, col) => {
    board[row][col] = createPiece(type, camp, row, col);
  });
};

const placeCannons = (board: BoardMatrix, row: number, camp: Camp) => {
  cannonCols.forEach((col) => {
    board[row][col] = createPiece('cannon', camp, row, col);
  });
};

const placeSoldiers = (board: BoardMatrix, row: number, camp: Camp) => {
  soldierCols.forEach((col) => {
    board[row][col] = createPiece('soldier', camp, row, col);
  });
};

export const createInitialBoard = (): BoardMatrix => {
  const board = emptyBoard();

  // Black side (top of the board)
  placeBackRank(board, 0, 'black');
  placeCannons(board, 2, 'black');
  placeSoldiers(board, 3, 'black');

  // Red side (bottom of the board)
  placeBackRank(board, 9, 'red');
  placeCannons(board, 7, 'red');
  placeSoldiers(board, 6, 'red');

  return board;
};


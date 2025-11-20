import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createInitialBoard } from '../game/boardSetup';
import { findBestMove } from '../game/ai';
import {
  applyMove,
  generateLegalMoves,
  generateLegalMovesFromCell,
  isCampInCheck,
} from '../game/moveGenerator';
import { GameState, Coordinate, Move, Camp } from '../game/types';
import { oppositeCamp } from '../game/utils';
import { playMoveTone } from '../sound/moveTone';

type AiLevel = 'master' | 'grandmaster';

const AI_DEPTH: Record<AiLevel, number> = {
  master: 4,
  grandmaster: 5,
};

const baseState = (): GameState => ({
  board: createInitialBoard(),
  activeCamp: 'red',
  selectedCell: null,
  legalTargets: [],
  moveHistory: [],
  lastMove: undefined,
  status: null,
  isAiComputing: false,
});

const evaluateStateAfterMove = (board: GameState['board'], nextCamp: Camp) => {
  const moves = generateLegalMoves(board, nextCamp);
  if (moves.length === 0) {
    if (isCampInCheck(board, nextCamp)) {
      return { winner: oppositeCamp(nextCamp), reason: 'checkmate' as const };
    }
    return { reason: 'stalemate' as const };
  }
  return null;
};

const integrateMove = (state: GameState, move: Move, overrides?: Partial<GameState>): GameState => {
  const nextBoard = applyMove(state.board, move);
  const nextCamp = oppositeCamp(state.activeCamp);
  const status = evaluateStateAfterMove(nextBoard, nextCamp);
  void playMoveTone();
  return {
    ...state,
    board: nextBoard,
    activeCamp: status?.winner ? state.activeCamp : nextCamp,
    selectedCell: null,
    legalTargets: [],
    moveHistory: [...state.moveHistory, move],
    lastMove: move,
    status,
    ...overrides,
  };
};

export const useChessGame = () => {
  const [state, setState] = useState<GameState>(() => baseState());
  const [aiLevel, setAiLevel] = useState<AiLevel>('grandmaster');
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const resetGame = useCallback(() => {
    setState(baseState());
  }, []);

  const handleSelection = useCallback(
    (coord: Coordinate) => {
      setState((prev) => {
        if (prev.status || prev.isAiComputing) return prev;
        const piece = prev.board[coord.row][coord.col];

        if (prev.selectedCell) {
          const move = prev.legalTargets.find(
            (candidate) => candidate.to.row === coord.row && candidate.to.col === coord.col,
          );
          if (move) {
            const updated = integrateMove(prev, move);
            return { ...updated };
          }
        }

        if (piece && piece.camp === prev.activeCamp) {
          const targets = generateLegalMovesFromCell(prev.board, coord);
          return { ...prev, selectedCell: coord, legalTargets: targets };
        }

        return { ...prev, selectedCell: null, legalTargets: [] };
      });
    },
    [],
  );

  const requestAiMove = useCallback(() => {
    setState((prev) => ({ ...prev, isAiComputing: true }));

    window.setTimeout(() => {
      const snapshot = stateRef.current;
      if (snapshot.status || snapshot.activeCamp !== 'black') {
        setState((prev) => ({ ...prev, isAiComputing: false }));
        return;
      }

      const bestMove = findBestMove(snapshot.board, 'black', {
        maxDepth: AI_DEPTH[aiLevel],
      });

      setState((prev) => {
        if (!bestMove) {
          const fallbackStatus = { winner: 'red' as Camp, reason: 'checkmate' as const };
          return {
            ...prev,
            status: fallbackStatus,
            isAiComputing: false,
          };
        }
        const updated = integrateMove(prev, bestMove, { isAiComputing: false });
        return updated;
      });
    }, 180);
  }, [aiLevel]);

  useEffect(() => {
    if (state.status) return;
    if (state.activeCamp === 'black' && !state.isAiComputing) {
      requestAiMove();
    }
  }, [requestAiMove, state.activeCamp, state.isAiComputing, state.status]);

  const highlightCoords = useMemo(
    () => state.legalTargets.map((move) => move.to),
    [state.legalTargets],
  );

  return {
    state,
    aiLevel,
    setAiLevel,
    selectCell: handleSelection,
    resetGame,
    highlightCoords,
  };
};


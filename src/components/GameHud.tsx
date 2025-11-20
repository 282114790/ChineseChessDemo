import { Dispatch, SetStateAction, useMemo } from 'react';
import { Camp, GameStatus, Move } from '../game/types';

const CAMP_LABEL: Record<Camp, string> = {
  red: '红方',
  black: '黑方',
};

const PIECE_NAME: Record<Move['piece']['type'], string> = {
  general: '将',
  advisor: '士',
  elephant: '象',
  horse: '马',
  chariot: '车',
  cannon: '炮',
  soldier: '兵',
};

const fileLetters = ['九', '八', '七', '六', '五', '四', '三', '二', '一'];

const toNotation = (move: Move): string => {
  const camp = CAMP_LABEL[move.piece.camp];
  const pieceName = PIECE_NAME[move.piece.type];
  const fromFile = fileLetters[move.from.col] ?? `${move.from.col}`;
  const toFile = fileLetters[move.to.col] ?? `${move.to.col}`;
  return `${camp} ${pieceName} ${fromFile}→${toFile} (${move.from.row + 1}-${move.to.row + 1})`;
};

type AiLevel = 'master' | 'grandmaster';

interface GameHudProps {
  activeCamp: Camp;
  status: GameStatus | null;
  moveHistory: Move[];
  lastMove: Move | null;
  isAiComputing: boolean;
  aiLevel: AiLevel;
  onAiLevelChange: Dispatch<SetStateAction<AiLevel>>;
  onReset: () => void;
}

const GameHud = ({
  activeCamp,
  status,
  moveHistory,
  lastMove,
  isAiComputing,
  aiLevel,
  onAiLevelChange,
  onReset,
}: GameHudProps) => {
  const statusLine = status
    ? status.winner
      ? `${CAMP_LABEL[status.winner]}胜利 · ${status.reason === 'checkmate' ? '将死' : '逼和'}`
      : '和棋 · 双方无子可动'
    : `${CAMP_LABEL[activeCamp]}执子`;

  const recentMoves = useMemo(() => [...moveHistory].slice(-6).reverse(), [moveHistory]);

  return (
    <aside className="hud-panel">
      <div className="hud-header">
        <h1>璀璨象棋</h1>
        <p>3D国粹对弈 · 高水平AI同行</p>
      </div>

      <div className="hud-section">
        <div className="status-chip">{statusLine}</div>
        {isAiComputing && (
          <div className="ai-indicator">
            <span className="spinner" />
            <span>AI深度思考中...</span>
          </div>
        )}
      </div>

      <div className="hud-section controls">
        <label className="field">
          <span>AI等级</span>
          <select value={aiLevel} onChange={(event) => onAiLevelChange(event.target.value as AiLevel)}>
            <option value="master">大师 (深度 4)</option>
            <option value="grandmaster">特级大师 (深度 5)</option>
          </select>
        </label>
        <button type="button" className="ghost-button" onClick={onReset}>
          重新开始
        </button>
      </div>

      <div className="hud-section">
        <div className="section-title">最近着法</div>
        {recentMoves.length === 0 && <p className="muted">对局刚刚开始，快来试试吧。</p>}
        <ul className="moves-list">
          {recentMoves.map((move, index) => (
            <li key={move.id} className={index === 0 ? 'latest' : ''}>
              <span>{toNotation(move)}</span>
              {move.captured && <em>吃：{CAMP_LABEL[move.captured.camp]} {PIECE_NAME[move.captured.type]}</em>}
            </li>
          ))}
        </ul>
      </div>

      {lastMove && (
        <div className="hud-section last-move">
          <div className="section-title">最新落子</div>
          <p>{toNotation(lastMove)}</p>
        </div>
      )}
    </aside>
  );
};

export default GameHud;



import { memo, useMemo, useState } from 'react';
import { Grid, Text, useCursor } from '@react-three/drei';
import { Camp, BoardMatrix, Coordinate, Move, GameStatus, BOARD_COLS, BOARD_ROWS } from '../game/types';
import ChessPiece from './ChessPiece';

const CELL_SIZE = 1.18;
const HALF_COLS = (BOARD_COLS - 1) / 2;
const HALF_ROWS = (BOARD_ROWS - 1) / 2;

const toScenePosition = (row: number, col: number, y = 0) =>
  [
    (col - HALF_COLS) * CELL_SIZE,
    y,
    (row - HALF_ROWS) * CELL_SIZE,
  ] as const;

interface ChessSceneProps {
  board: BoardMatrix;
  selectedCell: Coordinate | null;
  highlightCoords: Coordinate[];
  selectCell: (coord: Coordinate) => void;
  lastMove?: Move;
  activeCamp: Camp;
  status: GameStatus | null;
}

const ChessScene = ({
  board,
  selectedCell,
  highlightCoords,
  selectCell,
  lastMove,
  status,
}: ChessSceneProps) => {
  const pieces = useMemo(
    () =>
      board
        .flatMap((row) => row)
        .filter((piece): piece is NonNullable<typeof piece> => Boolean(piece)),
    [board],
  );

  return (
    <group>
      <BoardBase dimmed={Boolean(status?.winner)} />
      <BoardGridLines />
      <River />
      <RiverText />
      <PalaceLines />
      <BoardHighlights
        selected={selectedCell}
        legalTargets={highlightCoords}
        lastMove={lastMove ?? null}
      />
      {pieces.map((piece) => (
        <ChessPiece
          key={piece.id}
          piece={piece}
          position={toScenePosition(piece.row, piece.col)}
          selected={selectedCell?.row === piece.row && selectedCell?.col === piece.col}
          lastMoved={lastMove ? lastMove.to.row === piece.row && lastMove.to.col === piece.col : false}
          onPick={() => selectCell({ row: piece.row, col: piece.col })}
        />
      ))}
      <InteractiveGrid onSelect={selectCell} />
    </group>
  );
};

const BoardBase = memo(({ dimmed }: { dimmed: boolean }) => {
  const boardWidth = CELL_SIZE * (BOARD_COLS + 1.15);
  const boardHeight = CELL_SIZE * (BOARD_ROWS + 1.15);

  return (
    <group>
  <mesh position={[0, -0.2, 0]} receiveShadow castShadow>
        <boxGeometry args={[boardWidth, 0.4, boardHeight]} />
        <meshStandardMaterial
          color={dimmed ? '#4b2f1f' : '#3a2315'}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[boardWidth - 0.3, 0.22, boardHeight - 0.3]} />
        <meshStandardMaterial color={dimmed ? '#c39a6b' : '#dcb37c'} roughness={0.6} />
      </mesh>
      <Grid
        position={[0, 0.115, 0]}
        args={[
          CELL_SIZE * (BOARD_COLS - 1),
          CELL_SIZE * (BOARD_ROWS - 1),
          BOARD_COLS - 1,
          BOARD_ROWS - 1,
        ]}
        sectionThickness={0.08}
        sectionColor="#5a3217"
        cellThickness={0.02}
        cellColor="#7a4a2b"
        fadeDistance={60}
        fadeStrength={1}
        side={0}
      />
    </group>
  );
});

const River = memo(() => (
  <mesh position={[0, 0.12, (0.5 - HALF_ROWS) * CELL_SIZE]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[CELL_SIZE * (BOARD_COLS - 0.5), CELL_SIZE * 1.02]} />
    <meshBasicMaterial color="#a5d8ff" transparent opacity={0.08} />
  </mesh>
));

const BoardGridLines = memo(() => {
  const { horizontal, vertical } = useMemo(() => {
    const horiz: number[] = [];
    const vert: number[] = [];
    const startX = -HALF_COLS * CELL_SIZE;
    const endX = HALF_COLS * CELL_SIZE;
    for (let row = 0; row < BOARD_ROWS; row += 1) {
      const z = (row - HALF_ROWS) * CELL_SIZE;
      horiz.push(startX, 0.125, z, endX, 0.125, z);
    }

    const topZ = (0 - HALF_ROWS) * CELL_SIZE;
    const bottomZ = (BOARD_ROWS - 1 - HALF_ROWS) * CELL_SIZE;
    const riverEnd = (4 - HALF_ROWS) * CELL_SIZE;
    const riverStart = (5 - HALF_ROWS) * CELL_SIZE;

    for (let col = 0; col < BOARD_COLS; col += 1) {
      const x = (col - HALF_COLS) * CELL_SIZE;
      if (col === 0 || col === BOARD_COLS - 1) {
        vert.push(x, 0.125, topZ, x, 0.125, bottomZ);
      } else {
        vert.push(x, 0.125, topZ, x, 0.125, riverEnd);
        vert.push(x, 0.125, riverStart, x, 0.125, bottomZ);
      }
    }
    return {
      horizontal: new Float32Array(horiz),
      vertical: new Float32Array(vert),
    };
  }, []);

  return (
    <group>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={horizontal.length / 3} array={horizontal} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#6d472a" linewidth={1.5} />
      </lineSegments>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={vertical.length / 3} array={vertical} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#6d472a" linewidth={1.5} />
      </lineSegments>
    </group>
  );
});

const RiverText = memo(() => {
  const riverZ = ((4.5 - HALF_ROWS) * CELL_SIZE);
  return (
    <group>
      <Text
        position={[-CELL_SIZE * 2, 0.13, riverZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.7}
        color="#b45309"
        letterSpacing={0.2}
        anchorX="center"
        anchorY="middle"
      >
        楚河
      </Text>
      <Text
        position={[CELL_SIZE * 2, 0.13, riverZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.7}
        color="#b45309"
        letterSpacing={0.2}
        anchorX="center"
        anchorY="middle"
      >
        汉界
      </Text>
    </group>
  );
});

const palaceLinesPositions = [
  { from: { row: 0, col: 3 }, to: { row: 2, col: 5 } },
  { from: { row: 0, col: 5 }, to: { row: 2, col: 3 } },
  { from: { row: 7, col: 3 }, to: { row: 9, col: 5 } },
  { from: { row: 7, col: 5 }, to: { row: 9, col: 3 } },
];

const PalaceLines = memo(() => {
  const positions = useMemo(() => {
    const buffer = new Float32Array(palaceLinesPositions.length * 6);
    palaceLinesPositions.forEach((line, index) => {
      const start = toScenePosition(line.from.row, line.from.col, 0.13);
      const end = toScenePosition(line.to.row, line.to.col, 0.13);
      const offset = index * 6;
      buffer.set([start[0], start[1], start[2], end[0], end[1], end[2]], offset);
    });
    return buffer;
  }, []);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#5a3217" linewidth={1} />
    </lineSegments>
  );
});

const BoardHighlights = ({
  selected,
  legalTargets,
  lastMove,
}: {
  selected: Coordinate | null;
  legalTargets: Coordinate[];
  lastMove: Move | null;
}) => {
  return (
    <group>
      {selected && (
        <HighlightRing coord={selected} color="#3dd5f3" radius={CELL_SIZE * 0.52} opacity={0.85} />
      )}
      {legalTargets.map((coord) => (
        <HighlightDisc key={`legal-${coord.row}-${coord.col}`} coord={coord} color="#f9c74f" />
      ))}
      {lastMove && (
        <>
          <HighlightRing coord={lastMove.from} color="#f87171" radius={CELL_SIZE * 0.45} opacity={0.5} />
          <HighlightRing coord={lastMove.to} color="#34d399" radius={CELL_SIZE * 0.45} opacity={0.6} />
        </>
      )}
    </group>
  );
};

const HighlightRing = ({
  coord,
  color,
  radius,
  opacity,
}: {
  coord: Coordinate;
  color: string;
  radius: number;
  opacity: number;
}) => (
  <mesh position={toScenePosition(coord.row, coord.col, 0.13)} rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[radius * 0.68, radius, 48]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} />
  </mesh>
);

const HighlightDisc = ({ coord, color }: { coord: Coordinate; color: string }) => (
  <mesh position={toScenePosition(coord.row, coord.col, 0.14)} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[CELL_SIZE * 0.2, 24]} />
    <meshBasicMaterial color={color} transparent opacity={0.55} />
  </mesh>
);

const InteractiveGrid = ({ onSelect }: { onSelect: (coord: Coordinate) => void }) => (
  <group>
    {Array.from({ length: BOARD_ROWS }).map((_, row) =>
      Array.from({ length: BOARD_COLS }).map((__, col) => (
        <InteractiveCell key={`cell-${row}-${col}`} row={row} col={col} onSelect={onSelect} />
      )),
    )}
  </group>
);

const InteractiveCell = ({ row, col, onSelect }: { row: number; col: number; onSelect: (coord: Coordinate) => void }) => {
  const [hovered, setHovered] = useState(false);
  useCursor(hovered, 'pointer', 'auto');
  const position = toScenePosition(row, col, 0.16);

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      onPointerDown={(event) => {
        event.stopPropagation();
        onSelect({ row, col });
      }}
    >
      <planeGeometry args={[CELL_SIZE * 0.96, CELL_SIZE * 0.96]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={hovered ? 0.08 : 0} />
    </mesh>
  );
};

export default ChessScene;



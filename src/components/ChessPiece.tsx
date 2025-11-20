import { memo, useEffect, useMemo, useRef } from 'react';
import { CanvasTexture, DoubleSide, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { Piece } from '../game/types';

const PIECE_LABELS: Record<Piece['camp'], Record<Piece['type'], string>> = {
  red: {
    general: '帅',
    advisor: '仕',
    elephant: '相',
    horse: '马',
    chariot: '车',
    cannon: '炮',
    soldier: '兵',
  },
  black: {
    general: '将',
    advisor: '士',
    elephant: '象',
    horse: '马',
    chariot: '車',
    cannon: '炮',
    soldier: '卒',
  },
};

const labelCache = new Map<string, CanvasTexture>();

const createLabelTexture = (camp: Piece['camp'], type: Piece['type']): CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const cacheKey = `${camp}-${type}`;
  const cached = labelCache.get(cacheKey);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fdf4e3';
  ctx.beginPath();
  ctx.arc(128, 128, 118, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.strokeStyle = camp === 'red' ? '#991b1b' : '#1f2937';
  ctx.stroke();

  ctx.fillStyle = camp === 'red' ? '#b91c1c' : '#1f2937';
  ctx.font = 'bold 150px "PingFang SC", "Noto Serif SC", "Noto Sans SC", "Microsoft YaHei", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(PIECE_LABELS[camp][type], 128, 138);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  labelCache.set(cacheKey, texture);
  return texture;
};

interface ChessPieceProps {
  piece: Piece;
  position: readonly [number, number, number];
  selected: boolean;
  lastMoved: boolean;
  onPick: () => void;
}

const ChessPiece = ({ piece, position, selected, lastMoved, onPick }: ChessPieceProps) => {
  const groupRef = useRef<Group>(null);
  const hoverLiftRef = useRef(0);
  const labelTexture = useMemo(() => createLabelTexture(piece.camp, piece.type), [piece.camp, piece.type]);
  const accentColor = piece.camp === 'red' ? '#c2412d' : '#27303f';
  const bodyColor = '#f4d9b2';
  const height = 0.35;
  const radius = 0.48;
  const hoverLift = selected ? 0.14 : lastMoved ? 0.09 : 0.06;
  const baseHeight = 0.22;
  const x = position[0];
  const z = position[2];

  useEffect(() => {
    hoverLiftRef.current = hoverLift;
  }, [hoverLift]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(x, baseHeight + hoverLift, z);
    }
  }, [hoverLift, x, z, baseHeight]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const bob = Math.sin(clock.getElapsedTime() * 2 + x) * (selected ? 0.02 : 0.01);
    const lift = hoverLiftRef.current;
    groupRef.current.position.set(x, baseHeight + lift + bob, z);
  });

  return (
    <group ref={groupRef}>
      <mesh
        castShadow
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onPick();
        }}
      >
        <cylinderGeometry args={[radius, radius, height, 48]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.35}
          metalness={0.15}
          emissive={selected ? accentColor : '#000000'}
          emissiveIntensity={selected ? 0.6 : 0.1}
        />
      </mesh>
      <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.92, 48]} />
        <meshStandardMaterial
          map={labelTexture ?? undefined}
          color={labelTexture ? '#ffffff' : accentColor}
          transparent
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, -height / 2 + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius * 0.8, 48]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 - 0.01, 0]}>
        <ringGeometry args={[radius * 0.65, radius * 0.95, 48]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
};

export default memo(ChessPiece);



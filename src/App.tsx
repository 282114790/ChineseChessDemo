import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls } from '@react-three/drei';
import { useChessGame } from './hooks/useChessGame';
import ChessScene from './components/ChessScene';
import GameHud from './components/GameHud';
import './styles/global.css';

const App = () => {
  const { state, aiLevel, setAiLevel, selectCell, resetGame, highlightCoords } = useChessGame();

  return (
    <div className="app-shell">
      <div className="canvas-panel">
        <Canvas
          shadows
          camera={{ position: [0, 28, 0.01], fov: 48, near: 0.1, far: 120 }}
          dpr={[1, 1.8]}
        >
          <color attach="background" args={['#050608']} />
          <fog attach="fog" args={['#050608', 24, 45]} />
          <ambientLight intensity={0.6} />
          <directionalLight
            castShadow
            intensity={1.3}
            position={[8, 16, 10]}
            shadow-camera-near={2}
            shadow-camera-far={40}
            shadow-camera-left={-18}
            shadow-camera-right={18}
            shadow-camera-top={18}
            shadow-camera-bottom={-18}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight intensity={0.35} position={[-6, 4, -4]} color="#fbd38d" />
          <Suspense fallback={null}>
            <ChessScene
              board={state.board}
              activeCamp={state.activeCamp}
              lastMove={state.lastMove}
              selectedCell={state.selectedCell}
              highlightCoords={highlightCoords}
              selectCell={selectCell}
              status={state.status}
            />
            <Environment preset="warehouse" />
            <ContactShadows
              opacity={0.35}
              width={18}
              height={18}
              blur={1.6}
              far={16}
              resolution={1024}
              color="#171717"
            />
          </Suspense>
          <OrbitControls
            enablePan={false}
            enableRotate={false}
            enableZoom={false}
            maxDistance={24}
            minDistance={24}
            target={[0, 0, 0]}
          />
        </Canvas>
      </div>
      <GameHud
        activeCamp={state.activeCamp}
        aiLevel={aiLevel}
        isAiComputing={state.isAiComputing}
        lastMove={state.lastMove ?? null}
        moveHistory={state.moveHistory}
        onAiLevelChange={setAiLevel}
        onReset={resetGame}
        status={state.status}
      />
    </div>
  );
};

export default App;



let audioCtx: AudioContext | null = null;

const ensureContext = async (): Promise<AudioContext | null> => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    try {
      await audioCtx.resume();
    } catch {
      return audioCtx;
    }
  }
  return audioCtx;
};

//test

export const playMoveTone = async (): Promise<void> => {
  const ctx = await ensureContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(720, now);

  gain.gain.setValueAtTime(0.24, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.35);
};


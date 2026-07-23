// src/utils/audio.ts
// Emergency dual-tone siren synthesizer using Web Audio API

let audioCtx: AudioContext | null = null;
let osc1: OscillatorNode | null = null;
let osc2: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let sirenInterval: number | null = null;
let mutedState: boolean = false;
let isPlaying: boolean = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isMuted(): boolean {
  return mutedState;
}

export function setMuted(muted: boolean): void {
  mutedState = muted;
  if (gainNode && audioCtx) {
    gainNode.gain.setValueAtTime(muted ? 0 : 0.15, audioCtx.currentTime);
  }
  if (muted && isPlaying) {
    stopSiren();
  }
}

export function playSiren(): void {
  if (mutedState) return;
  if (isPlaying) return;

  try {
    const ctx = getAudioContext();

    osc1 = ctx.createOscillator();
    osc2 = ctx.createOscillator();
    gainNode = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(600, ctx.currentTime);
    osc2.frequency.setValueAtTime(900, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start();
    osc2.start();
    isPlaying = true;

    let highFreq = true;
    sirenInterval = window.setInterval(() => {
      if (!ctx || !osc1 || !osc2 || !isPlaying) return;
      const now = ctx.currentTime;
      if (highFreq) {
        osc1.frequency.exponentialRampToValueAtTime(900, now + 0.35);
        osc2.frequency.exponentialRampToValueAtTime(600, now + 0.35);
      } else {
        osc1.frequency.exponentialRampToValueAtTime(600, now + 0.35);
        osc2.frequency.exponentialRampToValueAtTime(900, now + 0.35);
      }
      highFreq = !highFreq;
    }, 400);
  } catch (err) {
    console.warn('AudioContext playSiren error:', err);
  }
}

export function stopSiren(): void {
  if (sirenInterval !== null) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (osc1) {
    try {
      osc1.stop();
      osc1.disconnect();
    } catch {
      // Ignore cleanup error if context already closed
    }
    osc1 = null;
  }
  if (osc2) {
    try {
      osc2.stop();
      osc2.disconnect();
    } catch {
      // Ignore cleanup error if context already closed
    }
    osc2 = null;
  }
  if (gainNode) {
    try {
      gainNode.disconnect();
    } catch {
      // Ignore cleanup error if context already closed
    }
    gainNode = null;
  }
  isPlaying = false;
}

/**
 * Plays a beeping alarm tone for ~5 seconds using the Web Audio API — no
 * audio asset needed. Browsers block audio until a user gesture has
 * happened on the page at least once; if that hasn't occurred yet, this
 * silently no-ops rather than throwing.
 */
export function playAlarm(durationMs = 5000): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const beepOnMs = 300;
    const beepOffMs = 200;
    const cycle = beepOnMs + beepOffMs;
    const beepCount = Math.ceil(durationMs / cycle);

    for (let i = 0; i < beepCount; i++) {
      const startAt = ctx.currentTime + (i * cycle) / 1000;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.15, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + beepOnMs / 1000);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + beepOnMs / 1000);
    }

    setTimeout(() => ctx.close(), durationMs + 200);
  } catch {
    // Audio not available in this context — the visual banner still shows.
  }
}

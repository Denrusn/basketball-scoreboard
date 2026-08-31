// Web Audio API sound generator for realistic basketball stadium effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * End of Period / Game Buzzer (Deep loud multi-tone stadium horn)
 */
export function playStadiumHorn(duration = 1.8) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.3, now);
  masterGain.gain.linearRampToValueAtTime(0.3, now + duration - 0.1);
  masterGain.gain.linearRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  // Traditional stadium horn uses a mix of dissonant square & sawtooth waves
  const frequencies = [220, 233, 277, 330];

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // Add subtle vibrato
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(6, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(4, now);
    lfo.connect(osc.frequency);
    lfo.start(now);
    lfo.stop(now + duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    osc.connect(filter);
    filter.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);
  });
}

/**
 * 24s Shot Clock Violation Buzzer (Higher pitched alert buzzer)
 */
export function playShotClockBuzzer(duration = 1.2) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.25, now);
  masterGain.gain.linearRampToValueAtTime(0.25, now + duration - 0.1);
  masterGain.gain.linearRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  const frequencies = [440, 466, 554];

  frequencies.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.Q.setValueAtTime(2, now);

    osc.connect(filter);
    filter.connect(masterGain);

    osc.start(now);
    osc.stop(now + duration);
  });
}

/**
 * Referee Whistle (Sharp trill pulse)
 */
export function playWhistle(duration = 0.6) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.2, now);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  // Dual high-pitch oscillators modulated for whistle pea effect
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  osc1.type = 'sine';
  osc2.type = 'sine';
  osc1.frequency.setValueAtTime(2600, now);
  osc2.frequency.setValueAtTime(2900, now);

  const mod = ctx.createOscillator();
  mod.frequency.setValueAtTime(30, now); // Trill speed
  const modGain = ctx.createGain();
  modGain.gain.setValueAtTime(150, now);
  mod.connect(osc1.frequency);
  mod.connect(osc2.frequency);
  mod.start(now);
  mod.stop(now + duration);

  osc1.connect(masterGain);
  osc2.connect(masterGain);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
}

/**
 * Short Button Beep (Scoring / UI feedback)
 */
export function playScoreBeep(points = 2) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  const freq = points === 3 ? 880 : points === 2 ? 660 : 520;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.1);

  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.15);
}

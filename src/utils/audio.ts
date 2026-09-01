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
 * Referee Whistle (Loud, sharp, piercing Fox 40 court blast)
 */
export function playWhistle(duration = 0.38) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  
  // Instant sharp attack and loud court blast
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.linearRampToValueAtTime(0.55, now + 0.005);
  masterGain.gain.setValueAtTime(0.55, now + duration - 0.06);
  masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  masterGain.connect(ctx.destination);

  // High resonant bandpass filter to simulate resonant whistle chamber
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(3050, now);
  filter.Q.setValueAtTime(4.0, now);
  filter.connect(masterGain);

  // Two primary high piercing whistle frequencies
  const freqs = [2950, 3250];

  freqs.forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    
    // Very subtle micro-vibration for air turbulence
    const vibrato = ctx.createOscillator();
    vibrato.frequency.setValueAtTime(80, now);
    const vibGain = ctx.createGain();
    vibGain.gain.setValueAtTime(25, now);
    vibrato.connect(osc.frequency);
    vibrato.start(now);
    vibrato.stop(now + duration);

    osc.connect(filter);
    osc.start(now);
    osc.stop(now + duration);
  });
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

/**
 * Voice Announcement for crucial remaining time in a period (Web Speech API)
 * E.g., "第一节比赛剩余两分钟", "第二节比赛剩余一分钟", "加时赛比赛剩余两分钟"
 */
export function speakPeriodTimeRemaining(
  period: number,
  totalRegularPeriods = 4,
  minutesRemaining: number
): string {
  const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const minText = minutesRemaining === 2 ? '两分钟' : minutesRemaining === 1 ? '一分钟' : `${minutesRemaining}分钟`;

  let periodPrefix = '';
  if (period <= totalRegularPeriods) {
    const pStr = chineseNumbers[period - 1] || String(period);
    periodPrefix = `第${pStr}节比赛`;
  } else {
    const otIdx = period - totalRegularPeriods;
    if (otIdx === 1) {
      periodPrefix = '加时赛比赛';
    } else {
      const otStr = chineseNumbers[otIdx - 1] || String(otIdx);
      periodPrefix = `加时赛第${otStr}节比赛`;
    }
  }

  const broadcastText = `${periodPrefix}剩余${minText}`;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(broadcastText);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to match standard Chinese voice if available
      const voices = window.speechSynthesis.getVoices();
      const zhVoice = voices.find(
        (v) => v.lang === 'zh-CN' || v.lang.startsWith('zh') || v.lang.includes('cmn')
      );
      if (zhVoice) {
        utterance.voice = zhVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  }

  return broadcastText;
}


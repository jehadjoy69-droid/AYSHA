// Ultra-responsive Web Audio API sound generator & BGM manager
class BirthdayAudio {
  constructor() {
    this.ctx = null;
    this.bgm = new Audio('assets/hbd.mp3');
    this.bgm.loop = true;
    this.bgm.volume = 0.6;
    this.isPlayingBGM = false;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleBGM() {
    this.init();
    if (this.isPlayingBGM) {
      this.bgm.pause();
      this.isPlayingBGM = false;
    } else {
      this.bgm.play().then(() => {
        this.isPlayingBGM = true;
      }).catch(e => console.log('Audio autoplay prevented:', e));
    }
    return this.isPlayingBGM;
  }

  startBGM() {
    this.init();
    if (!this.isPlayingBGM) {
      this.bgm.play().then(() => {
        this.isPlayingBGM = true;
      }).catch(e => console.log('Autoplay waiting for touch:', e));
    }
  }

  // Realistic balloon pop sound
  playPop() {
    this.init();
    if (this.isMuted) return;
    try {
      const ctx = this.ctx;
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.log('Audio error:', e);
    }
  }

  // Magical celestial chime
  playChime() {
    this.init();
    if (this.isMuted) return;
    try {
      const ctx = this.ctx;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.6);
      });
    } catch (e) {
      console.log(e);
    }
  }

  // Celebratory party horn sound
  playHorn() {
    this.init();
    if (this.isMuted) return;
    try {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.linearRampToValueAtTime(440, ctx.currentTime + 0.15); // Slide to A4
      osc.frequency.setValueAtTime(440, ctx.currentTime + 0.4);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.log(e);
    }
  }

  // Candle blowing whoosh sound
  playBlow() {
    this.init();
    if (this.isMuted) return;
    try {
      const ctx = this.ctx;
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.4);
      filter.Q.value = 1;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log(e);
    }
  }

  // Crowd cheer / fanfare celebration
  playCheer() {
    this.init();
    this.playChime();
    setTimeout(() => this.playHorn(), 200);
    setTimeout(() => this.playChime(), 400);
  }
}

window.birthdayAudio = new BirthdayAudio();

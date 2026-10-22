// =============================================================================
// AYSHA'S BIRTHDAY — MAIN CONTROLLER
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  // ── 1. Init 3D Engine ───────────────────────────────────────────────────────
  let cinema3D = null;
  try {
    if (document.getElementById('webgl-canvas-container') && window.BirthdayCinema3D) {
      cinema3D = new BirthdayCinema3D('webgl-canvas-container');
      window.cinema3D = cinema3D;
    }
  } catch (err) {
    console.warn('3D Engine fallback active:', err);
  }

  // State
  const state = { micStream: null, audioAnalyser: null, isListeningToMic: false };

  // ── 2. Entrance Petal Animation ─────────────────────────────────────────────
  const petalsContainer = document.getElementById('entrancePetals');
  if (petalsContainer) {
    for (let i = 0; i < 18; i++) {
      const el = document.createElement('div');
      el.className = 'entrance-petal';
      el.style.left = Math.random() * 100 + '%';
      el.style.animationDuration = (4 + Math.random() * 5) + 's';
      el.style.animationDelay = (Math.random() * 5) + 's';
      el.style.width = (8 + Math.random() * 10) + 'px';
      el.style.height = (12 + Math.random() * 14) + 'px';
      el.style.opacity = 0.5 + Math.random() * 0.4;
      petalsContainer.appendChild(el);
    }
  }

  // ── 3. Scroll Reveal ────────────────────────────────────────────────────────
  const revealEls = document.querySelectorAll('.scroll-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => io.observe(el));

  // ── 4. Entrance Gate ────────────────────────────────────────────────────────
  const enterBtn        = document.getElementById('enterCelebrationBtn');
  const entranceOverlay = document.getElementById('entranceOverlay');
  const musicToggleBtn  = document.getElementById('musicToggleBtn');
  const eqVisualizer    = document.getElementById('eqVisualizer');

  function startCelebration() {
    try {
      if (window.birthdayAudio) window.birthdayAudio.startBGM();
    } catch (e) {
      console.log('Audio init on click:', e);
    }
    updateMusicUI(true);

    setTimeout(() => {
      try {
        if (window.birthdayAudio) window.birthdayAudio.playCheer();
        launchConfettiBurst(0.5, 0.4);
        if (cinema3D && cinema3D.launchFireworks) cinema3D.launchFireworks();
      } catch (e) {}
    }, 400);

    if (window.gsap) {
      gsap.to(entranceOverlay, {
        opacity: 0, scale: 1.04, duration: 0.7, ease: 'power2.out',
        onComplete: () => {
          entranceOverlay.style.display = 'none';
          initHeroTyped();
        }
      });
    } else {
      entranceOverlay.style.transition = 'opacity 0.5s ease';
      entranceOverlay.style.opacity = '0';
      setTimeout(() => {
        entranceOverlay.style.display = 'none';
        initHeroTyped();
      }, 500);
    }
  }

  if (enterBtn) {
    enterBtn.addEventListener('click', startCelebration);
    enterBtn.addEventListener('touchend', (e) => {
      e.preventDefault();
      startCelebration();
    });
  }

  function updateMusicUI(isPlaying) {
    if (eqVisualizer) eqVisualizer.classList.toggle('eq-active', isPlaying);
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
      updateMusicUI(window.birthdayAudio.toggleBGM());
    });
  }

  // ── 5. Typed Hero Text ──────────────────────────────────────────────────────
  function initHeroTyped() {
    if (!window.Typed) return;
    new Typed('#heroTypedText', {
      strings: [
        'To the girl who effortlessly stole my heart 💖✨',
        'The prettiest smile in the entire universe 🌸',
        'Queen of my thoughts, star of my dreams 👑',
        'Wishing you the happiest birthday, my favorite person! 🥂💫',
        'May your day be as breathtaking and sweet as you are 🌹'
      ],
      typeSpeed: 45, backSpeed: 22, backDelay: 2400, loop: true
    });
  }

  // ── 6. Countdown Timer ──────────────────────────────────────────────────────
  const daysEl   = document.getElementById('days');
  const hoursEl  = document.getElementById('hours');
  const minsEl   = document.getElementById('minutes');
  const secsEl   = document.getElementById('seconds');
  const timerTitle         = document.getElementById('timerTitle');
  const celebrationTrigger = document.getElementById('celebrationTriggerBtn');

  // Set birthday: October 23 of current year (adjust as needed!)
  const now = new Date();
  let targetDate = new Date(now.getFullYear(), 9, 23, 0, 0, 0); // month is 0-indexed: 9 = October
  if (targetDate < now) targetDate.setFullYear(now.getFullYear() + 1);

  function pad(n) { return n.toString().padStart(2, '0'); }

  function updateCountdown() {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) {
      [daysEl, hoursEl, minsEl, secsEl].forEach(el => { if (el) el.innerText = '00'; });
      if (timerTitle) timerTitle.innerHTML = "🎉 IT'S AYSHA'S BIRTHDAY! CELEBRATE! 🎉";
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5) / 6e4);
    const s = Math.floor((diff % 6e4) / 1e3);
    if (daysEl) daysEl.innerText  = pad(d);
    if (hoursEl) hoursEl.innerText = pad(h);
    if (minsEl) minsEl.innerText  = pad(m);
    if (secsEl) secsEl.innerText  = pad(s);
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  if (celebrationTrigger) {
    celebrationTrigger.addEventListener('click', () => {
      window.birthdayAudio.playCheer();
      if (timerTitle) timerTitle.innerHTML = "👑 PARTY MODE — HAPPY BIRTHDAY AYSHA! 💖✨";
      if (cinema3D) cinema3D.launchFireworks();
      launchConfettiBurst(0.5, 0.4);
      launchConfettiBurst(0.2, 0.6);
      launchConfettiBurst(0.8, 0.6);
    });
  }

  // ── 7. Mic Candle Blowing ───────────────────────────────────────────────────
  const micBtn     = document.getElementById('micBlowBtn');
  const relightBtn = document.getElementById('relightCandlesBtn');

  if (relightBtn) {
    relightBtn.addEventListener('click', () => { if (cinema3D) cinema3D.relightCandles(); });
  }

  if (micBtn) {
    micBtn.addEventListener('click', async () => {
      if (state.isListeningToMic) { stopMicListening(); return; }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        state.micStream = stream;
        window.birthdayAudio.init();
        const source = window.birthdayAudio.ctx.createMediaStreamSource(stream);
        const analyser = window.birthdayAudio.ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        state.audioAnalyser = analyser;
        state.isListeningToMic = true;
        micBtn.innerHTML = `<i data-lucide="mic-off" class="w-3.5 h-3.5 inline mr-1"></i> Listening... Blow! 🌬️`;
        micBtn.classList.add('animate-pulse', 'bg-rose-600', 'text-white');
        if (window.lucide) lucide.createIcons();
        detectMicBlow();
      } catch {
        alert("Mic denied. Tap the 3D candles directly to blow them out! 🕯️");
      }
    });
  }

  function detectMicBlow() {
    if (!state.isListeningToMic || !state.audioAnalyser) return;
    const data = new Uint8Array(state.audioAnalyser.frequencyBinCount);
    state.audioAnalyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 2; i < 20; i++) sum += data[i];
    if (sum / 18 > 55) {
      if (cinema3D) cinema3D.candles.forEach(c => { if (!c.isExtinguished) cinema3D.extinguishCandle(c); });
      stopMicListening();
      return;
    }
    requestAnimationFrame(detectMicBlow);
  }

  function stopMicListening() {
    state.isListeningToMic = false;
    if (state.micStream) { state.micStream.getTracks().forEach(t => t.stop()); state.micStream = null; }
    if (micBtn) {
      micBtn.innerHTML = `<i data-lucide="mic" class="w-3.5 h-3.5 inline mr-1"></i> Blow Candles with Mic 🎙️`;
      micBtn.classList.remove('animate-pulse', 'bg-rose-600', 'text-white');
      if (window.lucide) lucide.createIcons();
    }
  }

  // ── 8. Gift Modal ───────────────────────────────────────────────────────────
  const closeGiftModalBtn = document.getElementById('closeGiftModalBtn');
  const giftModal         = document.getElementById('giftSurpriseModal');
  if (closeGiftModalBtn && giftModal) {
    closeGiftModalBtn.addEventListener('click', () => giftModal.classList.add('hidden'));
    giftModal.addEventListener('click', (e) => { if (e.target === giftModal) giftModal.classList.add('hidden'); });
  }

  // ── 9. Photo Upload ─────────────────────────────────────────────────────────
  const photoInput    = document.getElementById('photoInput');
  const polaroidImg   = document.getElementById('mainPolaroidImg');
  const savedPhoto    = localStorage.getItem('aysha_birthday_photo');
  if (savedPhoto && polaroidImg) polaroidImg.src = savedPhoto;

  if (photoInput && polaroidImg) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        polaroidImg.src = ev.target.result;
        try { localStorage.setItem('aysha_birthday_photo', ev.target.result); } catch {}
        window.birthdayAudio.playChime();
        launchConfettiBurst(0.5, 0.6);
      };
      reader.readAsDataURL(file);
    });
  }

  // ── 10. Sky Lantern ─────────────────────────────────────────────────────────
  const releaseLanternBtn = document.getElementById('releaseLanternBtn');
  const wishInput         = document.getElementById('wishInput');
  const wishToast         = document.getElementById('wishToast');

  if (releaseLanternBtn) {
    releaseLanternBtn.addEventListener('click', () => {
      if (cinema3D) cinema3D.spawnSkyLantern();
      if (wishInput) wishInput.value = '';
      if (wishToast) {
        wishToast.classList.remove('hidden');
        setTimeout(() => wishToast.classList.add('hidden'), 4000);
      }
    });
  }

  // ── 11. Copy Letter ─────────────────────────────────────────────────────────
  const copyWishBtn   = document.getElementById('copyWishBtn');
  const letterContent = document.getElementById('letterContent');
  const copyToast     = document.getElementById('copyToast');

  if (copyWishBtn && letterContent) {
    copyWishBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(letterContent.innerText).then(() => {
        window.birthdayAudio.playChime();
        if (copyToast) {
          copyToast.classList.remove('hidden');
          setTimeout(() => copyToast.classList.add('hidden'), 3500);
        }
      });
    });
  }

  // ── 12. Confetti & Fireworks Bar ────────────────────────────────────────────
  const blastConfettiBtn  = document.getElementById('blastConfettiBtn');
  const launchFireworksBtn = document.getElementById('launchFireworksBtn');

  if (blastConfettiBtn) {
    blastConfettiBtn.addEventListener('click', () => {
      window.birthdayAudio.playHorn();
      launchConfettiBurst(0.4, 0.5);
      launchConfettiBurst(0.6, 0.5);
      if (cinema3D) cinema3D.launchFireworks();
    });
  }

  if (launchFireworksBtn) {
    launchFireworksBtn.addEventListener('click', () => {
      window.birthdayAudio.playCheer();
      if (cinema3D) cinema3D.launchFireworks();
    });
  }

  function launchConfettiBurst(x, y) {
    if (!window.confetti) return;
    confetti({
      particleCount: 65, spread: 90, origin: { x, y },
      colors: ['#ec4899', '#f43f5e', '#fbbf24', '#a855f7', '#38bdf8', '#ffffff']
    });
  }
});

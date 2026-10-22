// =============================================================================
// CINEMATIC 3D BIRTHDAY EXPERIENCE FOR AYSHA — LITE & BEAUTIFUL
// Three.js r128 | Optimized: Fewer draw calls, no candle shadows, lite geometries
// =============================================================================

class BirthdayCinema3D {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.mainGroup = new THREE.Group();
    this.crownGroup = new THREE.Group();
    this.cakeGroup = new THREE.Group();
    this.candles = [];
    this.balloons = [];
    this.giftBoxes = [];
    this.lanterns = [];
    this.rosePetals = [];
    this.floatingHearts = [];
    this.fireflies = null;

    this.clock = new THREE.Clock();
    this.isAutoSpin = true;

    this.init();
  }

  init() {
    if (!this.container) return;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x070510, 0.010);

    // Camera
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 500);
    this.camera.position.set(0, 11, 28);

    // Renderer — capped at pixel ratio 1.0 for max lite performance
    this.renderer = new THREE.WebGLRenderer({
      antialias: window.devicePixelRatio < 2,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // Lightest shadow mode
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // OrbitControls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.minDistance = 8;
    this.controls.maxDistance = 50;
    this.controls.target.set(0, 4.5, 0);

    // Build scene
    this.setupLighting();
    this.createStarField();
    this.createFallingRosePetals();
    this.createFloatingHearts();
    this.createFireflies();
    this.createFloatingIsland();
    this.createGoldenCrown();
    this.createCake();
    this.createBalloons();
    this.createGiftBoxes();

    // Events
    window.addEventListener('resize', () => this.onResize());
    this.renderer.domElement.addEventListener('pointerdown', (e) => this.onPointerDown(e));

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupLighting() {
    // Warm ambient
    this.scene.add(new THREE.AmbientLight(0xfff0e6, 0.7));

    // Main spot — ONE shadow caster only
    const spot = new THREE.SpotLight(0xfff1e6, 2.8);
    spot.position.set(0, 28, 18);
    spot.angle = Math.PI / 4;
    spot.penumbra = 0.6;
    spot.castShadow = true;
    spot.shadow.mapSize.width = 512;  // Low res shadow map = lite
    spot.shadow.mapSize.height = 512;
    this.scene.add(spot);

    // Accent lights — no shadows
    const pinkLight = new THREE.PointLight(0xec4899, 2.2, 35);
    pinkLight.position.set(-14, 10, -10);
    this.scene.add(pinkLight);

    const goldLight = new THREE.PointLight(0xfbbf24, 2.2, 35);
    goldLight.position.set(14, 10, -10);
    this.scene.add(goldLight);

    const violetLight = new THREE.PointLight(0x8b5cf6, 1.5, 22);
    violetLight.position.set(0, -2, 8);
    this.scene.add(violetLight);
  }

  createStarField() {
    const count = 800; // Was 1500
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 160;
      positions[i + 1] = Math.random() * 80 - 15;
      positions[i + 2] = (Math.random() - 0.5) * 160;

      const r = Math.random();
      if (r < 0.4) { colors[i] = 1; colors[i+1] = 0.85; colors[i+2] = 0.5; }
      else if (r < 0.7) { colors[i] = 1; colors[i+1] = 0.6; colors[i+2] = 0.8; }
      else { colors[i] = 1; colors[i+1] = 1; colors[i+2] = 1; }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.starField = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.55, vertexColors: true, transparent: true, opacity: 0.85
    }));
    this.scene.add(this.starField);
  }

  createFireflies() {
    const count = 30; // Was 60
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 26;
      pos[i + 1] = Math.random() * 16 + 1;
      pos[i + 2] = (Math.random() - 0.5) * 26;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.fireflies = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.9, color: 0xfef08a, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    this.scene.add(this.fireflies);
  }

  createFallingRosePetals() {
    const count = 22; // Was 45
    // Use a shared geometry for performance
    const petalGeo = new THREE.PlaneGeometry(0.5, 0.7);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e, transparent: true, opacity: 0.75,
      side: THREE.DoubleSide, depthWrite: false
    });

    for (let i = 0; i < count; i++) {
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(
        (Math.random() - 0.5) * 34,
        Math.random() * 28 + 5,
        (Math.random() - 0.5) * 34
      );
      petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      this.scene.add(petal);

      this.rosePetals.push({
        mesh: petal,
        speedY: 0.025 + Math.random() * 0.03,
        rotSpeedZ: (Math.random() - 0.5) * 0.03,
        wobble: Math.random() * Math.PI * 2
      });
    }
  }

  createFloatingHearts() {
    // Shared heart geometry
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.3, -0.5, -0.3, -0.5, 0);
    heartShape.bezierCurveTo(-0.5, 0.3, 0, 0.6, 0, 0.9);
    heartShape.bezierCurveTo(0, 0.6, 0.5, 0.3, 0.5, 0);
    heartShape.bezierCurveTo(0.5, -0.3, 0, -0.3, 0, 0);

    const heartGeo = new THREE.ExtrudeGeometry(heartShape, {
      depth: 0.1, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.03, bevelThickness: 0.03
    });
    heartGeo.scale(0.48, -0.48, 0.48);

    const heartMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e, emissive: 0xec4899, emissiveIntensity: 0.6,
      metalness: 0.2, roughness: 0.25
    });

    for (let i = 0; i < 12; i++) { // Was 22
      const heart = new THREE.Mesh(heartGeo, heartMat);
      heart.position.set(
        (Math.random() - 0.5) * 24,
        Math.random() * 20 + 1,
        (Math.random() - 0.5) * 24
      );
      this.scene.add(heart);
      this.floatingHearts.push({
        mesh: heart,
        speedY: 0.012 + Math.random() * 0.016,
        rotSpeedY: (Math.random() - 0.5) * 0.018,
        wobble: Math.random() * Math.PI * 2
      });
    }
  }

  createFloatingIsland() {
    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);

    // Platform — reduced segments
    const islandMat = new THREE.MeshStandardMaterial({ color: 0x151025, roughness: 0.25, metalness: 0.75 });
    const island = new THREE.Mesh(new THREE.CylinderGeometry(13.5, 14.5, 1.2, 48), islandMat);
    island.position.y = -0.6;
    island.receiveShadow = true;
    this.mainGroup.add(island);

    // Radiant gold ring
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.7, metalness: 0.9, roughness: 0.1
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(13.55, 0.15, 12, 80), ringMat);
    ring.rotation.x = Math.PI / 2;
    this.mainGroup.add(ring);
  }

  createGoldenCrown() {
    this.crownGroup = new THREE.Group();
    this.crownGroup.position.set(0, 9.4, 0);

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24, metalness: 0.95, roughness: 0.12,
      emissive: 0xd97706, emissiveIntensity: 0.3
    });

    const baseRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.09, 12, 40), goldMat);
    baseRing.rotation.x = Math.PI / 2;
    this.crownGroup.add(baseRing);

    const peaks = 7;
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xec4899, emissive: 0xbe123c, emissiveIntensity: 1.0, roughness: 0.05, metalness: 0.3
    });

    for (let i = 0; i < peaks; i++) {
      const angle = (i / peaks) * Math.PI * 2;
      const x = Math.cos(angle) * 1.2;
      const z = Math.sin(angle) * 1.2;
      const height = i % 2 === 0 ? 0.75 : 0.48;

      const peakGeo = new THREE.ConeGeometry(0.11, height, 10);
      peakGeo.translate(0, height / 2, 0);
      const peak = new THREE.Mesh(peakGeo, goldMat);
      peak.position.set(x, 0, z);
      this.crownGroup.add(peak);

      // Gem
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), gemMat);
      gem.position.set(x, height, z);
      this.crownGroup.add(gem);
    }

    // Pulsing glow on crown
    this.crownLight = new THREE.PointLight(0xfbbf24, 2.2, 9);
    this.crownLight.position.y = 0.5;
    this.crownGroup.add(this.crownLight);

    this.mainGroup.add(this.crownGroup);
  }

  createCake() {
    this.cakeGroup = new THREE.Group();

    // Stand
    const platterMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, metalness: 0.85, roughness: 0.15 });
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.35, 36), platterMat);
    platter.position.y = 0.18;
    this.cakeGroup.add(platter);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.8, 1.2, 24), platterMat);
    pillar.position.y = -0.5;
    this.cakeGroup.add(pillar);

    // Tier 1 — Strawberry Cream
    const t1 = new THREE.Mesh(
      new THREE.CylinderGeometry(4.4, 4.4, 2.2, 36),
      new THREE.MeshStandardMaterial({ color: 0xffe4e6, roughness: 0.35, metalness: 0.05 })
    );
    t1.position.y = 1.45; t1.castShadow = true; t1.receiveShadow = true;
    this.cakeGroup.add(t1);
    this.addFrostingBeads(this.cakeGroup, 4.45, 0.4, 22, 0xffffff);

    // Tier 2 — Rose Berry
    const t2 = new THREE.Mesh(
      new THREE.CylinderGeometry(3.3, 3.3, 2.0, 36),
      new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3, metalness: 0.08 })
    );
    t2.position.y = 3.55; t2.castShadow = true;
    this.cakeGroup.add(t2);
    this.addFrostingBeads(this.cakeGroup, 3.35, 2.55, 17, 0xfce7f3);

    // Tier 3 — Vanilla Champagne
    const t3 = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 1.8, 36),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.28, metalness: 0.06 })
    );
    t3.position.y = 5.45; t3.castShadow = true;
    this.cakeGroup.add(t3);
    this.addFrostingBeads(this.cakeGroup, 2.25, 4.55, 13, 0xffffff);

    // Berries
    const berryMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.2, metalness: 0.2 });
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), berryMat);
      b.position.set(Math.cos(angle) * 1.4, 6.45, Math.sin(angle) * 1.4);
      this.cakeGroup.add(b);
    }

    // Candles
    const candlePositions = [{ x: -0.85, z: 0 }, { x: 0, z: -0.85 }, { x: 0.85, z: 0.4 }];
    const candleMat = new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 });

    candlePositions.forEach((cp, i) => {
      const cGroup = new THREE.Group();
      cGroup.position.set(cp.x, 6.35, cp.z);

      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 14), candleMat);
      stick.position.y = 0.7;
      cGroup.add(stick);

      const wick = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.22, 6),
        new THREE.MeshBasicMaterial({ color: 0x18181b })
      );
      wick.position.y = 1.45;
      cGroup.add(wick);

      // Flame (MeshBasicMaterial = zero lighting cost)
      const flameGroup = new THREE.Group();
      flameGroup.position.y = 1.65;

      const fOuter = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.48, 12),
        new THREE.MeshBasicMaterial({ color: 0xff7700, transparent: true, opacity: 0.88 })
      );
      fOuter.geometry.translate(0, 0.24, 0);
      flameGroup.add(fOuter);

      const fInner = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.3, 12),
        new THREE.MeshBasicMaterial({ color: 0xffffaa })
      );
      fInner.geometry.translate(0, 0.15, 0);
      flameGroup.add(fInner);

      // NO castShadow on candle lights — big perf win
      const candleLight = new THREE.PointLight(0xffa100, 1.6, 8);
      candleLight.position.y = 1.7;
      cGroup.add(candleLight);

      cGroup.add(flameGroup);
      this.cakeGroup.add(cGroup);

      this.candles.push({ group: cGroup, flame: flameGroup, light: candleLight, isExtinguished: false });
    });

    this.mainGroup.add(this.cakeGroup);
  }

  addFrostingBeads(group, radius, y, count, colorHex) {
    const geo = new THREE.SphereGeometry(0.17, 8, 8); // Lite: 8x8 instead of 12x12
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.2, metalness: 0.05 });
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const bead = new THREE.Mesh(geo, mat);
      bead.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      bead.scale.set(1, 0.75, 1);
      group.add(bead);
    }
  }

  createBalloons() {
    const configs = [
      { color: 0xf43f5e, x: -9,   y: 11, z: 2,  speed: 1.2, msg: "Your smile is genuinely the prettiest thing I have ever seen 😊💖" },
      { color: 0x8b5cf6, x: -11,  y: 13, z: -5, speed: 1.0, msg: "You have no idea how fast my heart beats whenever you look at me 🌸" },
      { color: 0xfbbf24, x: -7,   y: 14, z: -8, speed: 1.4, msg: "The prettiest girl in the world, with the sweetest and gentlest soul 👑✨" },
      { color: 0x06b6d4, x: 8,    y: 12, z: -7, speed: 1.1, msg: "I secretly pray for your happiness, peace & smiles every single day 🌙" },
      { color: 0xec4899, x: 10,   y: 14, z: -2, speed: 1.3, msg: "You make the ordinary moments feel like magic without even trying 💫" },
      { color: 0x10b981, x: 8.5,  y: 11, z: 4,  speed: 0.9, msg: "Happy Birthday to my favorite human and the one who stole my heart 🥂❤️" }
    ];

    configs.forEach((cfg) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(cfg.x, cfg.y, cfg.z);

      // Use MeshStandardMaterial (lighter than MeshPhysicalMaterial)
      const bodyGeo = new THREE.SphereGeometry(1.6, 22, 22); // Was 32x32
      bodyGeo.scale(1, 1.25, 1);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: cfg.color, roughness: 0.18, metalness: 0.3
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.castShadow = false;
      bGroup.add(body);

      const knot = new THREE.Mesh(
        new THREE.ConeGeometry(0.24, 0.34, 12),
        new THREE.MeshStandardMaterial({ color: cfg.color })
      );
      knot.rotation.x = Math.PI;
      knot.position.y = -1.95;
      bGroup.add(knot);

      // String
      const points = [];
      for (let j = 0; j < 14; j++) {
        points.push(new THREE.Vector3(Math.sin(j * 0.5) * 0.14, -2 - j * 0.3, Math.cos(j * 0.5) * 0.09));
      }
      const stringMesh = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 14, 0.02, 4, false),
        new THREE.MeshBasicMaterial({ color: 0xcccccc })
      );
      bGroup.add(stringMesh);

      this.mainGroup.add(bGroup);
      this.balloons.push({
        group: bGroup, mesh: body, initialY: cfg.y,
        speed: cfg.speed, phase: Math.random() * Math.PI * 2,
        isPopped: false, msg: cfg.msg, color: cfg.color
      });
    });
  }

  createGiftBoxes() {
    const configs = [
      {
        x: -5.5, y: 0.9, z: 7.5, boxColor: 0xf43f5e, ribbonColor: 0xfbbf24,
        title: "💌 A Secret Note from My Heart",
        desc: "I may not always say it out loud, but your presence makes my whole world brighter. You are so incredibly special to me, Aysha."
      },
      {
        x: 0, y: 0.9, z: 8.8, boxColor: 0x8b5cf6, ribbonColor: 0xf472b6,
        title: "👑 Queen of My Thoughts",
        desc: "To the girl who rules my thoughts effortlessly with her gentle eyes and sweetest laugh. Happy Birthday my queen!"
      },
      {
        x: 5.5, y: 0.9, z: 7.5, boxColor: 0xf59e0b, ribbonColor: 0xef4444,
        title: "🌹 A Thousand Roses for You",
        desc: "Sending you endless love, warmth, and the sweetest wishes on your special day. Always keep smiling!"
      }
    ];

    configs.forEach((cfg) => {
      const boxGroup = new THREE.Group();
      boxGroup.position.set(cfg.x, cfg.y, cfg.z);

      const baseMat = new THREE.MeshStandardMaterial({ color: cfg.boxColor, roughness: 0.3, metalness: 0.15 });
      const ribMat = new THREE.MeshStandardMaterial({ color: cfg.ribbonColor, metalness: 0.55, roughness: 0.22 });

      const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.8, 2.4), baseMat);
      base.castShadow = true;
      boxGroup.add(base);
      boxGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.82, 2.44), ribMat));
      boxGroup.add(new THREE.Mesh(new THREE.BoxGeometry(2.44, 1.82, 0.35), ribMat));

      const lidGroup = new THREE.Group();
      lidGroup.position.set(0, 0.9, 0);
      const lid = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.45, 2.55), baseMat);
      lid.castShadow = true;
      lidGroup.add(lid);
      lidGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.47, 2.58), ribMat));
      lidGroup.add(new THREE.Mesh(new THREE.BoxGeometry(2.58, 0.47, 0.36), ribMat));

      // Bow
      const bowGeo = new THREE.TorusGeometry(0.38, 0.11, 8, 18);
      const bowL = new THREE.Mesh(bowGeo, ribMat);
      bowL.position.set(-0.24, 0.34, 0); bowL.rotation.y = Math.PI / 4;
      lidGroup.add(bowL);
      const bowR = new THREE.Mesh(bowGeo, ribMat);
      bowR.position.set(0.24, 0.34, 0); bowR.rotation.y = -Math.PI / 4;
      lidGroup.add(bowR);

      boxGroup.add(lidGroup);
      this.mainGroup.add(boxGroup);

      this.giftBoxes.push({ group: boxGroup, lid: lidGroup, isOpened: false, config: cfg });
    });
  }

  onPointerDown(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.mainGroup.children, true);

    if (intersects.length > 0) {
      const hit = intersects[0].object;

      for (let c of this.candles) {
        if (!c.isExtinguished && c.group.getObjectById(hit.id)) {
          this.extinguishCandle(c); return;
        }
      }
      for (let b of this.balloons) {
        if (!b.isPopped && b.group.getObjectById(hit.id)) {
          this.popBalloon(b); return;
        }
      }
      for (let g of this.giftBoxes) {
        if (!g.isOpened && g.group.getObjectById(hit.id)) {
          this.openGiftBox(g); return;
        }
      }
    }
  }

  extinguishCandle(candle) {
    candle.isExtinguished = true;
    if (window.birthdayAudio) window.birthdayAudio.playBlow();

    gsap.to(candle.flame.scale, {
      x: 0, y: 0, z: 0, duration: 0.3,
      onComplete: () => { candle.flame.visible = false; candle.light.intensity = 0; }
    });

    const allOut = this.candles.every(c => c.isExtinguished);
    if (allOut) {
      setTimeout(() => {
        if (window.birthdayAudio) window.birthdayAudio.playCheer();
        this.launchFireworks();
        const card = document.getElementById('cakeWishCard');
        if (card) { card.classList.remove('hidden'); gsap.from(card, { scale: 0.8, opacity: 0, duration: 0.4 }); }
        const relight = document.getElementById('relightCandlesBtn');
        if (relight) relight.classList.remove('hidden');
      }, 300);
    }
  }

  relightCandles() {
    this.candles.forEach(c => {
      c.isExtinguished = false;
      c.flame.visible = true;
      gsap.to(c.flame.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
      c.light.intensity = 1.6;
    });
    if (window.birthdayAudio) window.birthdayAudio.playChime();
    const card = document.getElementById('cakeWishCard');
    if (card) card.classList.add('hidden');
    const relight = document.getElementById('relightCandlesBtn');
    if (relight) relight.classList.add('hidden');
  }

  popBalloon(balloon) {
    balloon.isPopped = true;
    if (window.birthdayAudio) window.birthdayAudio.playPop();
    if (navigator.vibrate) navigator.vibrate([40, 30]);

    const pos = balloon.group.position.clone();
    this.mainGroup.remove(balloon.group);
    this.spawnBalloonShards(pos, balloon.color);

    const unlocked = document.getElementById('unlockedCompliments');
    if (unlocked) {
      const item = document.createElement('div');
      item.className = 'glass-pill p-3 rounded-2xl flex items-center gap-3 text-xs border-l-4 border-pink-400 shadow-lg';
      item.innerHTML = `<span class="text-base">🎈</span><span class="text-white font-medium">${balloon.msg}</span>`;
      unlocked.prepend(item);
      gsap.from(item, { x: -20, opacity: 0, duration: 0.3 });
    }

    if (this.balloons.filter(b => b.isPopped).length >= this.balloons.length) {
      if (window.birthdayAudio) window.birthdayAudio.playCheer();
      this.launchFireworks();
      const banner = document.getElementById('balloonCompleteBanner');
      if (banner) { banner.classList.remove('hidden'); gsap.from(banner, { scale: 0.85, opacity: 0, duration: 0.4 }); }
    }
  }

  spawnBalloonShards(origin, colorHex) {
    const geo = new THREE.TetrahedronGeometry(0.2, 0);
    const mat = new THREE.MeshBasicMaterial({ color: colorHex });
    for (let i = 0; i < 20; i++) { // Was 30
      const s = new THREE.Mesh(geo, mat);
      s.position.copy(origin);
      this.scene.add(s);
      const vx = (Math.random() - 0.5) * 8;
      const vy = (Math.random() - 0.2) * 8;
      const vz = (Math.random() - 0.5) * 8;
      gsap.to(s.position, { x: s.position.x+vx, y: s.position.y+vy, z: s.position.z+vz, duration: 0.8, ease: 'power2.out', onComplete: () => this.scene.remove(s) });
      gsap.to(s.scale, { x: 0, y: 0, z: 0, duration: 0.8 });
    }
  }

  openGiftBox(gift) {
    gift.isOpened = true;
    if (window.birthdayAudio) window.birthdayAudio.playChime();
    if (navigator.vibrate) navigator.vibrate([60]);
    gsap.to(gift.lid.position, { y: 2.8, z: -1.2, duration: 0.6, ease: 'back.out(1.5)' });
    gsap.to(gift.lid.rotation, { x: -Math.PI / 4, duration: 0.6 });

    const pLight = new THREE.PointLight(0xfbbf24, 3, 8);
    pLight.position.set(0, 0.8, 0);
    gift.group.add(pLight);

    const modal = document.getElementById('giftSurpriseModal');
    if (modal) {
      document.getElementById('giftModalTitle').innerText = gift.config.title;
      document.getElementById('giftModalDesc').innerText = gift.config.desc;
      modal.classList.remove('hidden');
      gsap.from(modal.querySelector('.glass-panel'), { scale: 0.85, opacity: 0, duration: 0.35 });
    }
  }

  spawnSkyLantern() {
    const lGroup = new THREE.Group();
    lGroup.position.set((Math.random() - 0.5) * 8, 0.5, 12 + Math.random() * 4);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.7, 1.8, 12),
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.9, roughness: 0.3 })
    );
    lGroup.add(body);
    lGroup.add(new THREE.PointLight(0xf97316, 2, 9));

    this.scene.add(lGroup);
    this.lanterns.push({
      group: lGroup, speedY: 0.05 + Math.random() * 0.03,
      wobbleSpeed: 0.02 + Math.random() * 0.02, wobbleOffset: Math.random() * Math.PI * 2
    });
    if (window.birthdayAudio) window.birthdayAudio.playChime();
  }

  launchFireworks() {
    for (let f = 0; f < 3; f++) {
      setTimeout(() => {
        this.createFireworkExplosion(new THREE.Vector3(
          (Math.random() - 0.5) * 18, 14 + Math.random() * 6, (Math.random() - 0.5) * 14
        ));
      }, f * 350);
    }
  }

  createFireworkExplosion(origin) {
    const colors = [0xf43f5e, 0xfbbf24, 0x8b5cf6, 0x06b6d4, 0xffffff];
    const col = colors[Math.floor(Math.random() * colors.length)];
    const geo = new THREE.SphereGeometry(0.12, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: col });

    for (let i = 0; i < 40; i++) { // Was 60
      const p = new THREE.Mesh(geo, mat);
      p.position.copy(origin);
      this.scene.add(p);

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const spd = 4 + Math.random() * 5;
      const vx = spd * Math.sin(phi) * Math.cos(theta);
      const vy = spd * Math.sin(phi) * Math.sin(theta);
      const vz = spd * Math.cos(phi);

      gsap.to(p.position, { x: p.position.x+vx, y: p.position.y+vy-2, z: p.position.z+vz, duration: 1.2, ease: 'power2.out', onComplete: () => this.scene.remove(p) });
      gsap.to(p.scale, { x: 0, y: 0, z: 0, duration: 1.2 });
    }
  }

  animateCamera(px, py, pz, tx, ty, tz) {
    gsap.to(this.camera.position, { x: px, y: py, z: pz, duration: 1.5, ease: 'power3.inOut' });
    gsap.to(this.controls.target, { x: tx, y: ty, z: tz, duration: 1.5, ease: 'power3.inOut' });
  }

  onResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  animate() {
    requestAnimationFrame(this.animate);
    const time = this.clock.getElapsedTime();

    this.controls.update();

    // Gentle auto-spin
    if (this.isAutoSpin) this.mainGroup.rotation.y += 0.0025;

    // Crown float & spin
    if (this.crownGroup) {
      this.crownGroup.rotation.y += 0.010;
      this.crownGroup.position.y = 9.4 + Math.sin(time * 1.8) * 0.22;
    }

    // Crown light pulse
    if (this.crownLight) {
      this.crownLight.intensity = 2.0 + Math.sin(time * 3) * 0.6;
    }

    // Candle flames flicker
    this.candles.forEach((c, idx) => {
      if (!c.isExtinguished) {
        const noise = Math.sin(time * 14 + idx * 2.5) * 0.14;
        c.flame.rotation.z = noise;
        c.flame.scale.y = 1 + noise * 0.7;
        c.light.intensity = 1.5 + noise * 0.5;
      }
    });

    // Balloons sway
    this.balloons.forEach((b) => {
      if (!b.isPopped) {
        b.group.position.y = b.initialY + Math.sin(time * b.speed + b.phase) * 0.48;
        b.group.rotation.z = Math.sin(time * 0.75 + b.phase) * 0.07;
      }
    });

    // Rose petals fall
    this.rosePetals.forEach((p) => {
      p.mesh.position.y -= p.speedY;
      p.mesh.rotation.z += p.rotSpeedZ;
      p.mesh.position.x += Math.sin(time + p.wobble) * 0.015;
      if (p.mesh.position.y < -2) p.mesh.position.y = 28;
    });

    // Floating hearts drift up
    this.floatingHearts.forEach((h) => {
      h.mesh.position.y += h.speedY;
      h.mesh.rotation.y += h.rotSpeedY;
      h.mesh.position.x += Math.sin(time + h.wobble) * 0.012;
      if (h.mesh.position.y > 30) h.mesh.position.y = -1;
    });

    // Fireflies float
    if (this.fireflies) {
      const pos = this.fireflies.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(time + i) * 0.012;
      }
      this.fireflies.geometry.attributes.position.needsUpdate = true;
    }

    // Lanterns ascend
    for (let i = this.lanterns.length - 1; i >= 0; i--) {
      const l = this.lanterns[i];
      l.group.position.y += l.speedY;
      l.group.position.x += Math.sin(time * l.wobbleSpeed + l.wobbleOffset) * 0.018;
      l.group.rotation.y += 0.005;
      if (l.group.position.y > 60) { this.scene.remove(l.group); this.lanterns.splice(i, 1); }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.BirthdayCinema3D = BirthdayCinema3D;

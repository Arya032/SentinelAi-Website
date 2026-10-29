/**
 * main.js  |  SentinelAI — Ambient Background Canvas + Dedicated 3D Robot Viewport
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. #webgl-canvas (z-index: 0): Ambient Fluid Aura & Floating Particles (No Text Overlap)
 * 2. #robot-webgl-canvas: Dedicated 3D Sentinel Robot placed in between Hero & Section 2
 */

'use strict';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────────────────────────
   1. ZEIGARNIK EFFECT: 2PX TOP PROGRESS BAR
───────────────────────────────────────────────────────────────────────────── */
const progressBar = document.getElementById('top-progress-bar');

ScrollTrigger.create({
  trigger: document.body,
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.1,
  onUpdate: (self) => {
    if (progressBar) {
      progressBar.style.width = `${(self.progress * 100).toFixed(2)}%`;
    }
  }
});


/* ─────────────────────────────────────────────────────────────────────────────
   2. CURSOR SPOTLIGHT TRACKING & NDC
───────────────────────────────────────────────────────────────────────────── */
const spotlight = document.getElementById('cursor-spotlight');
const mouse = { x: 0, y: 0 };
const targetMouse = { x: 0, y: 0 };
const mouseScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', (e) => {
  mouseScreen.x = e.clientX;
  mouseScreen.y = e.clientY;
  targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}, { passive: true });

function updateSpotlight() {
  if (spotlight) {
    spotlight.style.transform = `translate3d(${mouseScreen.x}px, ${mouseScreen.y}px, 0)`;
  }
  requestAnimationFrame(updateSpotlight);
}
updateSpotlight();


/* ─────────────────────────────────────────────────────────────────────────────
   3. BACKGROUND AMBIENT CANVAS (#webgl-canvas, z-index: 0 — Clean Ambient Aura)
───────────────────────────────────────────────────────────────────────────── */
(function initAmbientBackgroundCanvas() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07080a);

  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  scene.add(new THREE.AmbientLight(0x07080a, 2.0));

  const cyanLight = new THREE.PointLight(0x00f2fe, 3.5, 16);
  cyanLight.position.set(-3, 2, 2);
  scene.add(cyanLight);

  const mintLight = new THREE.PointLight(0x10b981, 2.0, 14);
  mintLight.position.set(3, -2, 1);
  scene.add(mintLight);

  // Floating background ambient particles
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let pt = 0; pt < particleCount * 3; pt += 3) {
    particlePos[pt] = (Math.random() - 0.5) * 18;
    particlePos[pt + 1] = (Math.random() - 0.5) * 14;
    particlePos[pt + 2] = -2 - Math.random() * 6;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

  const isMobileScreen = window.innerWidth < 640;
  const particleMat = new THREE.PointsMaterial({
    color: 0x00f2fe,
    size: isMobileScreen ? 0.022 : 0.036,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const clock = new THREE.Clock();

  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    cyanLight.intensity = 3.0 + Math.sin(t * 1.0) * 1.0;
    mintLight.intensity = 1.8 + Math.cos(t * 0.8) * 0.6;
    particles.rotation.y = t * 0.015;

    renderer.render(scene, camera);
  }

  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   4. DEDICATED 3D SENTINEL ROBOT (#robot-webgl-canvas — Placed in Between)
───────────────────────────────────────────────────────────────────────────── */
(function initSentinelRobotDedicatedScene() {
  const canvas = document.getElementById('robot-webgl-canvas');
  const container = document.getElementById('robot-canvas-container');
  if (!canvas || !container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 500;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true, // Transparent so background shows through
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
  camera.position.set(0, 0, 7.0);

  // Lighting for Cute Robot
  scene.add(new THREE.AmbientLight(0x1a2a4a, 3.8)); // boosted so robot is visible against dark bg

  const keyLight = new THREE.DirectionalLight(0xffffff, 4.5); // brightened
  keyLight.position.set(4, 6, 5);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00f2fe, 2.0);
  const frontLight = new THREE.DirectionalLight(0xffffff, 3.0);
  frontLight.position.set(0, 2, 8); // directly toward the camera = frontal lighting
  scene.add(frontLight);
  fillLight.position.set(-5, -2, 3);
  scene.add(fillLight);

  const robotCoreLight = new THREE.PointLight(0x00f2fe, 5.0, 16);
  robotCoreLight.position.set(0, 0, 0);
  scene.add(robotCoreLight);

  // Cybernetic Sentinel Materials (Titanium White Armor + Deep Obsidian Chassis + Dark Gloss Visor + Energy Emissive)
  const pearlArmorMat = new THREE.MeshPhongMaterial({
    color: 0xf1f5f9,
    specular: 0x38bdf8,
    shininess: 90
  });

  const darkArmorMat = new THREE.MeshPhongMaterial({
    color: 0x090d16,
    specular: 0x00f2fe,
    shininess: 120
  });

  const visorMat = new THREE.MeshPhongMaterial({
    color: 0x030712,
    specular: 0x38bdf8,
    shininess: 140
  });

  const cyanEmissiveMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  const coreGlowMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
  const holoRingMat = new THREE.MeshBasicMaterial({
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  });

  // Construct Robot Architecture
  const robotGroup = new THREE.Group();
  scene.add(robotGroup);

  // Responsive Layout Positioning across Screen Sizes:
  // - Desktop (1024px+): Anchored cleanly on the left (-1.45) with scale 1.05
  // - Tablet (768px - 1023px): Offset left (-1.15) with scale 0.92
  // - Standard Mobile (381px - 767px): Centered at (0, 0.80, 0) with scale 0.82
  // - Small / Ultra-Small Mobile (<= 380px): Centered higher at (0, 1.22, 0) with scale 0.60
  function updateRobotLayoutPosition() {
    const width = window.innerWidth;
    if (width >= 1024) {
      robotGroup.position.set(-1.45, 0, 0);
      robotGroup.scale.set(1.05, 1.05, 1.05);
    } else if (width >= 768) {
      robotGroup.position.set(-1.15, 0, 0);
      robotGroup.scale.set(0.92, 0.92, 0.92);
    } else if (width <= 380) {
      robotGroup.position.set(0, 1.22, 0);
      robotGroup.scale.set(0.60, 0.60, 0.60);
    } else {
      robotGroup.position.set(0, 1.16, 0);
      robotGroup.scale.set(0.66, 0.66, 0.66);
    }
  }
  updateRobotLayoutPosition();

  // 1. Cybernetic Helmet & Head Pod
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.1, 0);
  robotGroup.add(headGroup);

  // Outer Helm Shell: Aerodynamic, sleek pod
  const helmGeo = new THREE.SphereGeometry(0.95, 32, 32);
  helmGeo.scale(1.05, 0.95, 1.0);
  const helmMesh = new THREE.Mesh(helmGeo, pearlArmorMat);
  headGroup.add(helmMesh);

  // Top Aerodynamic Crest / Thermal Exhaust Fin
  const crestGeo = new THREE.BoxGeometry(0.08, 0.22, 0.85);
  const crestMesh = new THREE.Mesh(crestGeo, darkArmorMat);
  crestMesh.position.set(0, 0.92, -0.05);
  crestMesh.rotation.x = -0.15;
  headGroup.add(crestMesh);

  // Curved Panoramic Obsidian Visor
  const visorGeo = new THREE.CylinderGeometry(0.88, 0.82, 0.52, 32, 1, false, -Math.PI * 0.42, Math.PI * 0.84);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, 0.05, 0.36);
  headGroup.add(visorMesh);

  // Dual Cyber Optic Slits (High-tech horizontal reticles)
  const opticGeo = new THREE.BoxGeometry(0.24, 0.055, 0.04);
  const eyeLeft = new THREE.Mesh(opticGeo, cyanEmissiveMat);
  eyeLeft.position.set(-0.35, 0.08, 1.02);
  headGroup.add(eyeLeft);

  const eyeRight = new THREE.Mesh(opticGeo, cyanEmissiveMat);
  eyeRight.position.set(0.35, 0.08, 1.02);
  headGroup.add(eyeRight);

  // Active Laser Scanline Reticle across visor
  const scanlineGeo = new THREE.BoxGeometry(0.88, 0.015, 0.03);
  const scanlineMesh = new THREE.Mesh(scanlineGeo, cyanEmissiveMat);
  scanlineMesh.position.set(0, 0.05, 1.03);
  headGroup.add(scanlineMesh);

  // Tactical Sensor Pods (Side Ears)
  const earGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.14, 24);
  earGeo.rotateZ(Math.PI / 2);
  const earLeft = new THREE.Mesh(earGeo, darkArmorMat);
  earLeft.position.set(-1.02, 0.02, 0);
  headGroup.add(earLeft);

  const earCoreGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.15, 16);
  earCoreGeo.rotateZ(Math.PI / 2);
  const earCoreLeft = new THREE.Mesh(earCoreGeo, cyanEmissiveMat);
  earCoreLeft.position.set(-1.03, 0.02, 0);
  headGroup.add(earCoreLeft);

  const earRight = new THREE.Mesh(earGeo, darkArmorMat);
  earRight.position.set(1.02, 0.02, 0);
  headGroup.add(earRight);

  const earCoreRight = new THREE.Mesh(earCoreGeo, cyanEmissiveMat);
  earCoreRight.position.set(1.03, 0.02, 0);
  headGroup.add(earCoreRight);

  // 2. Articulated Neck Collar & Glow Ring
  const neckGeo = new THREE.CylinderGeometry(0.38, 0.44, 0.22, 24);
  const neckMesh = new THREE.Mesh(neckGeo, darkArmorMat);
  neckMesh.position.set(0, 0.22, 0);
  robotGroup.add(neckMesh);

  const neckRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 16, 32), cyanEmissiveMat);
  neckRing.rotation.x = Math.PI / 2;
  neckRing.position.set(0, 0.22, 0);
  robotGroup.add(neckRing);

  // 3. Chiseled Armored Torso Chassis & Hex Core Reactor
  const chestGeo = new THREE.CylinderGeometry(0.72, 0.58, 0.95, 32);
  const chestMesh = new THREE.Mesh(chestGeo, pearlArmorMat);
  chestMesh.position.set(0, -0.38, 0);
  robotGroup.add(chestMesh);

  const sternumGeo = new THREE.BoxGeometry(0.44, 0.75, 0.25);
  const sternumMesh = new THREE.Mesh(sternumGeo, darkArmorMat);
  sternumMesh.position.set(0, -0.36, 0.56);
  robotGroup.add(sternumMesh);

  // Hexagonal Core Reactor in Center of Chest
  const coreGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 6);
  coreGeo.rotateX(Math.PI / 2);
  const reactorCore = new THREE.Mesh(coreGeo, coreGlowMat);
  reactorCore.position.set(0, -0.34, 0.7);
  robotGroup.add(reactorCore);

  const coreHalo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.02, 16, 32), cyanEmissiveMat);
  coreHalo.position.set(0, -0.34, 0.7);
  robotGroup.add(coreHalo);

  // Floating Holographic Orbital Defense Ring
  const ringGeo = new THREE.TorusGeometry(1.65, 0.015, 16, 64);
  const orbitalRing = new THREE.Mesh(ringGeo, holoRingMat);
  orbitalRing.rotation.x = Math.PI / 3;
  orbitalRing.rotation.y = Math.PI / 6;
  orbitalRing.position.set(0, -0.35, 0);
  robotGroup.add(orbitalRing);

  // 4. Armored Cybernetic Arms
  const shoulderGeo = new THREE.SphereGeometry(0.24, 24, 24);
  const armGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 16);

  const armRightGroup = new THREE.Group();
  armRightGroup.position.set(0.85, -0.15, 0);
  robotGroup.add(armRightGroup);

  const shoulderRight = new THREE.Mesh(shoulderGeo, darkArmorMat);
  armRightGroup.add(shoulderRight);

  const armRightMesh = new THREE.Mesh(armGeo, pearlArmorMat);
  armRightMesh.position.set(0.2, -0.35, 0.05);
  armRightMesh.rotation.z = -0.35;
  armRightGroup.add(armRightMesh);

  const gauntletRight = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.16), darkArmorMat);
  gauntletRight.position.set(0.32, -0.55, 0.08);
  armRightGroup.add(gauntletRight);

  const armLeftGroup = new THREE.Group();
  armLeftGroup.position.set(-0.85, -0.15, 0);
  robotGroup.add(armLeftGroup);

  const shoulderLeft = new THREE.Mesh(shoulderGeo, darkArmorMat);
  armLeftGroup.add(shoulderLeft);

  const armLeftMesh = new THREE.Mesh(armGeo, pearlArmorMat);
  armLeftMesh.position.set(-0.2, -0.35, 0.05);
  armLeftMesh.rotation.z = 0.35;
  armLeftGroup.add(armLeftMesh);

  const gauntletLeft = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.28, 0.16), darkArmorMat);
  gauntletLeft.position.set(-0.32, -0.55, 0.08);
  armLeftGroup.add(gauntletLeft);

  // 5. Lower Armor Chassis & Twin Pylon Thrusters
  const waistGeo = new THREE.CylinderGeometry(0.52, 0.42, 0.35, 24);
  const waistMesh = new THREE.Mesh(waistGeo, darkArmorMat);
  waistMesh.position.set(0, -0.95, 0);
  robotGroup.add(waistMesh);

  const thrusterGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.4, 20);
  const thrusterLeft = new THREE.Mesh(thrusterGeo, pearlArmorMat);
  thrusterLeft.position.set(-0.32, -1.25, 0);
  robotGroup.add(thrusterLeft);

  const thrusterRight = new THREE.Mesh(thrusterGeo, pearlArmorMat);
  thrusterRight.position.set(0.32, -1.25, 0);
  robotGroup.add(thrusterRight);

  const thrusterGlowGeo = new THREE.CylinderGeometry(0.11, 0.08, 0.06, 16);
  const thrusterGlowLeft = new THREE.Mesh(thrusterGlowGeo, cyanEmissiveMat);
  thrusterGlowLeft.position.set(-0.32, -1.45, 0);
  robotGroup.add(thrusterGlowLeft);

  const thrusterGlowRight = new THREE.Mesh(thrusterGlowGeo, cyanEmissiveMat);
  thrusterGlowRight.position.set(0.32, -1.45, 0);
  robotGroup.add(thrusterGlowRight);

  // Aerodynamic Ion Hover Thruster Plumes
  const thrusterFlameGeo = new THREE.ConeGeometry(0.10, 0.28, 16);
  thrusterFlameGeo.rotateX(Math.PI);
  const thrusterFlameMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.85 });
  const flameLeft = new THREE.Mesh(thrusterFlameGeo, thrusterFlameMat);
  flameLeft.position.set(-0.32, -1.62, 0);
  robotGroup.add(flameLeft);

  const flameRight = new THREE.Mesh(thrusterFlameGeo, thrusterFlameMat);
  flameRight.position.set(0.32, -1.62, 0);
  robotGroup.add(flameRight);

  // Scroll Trigger attached specifically to #robot-section
  const ROBOT_STATE = { scrollProgress: 0 };

  gsap.to(ROBOT_STATE, {
    scrollProgress: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '#robot-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1.2
    }
  });

  let currentExpression = 'IDLE'; // 'IDLE' | 'THINKING' | 'RESPONDING' | 'SAFETY_CONFIRMED'
  let expressionTimeout = null;

  window.setRobotExpressionState = function(state, autoResetMs = 0) {
    currentExpression = state;
    if (expressionTimeout) clearTimeout(expressionTimeout);

    const statusText = document.getElementById('robot-status-text');
    const statusDot = document.getElementById('robot-status-dot');
    const speechBubble = document.getElementById('speech-bubble');
    const speechHeaderTitle = document.getElementById('speech-header-title');

    if (speechBubble) {
      speechBubble.classList.remove('speech-bubble-mint', 'speech-bubble-amber');
    }

    if (state === 'THINKING') {
      if (statusText) statusText.innerText = 'Autonomous CYENEX // Analyzing Telemetry...';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#f59e0b] animate-ping'; }
      if (speechBubble) speechBubble.classList.add('speech-bubble-amber');
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'Neural Kernel Processing...';
    } else if (state === 'RESPONDING') {
      if (statusText) statusText.innerText = 'Autonomous CYENEX // Explaining Security Decision';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse'; }
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'CYENEX.AI Digital Teammate';
    } else if (state === 'SAFETY_CONFIRMED') {
      if (statusText) statusText.innerText = 'Autonomous CYENEX // 100% Fleet Quarantine Safe';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#10b981] animate-bounce'; }
      if (speechBubble) speechBubble.classList.add('speech-bubble-mint');
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'Fleet Protected // Zero Overhead';
    } else {
      if (statusText) statusText.innerText = 'Autonomous CYENEX // Live eBPF Guard Active';
      if (statusDot) { statusDot.className = 'w-2 h-2 rounded-full bg-[#10b981] animate-pulse'; }
      if (speechHeaderTitle) speechHeaderTitle.innerText = 'CYENEX.AI Digital Teammate';
    }

    if (autoResetMs > 0) {
      expressionTimeout = setTimeout(() => {
        window.setRobotExpressionState('IDLE');
      }, autoResetMs);
    }
  };

  const clock = new THREE.Clock();
  const colorCyan = new THREE.Color(0x00f2fe);
  const colorAmber = new THREE.Color(0xf59e0b);
  const colorMint = new THREE.Color(0x10b981);
  const currentColor = new THREE.Color(0x00f2fe);
  const speechCloudWrapper = document.getElementById('speech-cloud-wrapper');

  function tick() {
    requestAnimationFrame(tick);
    const elapsedTime = clock.getElapsedTime();
    const prog = ROBOT_STATE.scrollProgress;

    // Mouse tracking lerp — robot stays facing forward and smoothly tracks cursor
    mouse.x += (targetMouse.x - mouse.x) * 0.08;
    mouse.y += (targetMouse.y - mouse.y) * 0.08;

    // Clear any inline transform so speech console follows pure responsive CSS layout with zero overlap
    if (speechCloudWrapper && speechCloudWrapper.style.transform) {
      speechCloudWrapper.style.transform = '';
    }

    // Active orbital defense ring & scanline reticle animations
    orbitalRing.rotation.z += 0.006;
    orbitalRing.rotation.x = Math.PI / 3 + Math.sin(elapsedTime * 1.5) * 0.05;
    scanlineMesh.position.y = 0.05 + Math.sin(elapsedTime * 3.5) * 0.12;

    // Synchronized Sentinel Expression & Pose Loop
    if (currentExpression === 'THINKING') {
      headGroup.rotation.y = mouse.x * 0.25;
      headGroup.rotation.z = Math.sin(elapsedTime * 8.0) * 0.08;
      armRightGroup.rotation.z = 0.4 + Math.sin(elapsedTime * 4.0) * 0.08;

      const pulseT = (Math.sin(elapsedTime * 10.0) + 1) / 2;
      currentColor.lerpColors(colorCyan, colorAmber, pulseT);

    } else if (currentExpression === 'RESPONDING') {
      const vocalPulse = (Math.sin(elapsedTime * 14.0) + 1) / 2;
      currentColor.lerpColors(colorCyan, colorMint, vocalPulse * 0.45);

      headGroup.rotation.z = -0.08 + Math.sin(elapsedTime * 5.0) * 0.03;
      headGroup.rotation.x = -mouse.y * 0.15 + Math.sin(elapsedTime * 6.0) * 0.04;
      headGroup.rotation.y = 0.12 + mouse.x * 0.18;

      armRightGroup.rotation.z = Math.sin(elapsedTime * 3.5) * 0.15 + 0.1;

    } else if (currentExpression === 'SAFETY_CONFIRMED') {
      headGroup.rotation.y = mouse.x * 0.3;
      headGroup.rotation.x = Math.sin(elapsedTime * 6.0) * 0.06;
      headGroup.rotation.z = Math.sin(elapsedTime * 4.0) * 0.03;
      armRightGroup.rotation.z = 0.35 + Math.sin(elapsedTime * 5.0) * 0.1;

      currentColor.copy(colorMint);

    } else { // IDLE
      headGroup.rotation.y = mouse.x * 0.45;
      headGroup.rotation.x = -mouse.y * 0.25;
      headGroup.rotation.z = mouse.x * 0.06;

      robotGroup.rotation.y = mouse.x * 0.18;
      robotGroup.rotation.x = -mouse.y * 0.1;

      armRightGroup.rotation.z = Math.sin(elapsedTime * 3.2) * 0.12 + 0.05;

      if (prog < 0.5) {
        const t1 = prog / 0.5;
        currentColor.lerpColors(colorCyan, colorAmber, t1);
      } else {
        const t2 = (prog - 0.5) / 0.5;
        currentColor.lerpColors(colorAmber, colorMint, t2);
      }
    }

    eyeLeft.material.color.copy(currentColor);
    eyeRight.material.color.copy(currentColor);
    scanlineMesh.material.color.copy(currentColor);
    earCoreLeft.material.color.copy(currentColor);
    earCoreRight.material.color.copy(currentColor);
    neckRing.material.color.copy(currentColor);
    reactorCore.material.color.copy(currentColor);
    coreHalo.material.color.copy(currentColor);
    orbitalRing.material.color.copy(currentColor);
    thrusterGlowLeft.material.color.copy(currentColor);
    thrusterGlowRight.material.color.copy(currentColor);
    const flamePulse = 1 + Math.sin(elapsedTime * 14.0) * 0.18;
    flameLeft.scale.set(flamePulse, flamePulse, flamePulse);
    flameRight.scale.set(flamePulse, flamePulse, flamePulse);
    flameLeft.material.color.copy(currentColor);
    flameRight.material.color.copy(currentColor);
    robotCoreLight.color.copy(currentColor);

    renderer.render(scene, camera);
  }

  tick();

  // Fix: re-sync renderer size after Tailwind CSS + fonts finish layout.
  // Three.js initializes before Tailwind applies min-h classes, so container
  // height can be 0. A tiny delay lets the browser do a full layout pass.
  function resizeRobotRenderer() {
    var w = container.clientWidth || window.innerWidth;
    var h = container.clientHeight || 580;
    if (h < 100) h = 580; // fallback if still not laid out
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateRobotLayoutPosition();
  }

  // Try at 50ms, 200ms, and 600ms to catch all timing scenarios
  setTimeout(resizeRobotRenderer, 50);
  setTimeout(resizeRobotRenderer, 200);
  setTimeout(resizeRobotRenderer, 600);
  window.addEventListener('load', resizeRobotRenderer);

  window.addEventListener('resize', () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || 500;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    updateRobotLayoutPosition();
    ScrollTrigger.refresh();
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   5. 3D SPEECH CLOUD DIALOGUE & LIVE AI STREAMING ENGINE (CLIENT-SIDE)
───────────────────────────────────────────────────────────────────────────── */
(function initSpeechCloudDialogueController() {
  const speechText = document.getElementById('speech-text');
  const speechForm = document.getElementById('speech-form');
  const speechInput = document.getElementById('speech-input');
  const quickChips = document.querySelectorAll('.quick-chip');

  if (!speechText || !speechForm || !speechInput) return;

  const SYSTEM_INSTRUCTION = `You are CYENEX.AI, a friendly and reassuring AI cybersecurity assistant built for everyday business owners, office teams, and professionals.
You specialize in protecting laptops, mobile phones, and servers from viruses, ransomware, phishing emails, and online fraud.
Guidelines:
- Explain things in clear, plain English without confusing technical jargon.
- Keep answers warm, reassuring, and concise (2-3 short sentences or simple bullet points).
- Emphasize that CYENEX works quietly in the background on all platforms (Windows, macOS, Linux, Android, iOS, and Servers).
- Emphasize that it never slows down computers (guaranteed under 4% CPU load) and has zero setup hassle starting at just ₹149/user/month with a 14-day free trial.`;

  const KNOWLEDGE_BASE = {
    "Does it work on Android, iOS & Servers?": "Yes! CYENEX protects all your devices—Windows PCs, MacBooks, Linux workstations, Android phones, iPhones/iPads, and cloud/office servers—all visible from one simple centralized dashboard.",
    "Will it slow down my computer?": "Never. Traditional antivirus freezes your screen and slows your computer down. CYENEX uses less than 4% of your computer's power, so your apps, video calls, and daily tasks run at full speed without interruptions.",
    "How do you handle fake emails and scams?": "CYENEX automatically checks suspicious links, fake invoice attachments, and impersonation attempts in real time. It blocks malicious files before they can open, keeping your passwords and bank details completely safe.",
    "Show an alert translation example": "Instead of scary error codes like 'Trojan.Win32 0x8007', you get a simple 10-second alert: 'Someone clicked a suspicious link in a fake invoice email. CYENEX stopped the threat instantly in 0.18s. Your computer and bank logins are 100% safe.'",
    "Can I protect just 1 or 2 computers?": "Absolutely! There are no minimum device requirements. You can start protecting a single computer or phone for just ₹149/user/month, with a 14-day free trial and no credit card required."
  };

  // Conversational Multi-turn History (in-memory)
  const chatHistory = [];
  let isStreaming = false;

  // ─── Environment API Key Resolver ──────────────────────────────────────────
  function getEnvironmentKey() {
    // 1. Injected in GitHub Pages via GitHub Actions secrets, or locally via config.js
    if (typeof window !== 'undefined' && window.SENTINEL_CONFIG && window.SENTINEL_CONFIG.API_KEY) {
      return String(window.SENTINEL_CONFIG.API_KEY).trim();
    }
    // 2. Fallback for optional local dev localStorage override
    try {
      return localStorage.getItem('sentinel_api_key')?.trim() || '';
    } catch (e) {
      return '';
    }
  }

  // ─── Markdown Formatter ───────────────────────────────────────────────────
  function formatMarkdown(text) {
    if (!text) return '';
    // Escape standard HTML first
    let escaped = text.replace(/[&<>'"]/g,
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );

    // Format backtick code snippets
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Format bold **text**
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Format italic *text*
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Format bullet points lines
    const lines = escaped.split('\n');
    let inList = false;
    const formattedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) {
          formattedLines.push('<ul>');
          inList = true;
        }
        formattedLines.push(`<li>${line.slice(2)}</li>`);
      } else {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        formattedLines.push(line);
      }
    }
    if (inList) formattedLines.push('</ul>');

    return formattedLines.join('<br>').replace(/<br><\/ul>/g, '</ul>').replace(/<ul><br>/g, '<ul>');
  }

  // ─── Live Autonomous AI Streaming Engine ─────────────────────────────────
  async function streamLiveContent(queryText, apiKey) {
    isStreaming = true;
    speechText.innerHTML = '<span class="text-[#00f2fe]">Analyzing telemetry &amp; query...</span><span class="inline-block w-1.5 h-3 bg-[#00f2fe] ml-1 animate-pulse"></span>';

    // Append user message to multi-turn history (keep last 10 messages)
    chatHistory.push({ role: 'user', parts: [{ text: queryText }] });
    const trimmedHistory = chatHistory.slice(-10);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

    const requestBody = {
      contents: trimmedHistory,
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }]
      },
      generationConfig: {
        temperature: 0.65,
        maxOutputTokens: 500
      }
    };

    let accumulatedText = '';
    let hasStartedResponding = false;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6).trim();
            if (!dataStr || dataStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(dataStr);
              const partText = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (partText) {
                accumulatedText += partText;
                if (!hasStartedResponding) {
                  hasStartedResponding = true;
                  if (window.setRobotExpressionState) window.setRobotExpressionState('RESPONDING');
                }
                speechText.innerHTML = formatMarkdown(accumulatedText) + '<span class="inline-block w-1.5 h-3 bg-[#00f2fe] ml-1 animate-pulse"></span>';
                speechText.scrollTop = speechText.scrollHeight;
              }
            } catch (jsonErr) {}
          }
        }
      }

      // Finish response
      chatHistory.push({ role: 'model', parts: [{ text: accumulatedText }] });
      speechText.innerHTML = formatMarkdown(accumulatedText);
      isStreaming = false;

      if (window.setRobotExpressionState) {
        window.setRobotExpressionState('SAFETY_CONFIRMED', 3800);
      }
    } catch (err) {
      // Fallback seamlessly to local autonomous knowledge base without error popups
      const fallbackAns = generateSmartAnswer(queryText);
      streamLocalAnswer(fallbackAns);
    }
  }

  // ─── Local Knowledge Base Fallback Streamer ──────────────────────────────
  function streamLocalAnswer(fullText) {
    isStreaming = true;
    if (window.setRobotExpressionState) window.setRobotExpressionState('RESPONDING');

    speechText.innerHTML = '';
    let charIdx = 0;

    const interval = setInterval(() => {
      speechText.innerHTML = formatMarkdown(fullText.substring(0, charIdx + 1)) + '<span class="inline-block w-1.5 h-3 bg-[#00f2fe] ml-1 animate-pulse"></span>';
      speechText.scrollTop = speechText.scrollHeight;
      charIdx++;

      if (charIdx >= fullText.length) {
        clearInterval(interval);
        speechText.innerHTML = formatMarkdown(fullText);
        isStreaming = false;
        if (window.setRobotExpressionState) {
          window.setRobotExpressionState('SAFETY_CONFIRMED', 3800);
        }
      }
    }, 18);
  }

  function handleQuery(queryText) {
    if (!queryText.trim() || isStreaming) return;

    speechInput.value = '';
    if (window.setRobotExpressionState) window.setRobotExpressionState('THINKING');

    const apiKey = getEnvironmentKey();

    if (apiKey) {
      streamLiveContent(queryText, apiKey);
    } else {
      setTimeout(() => {
        let answer = KNOWLEDGE_BASE[queryText];
        if (!answer) {
          answer = generateSmartAnswer(queryText);
        }
        streamLocalAnswer(answer);
      }, 400);
    }
  }

  function generateSmartAnswer(input) {
    const lower = input.toLowerCase();
    if (lower.includes('build') || lower.includes('cargo') || lower.includes('npm') || lower.includes('cpu') || lower.includes('slow')) {
      return "CYENEX.AI guarantees < 3.8% CPU overhead. In-kernel eBPF/ETW ring buffers recognize dev toolchains (`node`, `cargo`, `docker`) and inspect asynchronously with zero build lag!";
    }
    if (lower.includes('ransomware') || lower.includes('ghost') || lower.includes('encrypt') || lower.includes('trojan')) {
      return "CYENEX.AI detects behavioral encryption and anomalous shadow copy tampering at the kernel level, arresting ransomware execution within 0.18s before data is locked.";
    }
    if (lower.includes('phish') || lower.includes('deepfake') || lower.includes('spoof') || lower.includes('social engineering')) {
      return "CYENEX.AI neutralizes AI-crafted phishing and credential spoofing in real time, isolating malicious payloads before session tokens or OTPs can be intercepted.";
    }
    if (lower.includes('supply') || lower.includes('jenkins') || lower.includes('pipeline') || lower.includes('package')) {
      return "Our in-kernel eBPF sensors intercept suspicious build-script executions and reverse shells, stopping supply chain compromises without impacting build throughput.";
    }
    if (lower.includes('alert') || lower.includes('slack') || lower.includes('teams') || lower.includes('translate')) {
      return "We eliminate alert paralysis! Threat trees are translated into 10-second plain-English Slack or Teams cards with 1-click contextual resolution.";
    }
    if (lower.includes('deploy') || lower.includes('install') || lower.includes('curl') || lower.includes('command')) {
      return "Deploy fleet-wide in under 3 minutes: run `curl -fsSL https://get.sentinel.ai | sh` on Linux/macOS or via PowerShell on Windows. No sales calls needed.";
    }
    if (lower.includes('price') || lower.includes('cost') || lower.includes('seat')) {
      return "Pricing is $8/device/mo with a 1-seat minimum and 14-day free pilot. No 50-seat distributor minimums and no annual lock-in!";
    }
    return "CYENEX.AI provides developer-first endpoint security with zero build lag, plain-English incident cards, and 3-minute self-serve deployment.";
  }

  speechForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleQuery(speechInput.value);
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) handleQuery(prompt);
    });
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   6. INTERACTIVE CARD 3D MICRO-TILT & DYNAMIC LIGHTING
───────────────────────────────────────────────────────────────────────────── */
(function initInteractiveHoverEngine() {
  // Smooth micro-tilt on interactive cards without breaking CSS transitions
  const interactiveCards = document.querySelectorAll('.hover-tilt-card');
  interactiveCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const tiltX = (y / (rect.height / 2)) * -3.5;
      const tiltY = (x / (rect.width / 2)) * 3.5;
      gsap.to(card, {
        rotationX: tiltX,
        rotationY: tiltY,
        transformPerspective: 900,
        duration: 0.25,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.45,
        ease: 'power2.out',
        clearProps: 'transform'
      });
    });
  });
})();


/* ─────────────────────────────────────────────────────────────────────────────
   7. INTERACTIVE LOGIN & SIGNUP AUTH MODAL SYSTEM
───────────────────────────────────────────────────────────────────────────── */
(function initAuthModalController() {
  const authModal = document.getElementById('auth-modal');
  const authModalCard = document.getElementById('auth-modal-card');
  const authModalClose = document.getElementById('auth-modal-close');
  const authModalSubtitle = document.getElementById('auth-modal-subtitle');
  
  const navLoginBtn = document.getElementById('nav-login-btn');
  const mobileNavLoginBtn = document.getElementById('mobile-nav-login-btn');
  const navCtaBtn = document.getElementById('nav-cta-btn');
  const heroCtaBtn = document.getElementById('hero-cta-btn');
  
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabSignupBtn = document.getElementById('tab-signup-btn');
  const formLogin = document.getElementById('form-login');
  const formSignup = document.getElementById('form-signup');
  const authToast = document.getElementById('auth-toast');
  const authToastMsg = document.getElementById('auth-toast-msg');

  if (!authModal || !authModalCard) return;

  function openModal(mode = 'login') {
    authModal.classList.remove('hidden');
    // Trigger transition
    requestAnimationFrame(() => {
      authModal.classList.remove('opacity-0');
      authModalCard.classList.remove('scale-95');
      authModalCard.classList.add('scale-100');
    });
    switchTab(mode);
  }

  function closeModal() {
    authModal.classList.add('opacity-0');
    authModalCard.classList.remove('scale-100');
    authModalCard.classList.add('scale-95');
    setTimeout(() => {
      authModal.classList.add('hidden');
      if (authToast) authToast.classList.add('hidden');
    }, 300);
  }

  function switchTab(mode) {
    if (authToast) authToast.classList.add('hidden');
    if (mode === 'login') {
      formLogin.classList.remove('hidden');
      formSignup.classList.add('hidden');
      tabLoginBtn.className = 'py-2.5 rounded-xl transition-all text-white bg-[#00f2fe]/15 border border-[#00f2fe]/40 shadow-sm cursor-pointer';
      tabSignupBtn.className = 'py-2.5 rounded-xl transition-all text-[#8b90a0] hover:text-white cursor-pointer';
      if (authModalSubtitle) authModalSubtitle.innerText = 'Welcome back! Log in to manage your silent security.';
    } else {
      formSignup.classList.remove('hidden');
      formLogin.classList.add('hidden');
      tabSignupBtn.className = 'py-2.5 rounded-xl transition-all text-white bg-[#10b981]/15 border border-[#10b981]/40 shadow-sm cursor-pointer';
      tabLoginBtn.className = 'py-2.5 rounded-xl transition-all text-[#8b90a0] hover:text-white cursor-pointer';
      if (authModalSubtitle) authModalSubtitle.innerText = 'Get started in under 60 seconds with zero technical setup.';
    }
  }

  // Event Listeners for Opening Modal
  const mobileNavSignupBtn = document.getElementById('mobile-nav-signup-btn');
  if (navLoginBtn) navLoginBtn.addEventListener('click', () => openModal('login'));
  if (mobileNavLoginBtn) mobileNavLoginBtn.addEventListener('click', () => openModal('login'));
  if (navCtaBtn) navCtaBtn.addEventListener('click', () => openModal('signup'));
  if (mobileNavSignupBtn) mobileNavSignupBtn.addEventListener('click', () => openModal('signup'));
  if (heroCtaBtn) heroCtaBtn.addEventListener('click', () => openModal('signup'));

  document.querySelectorAll('.deploy-plan-btn, .hero-deploy-cta').forEach(btn => {
    btn.addEventListener('click', () => openModal('signup'));
  });

  const activateSelectedModulesBtn = document.getElementById('activate-selected-modules-btn');
  if (activateSelectedModulesBtn) {
    activateSelectedModulesBtn.addEventListener('click', () => {
      openModal('signup');
    });
  }

  // 1-Line Install Command Platform Tabs & Copy Controller
  const tabOsNix = document.getElementById('tab-os-nix');
  const tabOsWin = document.getElementById('tab-os-win');
  const heroInstallCmd = document.getElementById('hero-install-cmd');
  const heroCopyCmdBtn = document.getElementById('hero-copy-cmd-btn');
  const heroCopyText = document.getElementById('hero-copy-text');

  const NIX_CMD = "curl -fsSL https://get.sentinel.ai | sh -s -- --token=tok_live_trial";
  const WIN_CMD = "iwr -useb https://get.sentinel.ai/win | iex; Set-SentinelToken tok_live_trial";

  if (tabOsNix && tabOsWin && heroInstallCmd) {
    tabOsNix.addEventListener('click', () => {
      tabOsNix.className = "px-2.5 py-1 rounded bg-[#10b981]/20 text-[#10b981] font-semibold transition-all cursor-pointer";
      tabOsWin.className = "px-2.5 py-1 rounded text-[#8b90a0] hover:text-white transition-all cursor-pointer";
      heroInstallCmd.innerText = NIX_CMD;
    });

    tabOsWin.addEventListener('click', () => {
      tabOsWin.className = "px-2.5 py-1 rounded bg-[#10b981]/20 text-[#10b981] font-semibold transition-all cursor-pointer";
      tabOsNix.className = "px-2.5 py-1 rounded text-[#8b90a0] hover:text-white transition-all cursor-pointer";
      heroInstallCmd.innerText = WIN_CMD;
    });
  }

  if (heroCopyCmdBtn && heroInstallCmd) {
    heroCopyCmdBtn.addEventListener('click', () => {
      const text = heroInstallCmd.innerText.trim();
      navigator.clipboard.writeText(text).then(() => {
        playAffirmationChime();
        if (heroCopyText) heroCopyText.innerText = "Copied!";
        heroCopyCmdBtn.classList.add('bg-[#10b981]', 'text-slate-950');
        setTimeout(() => {
          if (heroCopyText) heroCopyText.innerText = "Copy";
          heroCopyCmdBtn.classList.remove('bg-[#10b981]', 'text-slate-950');
        }, 2000);
      }).catch(() => {
        if (heroCopyText) heroCopyText.innerText = "Copied!";
      });
    });
  }

  // Interactive 1-Click Incident Card Handlers (Pillar 1)
  const demoNotifyVendorBtn = document.getElementById('demo-notify-vendor-btn');
  const demoDismissLogBtn = document.getElementById('demo-dismiss-log-btn');
  const cardActionStatus = document.getElementById('card-action-status');

  if (demoNotifyVendorBtn) {
    demoNotifyVendorBtn.addEventListener('click', () => {
      playAffirmationChime();
      if (cardActionStatus) {
        cardActionStatus.classList.remove('hidden');
        cardActionStatus.innerHTML = '<span class="text-[#00f2fe] font-bold">✅ Warning email auto-drafted & queued to vendor!</span>';
      }
    });
  }

  if (demoDismissLogBtn) {
    demoDismissLogBtn.addEventListener('click', () => {
      playAffirmationChime();
      if (cardActionStatus) {
        cardActionStatus.classList.remove('hidden');
        cardActionStatus.innerHTML = '<span class="text-[#10b981] font-bold">✅ Incident logged to compliance audit trail. Closed.</span>';
      }
    });
  }

  // Pillar 1 Mobile Comparison Tab Switcher
  const p1TabLegacy = document.getElementById('p1-tab-legacy');
  const p1TabCyenex = document.getElementById('p1-tab-cyenex');
  const p1CardLegacy = document.getElementById('p1-card-legacy');
  const p1CardCyenex = document.getElementById('p1-card-cyenex');
  const p1MobileToCyenex = document.getElementById('p1-mobile-to-cyenex');
  const p1MobileToLegacy = document.getElementById('p1-mobile-to-legacy');

  function setP1View(activeView) {
    if (!p1CardLegacy || !p1CardCyenex) return;
    
    if (activeView === 'cyenex') {
      p1CardLegacy.classList.add('p1-card-hidden-mobile');
      p1CardCyenex.classList.remove('p1-card-hidden-mobile');

      if (p1TabLegacy) {
        p1TabLegacy.classList.remove('p1-tab-legacy-active');
        p1TabLegacy.classList.add('text-[#8b90a0]', 'border-transparent');
      }
      if (p1TabCyenex) {
        p1TabCyenex.classList.add('p1-tab-cyenex-active');
        p1TabCyenex.classList.remove('text-[#8b90a0]', 'border-transparent');
      }
    } else {
      p1CardLegacy.classList.remove('p1-card-hidden-mobile');
      p1CardCyenex.classList.add('p1-card-hidden-mobile');

      if (p1TabLegacy) {
        p1TabLegacy.classList.add('p1-tab-legacy-active');
        p1TabLegacy.classList.remove('text-[#8b90a0]', 'border-transparent');
      }
      if (p1TabCyenex) {
        p1TabCyenex.classList.remove('p1-tab-cyenex-active');
        p1TabCyenex.classList.add('text-[#8b90a0]', 'border-transparent');
      }
    }
  }

  if (p1TabLegacy) {
    p1TabLegacy.addEventListener('click', () => {
      setP1View('legacy');
    });
  }

  if (p1TabCyenex) {
    p1TabCyenex.addEventListener('click', () => {
      playAffirmationChime();
      setP1View('cyenex');
    });
  }

  if (p1MobileToCyenex) {
    p1MobileToCyenex.addEventListener('click', () => {
      playAffirmationChime();
      setP1View('cyenex');
      p1CardCyenex?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  if (p1MobileToLegacy) {
    p1MobileToLegacy.addEventListener('click', () => {
      setP1View('legacy');
      p1CardLegacy?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // Close Event Listeners
  if (authModalClose) authModalClose.addEventListener('click', closeModal);
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) closeModal();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !authModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Tab Switchers
  if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchTab('login'));
  if (tabSignupBtn) tabSignupBtn.addEventListener('click', () => switchTab('signup'));

  // Password Toggle Eye Buttons
  document.querySelectorAll('.toggle-password-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          if (icon) icon.className = 'ph ph-eye-slash';
        } else {
          input.type = 'password';
          if (icon) icon.className = 'ph ph-eye';
        }
      }
    });
  });

  // -- Firebase Account Auth (replaces broken /api/login & /api/signup) --------
  const FIREBASE_DB_ACCOUNTS = 'https://studio-167261963-da656-default-rtdb.firebaseio.com';

  function _emailToKey(email) {
    return (email || '').toLowerCase().replace(/[^a-z0-9]/g, '_');
  }
  function _encode(str) {
    try { return btoa(unescape(encodeURIComponent(str))); } catch(e) { return btoa(str); }
  }
  function _verify(str, encoded) {
    try { return _encode(str) === encoded; } catch(e) { return false; }
  }

  async function dbSignup(name, email, password) {
    const uid = _emailToKey(email);
    const checkRes = await fetch(`${FIREBASE_DB_ACCOUNTS}/accounts/${uid}.json`);
    const existing = await checkRes.json();
    if (existing && existing.email) {
      throw new Error('An account with this email already exists. Please log in instead.');
    }
    const initials = (name || email).split(/\s+/).filter(Boolean).map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
    const userRecord = { name, email, password: _encode(password), initials, created_at: new Date().toISOString() };
    const res = await fetch(`${FIREBASE_DB_ACCOUNTS}/accounts/${uid}.json`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userRecord)
    });
    if (!res.ok) throw new Error('Could not save account. Please check your connection and try again.');
    const { password: _p, ...safeUser } = userRecord;
    return { ...safeUser, uid };
  }

  async function dbLogin(email, password) {
    const uid = _emailToKey(email);
    const res = await fetch(`${FIREBASE_DB_ACCOUNTS}/accounts/${uid}.json`);
    if (!res.ok) throw new Error('Login failed. Please check your connection.');
    const userData = await res.json();
    if (!userData || !userData.email) throw new Error('No account found with this email. Please sign up first.');
    if (!_verify(password, userData.password)) throw new Error('Incorrect password. Please try again.');
    const { password: _p, ...safeUser } = userData;
    return { ...safeUser, uid };
  }

  function showAuthError(msg) {
    if (authToast && authToastMsg) {
      authToastMsg.innerHTML = `<span style="color:#f87171">&#9888; ${msg}</span>`;
      authToast.classList.remove('hidden');
    } else { alert(msg); }
  }

  function onAuthSuccess(user, welcomeMsg) {
    localStorage.setItem('sentinel_user', JSON.stringify(user));
    if (authToast && authToastMsg) {
      authToastMsg.innerText = welcomeMsg;
      authToast.classList.remove('hidden');
    }
    if (window.setRobotExpressionState) window.setRobotExpressionState('SAFETY_CONFIRMED', 3000);
    setTimeout(() => {
      if (window._pendingDownload) {
        const dlUrl = window._pendingDownload;
        window._pendingDownload = null;
        closeModal();
        const a = document.createElement('a'); a.href = dlUrl; a.download = '';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => { if (window.showDownloadModal) window.showDownloadModal(); }, 1500);
      } else {
        window.location.href = 'dashboard.html';
      }
    }, 1200);
  }

  // Form: Login
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formLogin.querySelector('button[type="submit"]');
      const emailVal = document.getElementById('login-email-input')?.value.trim() || '';
      const passwordVal = document.getElementById('login-password-input')?.value || '';
      if (!emailVal || !emailVal.includes('@')) { showAuthError('Please enter a valid email address.'); return; }
      if (!passwordVal) { showAuthError('Please enter your password.'); return; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Logging in...'; }
      if (authToast) authToast.classList.add('hidden');
      try {
        const user = await dbLogin(emailVal, passwordVal);
        onAuthSuccess(user, `Welcome back, ${user.name}! Loading your dashboard...`);
      } catch (err) {
        showAuthError(err.message || 'Login failed. Please try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<span>Log In to CYENEX.AI</span><i class="ph ph-arrow-right-bold text-sm"></i>'; }
      }
    });
  }

  // Form: Signup
  if (formSignup) {
    formSignup.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = formSignup.querySelector('button[type="submit"]');
      const nameVal = document.getElementById('signup-name-input')?.value.trim() || '';
      const emailVal = document.getElementById('signup-email-input')?.value.trim() || '';
      const passwordVal = document.getElementById('signup-password-input')?.value || '';
      if (!nameVal) { showAuthError('Please enter your full name.'); return; }
      if (!emailVal || !emailVal.includes('@')) { showAuthError('Please enter a valid email address.'); return; }
      if (passwordVal.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Creating account...'; }
      if (authToast) authToast.classList.add('hidden');
      try {
        const user = await dbSignup(nameVal, emailVal, passwordVal);
        onAuthSuccess(user, `Welcome to CYENEX.AI, ${user.name}! Setting up your dashboard...`);
      } catch (err) {
        showAuthError(err.message || 'Sign up failed. Please try again.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Create Account & Start Free Trial'; }
      }
    });
  }

  // Expose openModal globally so the download gate can use it
  window.openAuthModal = openModal;

  // Placeholder until initWindowsDownloadButtons runs
  window.showDownloadModal = null;
Web Audio API Sound Chime Synthesizer ─────────────────────────────────
  function playAffirmationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.35); // G5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }
  window.playAffirmationChime = playAffirmationChime;

  // ─── Security Audit Scorecard Controller ──────────────────────────────────
  const auditChecks = document.querySelectorAll('.audit-check');
  const auditScoreNum = document.getElementById('audit-score-number');
  const auditScoreLabel = document.getElementById('audit-score-label');

  function calculateAuditScore() {
    let score = 50; // Base score
    auditChecks.forEach(chk => {
      if (chk.checked) {
        score += parseInt(chk.getAttribute('data-points') || '15', 10);
      }
    });

    if (auditScoreNum) auditScoreNum.innerText = `${score}%`;
    if (auditScoreLabel) {
      if (score >= 90) {
        auditScoreLabel.innerHTML = '<i class="ph ph-shield-check-bold text-[#10b981]"></i> <span class="text-[#10b981]">Strong Shielding</span>';
      } else if (score >= 70) {
        auditScoreLabel.innerHTML = '<i class="ph ph-warning-bold text-[#f59e0b]"></i> <span class="text-[#f59e0b]">Moderate Exposure</span>';
      } else {
        auditScoreLabel.innerHTML = '<i class="ph ph-warning-octagon-bold text-rose-500"></i> <span class="text-rose-500">High Risk (Supply Chain / Exclusions)</span>';
      }
    }
  }

  auditChecks.forEach(chk => chk.addEventListener('change', () => {
    playAffirmationChime();
    calculateAuditScore();
  }));

  // ─── Billing Cycle Toggle Controller (Monthly / Yearly) ───────────────────
  const btnMonthly = document.getElementById('billing-monthly-btn');
  const btnYearly = document.getElementById('billing-yearly-btn');
  const priceBase = document.getElementById('price-base');
  const priceAdv = document.getElementById('price-advanced');
  const pricePro = document.getElementById('price-pro');
  const periodBase = document.getElementById('period-base');
  const periodAdv = document.getElementById('period-advanced');
  const periodPro = document.getElementById('period-pro');
  const billingSubtextBase = document.getElementById('billing-subtext-base');
  const billingSubtextAdv = document.getElementById('billing-subtext-advanced');
  const billingSubtextPro = document.getElementById('billing-subtext-pro');
  const planBadgeBase = document.getElementById('plan-badge-base');
  const planBadgeAdv = document.getElementById('plan-badge-advanced');
  const planBadgePro = document.getElementById('plan-badge-pro');
  const planFeatureBase = document.getElementById('plan-feature-base');
  const planFeatureAdv = document.getElementById('plan-feature-advanced');
  const planFeaturePro = document.getElementById('plan-feature-pro');
  const billingSavingsBanner = document.getElementById('billing-savings-banner');

  if (btnMonthly && btnYearly) {
    const activeBtnClass = "px-5 sm:px-8 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 cursor-pointer bg-[#222d42] text-white shadow-md";
    const inactiveBtnClass = "px-5 sm:px-8 py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 cursor-pointer text-[#8b90a0] hover:text-white";

    function setBillingCycle(cycle) {
      if (cycle === 'yearly') {
        btnYearly.className = activeBtnClass;
        btnMonthly.className = inactiveBtnClass;
        
        // Base Plan: 15 Days Free (Pays for 11.5 months = ₹1,714/yr => ~₹143/user/mo)
        if (priceBase) priceBase.innerText = "₹143";
        if (periodBase) periodBase.innerText = "/user/month";
        if (billingSubtextBase) billingSubtextBase.innerHTML = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-full border border-[#10b981]/25">Billed ₹1,714/yr • 15 Days Free</span>`;
        if (planBadgeBase) planBadgeBase.innerText = "15 Days Free on Yearly // Solo & Small Teams";
        if (planFeatureBase) planFeatureBase.innerHTML = `<i class="ph ph-check-bold text-[#10b981]"></i> <span><strong>15 Days Free with Yearly Plan</strong></span>`;

        // Advanced Plan: 1 Month Free (Pays for 11 months = ₹2,739/yr => ~₹228/user/mo)
        if (priceAdv) priceAdv.innerText = "₹228";
        if (periodAdv) periodAdv.innerText = "/user/month";
        if (billingSubtextAdv) billingSubtextAdv.innerHTML = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00f2fe] bg-[#00f2fe]/10 px-2 py-0.5 rounded-full border border-[#00f2fe]/25">Billed ₹2,739/yr • 1 Month Free</span>`;
        if (planBadgeAdv) planBadgeAdv.innerText = "1 Month Free on Yearly // Complete Coverage";
        if (planFeatureAdv) planFeatureAdv.innerHTML = `<i class="ph ph-check-bold text-[#00f2fe]"></i> <span><strong>1 Month Free with Yearly Plan</strong></span>`;

        // Pro Plan: 2 Months Free (Pays for 10 months = ₹5,590/yr => ~₹465/user/mo)
        if (pricePro) pricePro.innerText = "₹465";
        if (periodPro) periodPro.innerText = "/user/month";
        if (billingSubtextPro) billingSubtextPro.innerHTML = `<span class="inline-flex items-center gap-1 text-[11px] font-semibold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded-full border border-[#f59e0b]/25">Billed ₹5,590/yr • 2 Months Free</span>`;
        if (planBadgePro) planBadgePro.innerText = "2 Months Free on Yearly // Total Peace of Mind";
        if (planFeaturePro) planFeaturePro.innerHTML = `<i class="ph ph-check-bold text-[#f59e0b]"></i> <span><strong>2 Months Free with Yearly Plan</strong></span>`;

        if (billingSavingsBanner) {
          billingSavingsBanner.className = "text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#10b981] flex items-center justify-center gap-1.5 select-none transition-all duration-300";
        }
      } else {
        btnMonthly.className = activeBtnClass;
        btnYearly.className = inactiveBtnClass;

        // Base Plan Monthly Reset
        if (priceBase) priceBase.innerText = "₹149";
        if (periodBase) periodBase.innerText = "/user/month";
        if (billingSubtextBase) billingSubtextBase.innerHTML = "";
        if (planBadgeBase) planBadgeBase.innerText = "14-Day Free Trial // Solo & Small Teams";
        if (planFeatureBase) planFeatureBase.innerHTML = `<i class="ph ph-check-bold text-[#10b981]"></i> <span><strong>14 Days Free Trial</strong></span>`;

        // Advanced Plan Monthly Reset
        if (priceAdv) priceAdv.innerText = "₹249";
        if (periodAdv) periodAdv.innerText = "/user/month";
        if (billingSubtextAdv) billingSubtextAdv.innerHTML = "";
        if (planBadgeAdv) planBadgeAdv.innerText = "Growing Teams // Complete Coverage";
        if (planFeatureAdv) planFeatureAdv.innerHTML = `<i class="ph ph-check-bold text-[#10b981]"></i> <span>Everything in Base Plan</span>`;

        // Pro Plan Monthly Reset
        if (pricePro) pricePro.innerText = "₹559";
        if (periodPro) periodPro.innerText = "/user/month";
        if (billingSubtextPro) billingSubtextPro.innerHTML = "";
        if (planBadgePro) planBadgePro.innerText = "Full Suite // Total Peace of Mind";
        if (planFeaturePro) planFeaturePro.innerHTML = `<i class="ph ph-check-bold text-[#f59e0b]"></i> <span>Everything in Advanced Plan</span>`;

        if (billingSavingsBanner) {
          billingSavingsBanner.className = "text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#38bdf8] flex items-center justify-center gap-1.5 select-none transition-all duration-300";
        }
      }
    }

    btnMonthly.addEventListener('click', () => setBillingCycle('monthly'));
    btnYearly.addEventListener('click', () => setBillingCycle('yearly'));
  }
})();

/* ─────────────────────────────────────────────────────────────────────────────
   MOBILE NAVIGATION DRAWER CONTROLLER
───────────────────────────────────────────────────────────────────────────── */
(function initMobileNavDrawer() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const toggleIcon = document.getElementById('mobile-menu-icon');
  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const mobileLoginBtn = document.getElementById('mobile-nav-login-btn');

  if (!toggleBtn || !mobileDrawer) return;

  function toggleDrawer(open) {
    const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
    if (isOpen) {
      mobileDrawer.classList.remove('hidden');
      requestAnimationFrame(() => {
        mobileDrawer.classList.add('open');
      });
      toggleBtn.classList.add('active');
      if (toggleIcon) {
        toggleIcon.classList.remove('ph-list');
        toggleIcon.classList.add('ph-x');
      }
    } else {
      mobileDrawer.classList.remove('open');
      toggleBtn.classList.remove('active');
      if (toggleIcon) {
        toggleIcon.classList.remove('ph-x');
        toggleIcon.classList.add('ph-list');
      }
      setTimeout(() => {
        if (!mobileDrawer.classList.contains('open')) {
          mobileDrawer.classList.add('hidden');
        }
      }, 250);
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDrawer();
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleDrawer(false);
    });
  });

  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', () => {
      toggleDrawer(false);
    });
  }

  const mobileSignupBtn = document.getElementById('mobile-nav-signup-btn');
  if (mobileSignupBtn) {
    mobileSignupBtn.addEventListener('click', () => {
      toggleDrawer(false);
    });
  }

  document.addEventListener('click', (e) => {
    if (!mobileDrawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      toggleDrawer(false);
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      toggleDrawer(false);
    }
  });
})();

/* ─────────────────────────────────────────────────────────────────────────────
   SENTINELAI WINDOWS DOWNLOAD (Auth-Gated)
───────────────────────────────────────────────────────────────────────────── */
(function initWindowsDownloadButtons() {
  var DIRECT_URL = 'https://github.com/Arya032/SentinelAi-Python/releases/latest/download/SentinelAI-Files.zip';

  // Fetch version label for display
  fetch('https://api.github.com/repos/Arya032/SentinelAi-Python/releases/latest')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data || !data.tag_name) return;
      var v = data.tag_name;
      var el = document.getElementById('hero-win-btn-text');
      if (el) el.textContent = 'Download for Windows ' + v + '  \u2193';
      var el2 = document.getElementById('step-version-badge');
      if (el2) el2.textContent = v;
    })
    .catch(function() {});

  function showDownloadModal() {
    var existing = document.getElementById('sentinel-dl-modal');
    if (existing) { existing.remove(); return; }

    var modal = document.createElement('div');
    modal.id = 'sentinel-dl-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(7,8,10,0.88);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;padding:20px;';

    var card = document.createElement('div');
    card.style.cssText = 'background:#0b101d;border:1px solid rgba(16,185,129,0.4);border-radius:20px;padding:32px;max-width:440px;width:100%;box-shadow:0 0 60px rgba(16,185,129,0.15);font-family:sans-serif;color:#f1f5f9;';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:20px;';
    header.innerHTML = '<div style="width:40px;height:40px;border-radius:12px;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.4);display:flex;align-items:center;justify-content:center;font-size:20px;">\uD83D\uDEE1\uFE0F</div>' +
      '<div><div style="font-weight:700;font-size:1rem;">Downloading SentinelAI...</div>' +
      '<div style="font-size:0.75rem;color:#94a3b8;">Check your browser download bar below</div></div>';

    var closeBtn = document.createElement('button');
    closeBtn.textContent = '\u00d7';
    closeBtn.style.cssText = 'margin-left:auto;background:none;border:none;color:#94a3b8;cursor:pointer;font-size:1.4rem;line-height:1;padding:4px 8px;border-radius:6px;';
    closeBtn.addEventListener('click', function() { modal.remove(); });
    header.appendChild(closeBtn);

    var steps = document.createElement('div');
    steps.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    [
      { n:'1', color:'#10b981', title:'ZIP is downloading now', sub:'Find <b>SentinelAI-Files.zip</b> in your Downloads folder' },
      { n:'2', color:'#10b981', title:'Extract the ZIP', sub:'Right-click it &rarr; <b>Extract All</b> &rarr; open the folder' },
      { n:'3', color:'#00f2fe', title:'Run Start-Agent.bat', sub:'Double-click <b>Start-Agent.bat</b> and enter your CYENEX.AI email when prompted' }
    ].forEach(function(s) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;gap:12px;padding:14px;background:#111827;border-radius:12px;border:1px solid #1e2235;';
      row.innerHTML = '<div style="min-width:28px;height:28px;border-radius:50%;background:' + s.color + ';display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;color:#050811;">' + s.n + '</div>' +
        '<div><div style="font-weight:600;font-size:0.875rem;margin-bottom:3px;">' + s.title + '</div>' +
        '<div style="color:#94a3b8;font-size:0.8rem;">' + s.sub + '</div></div>';
      steps.appendChild(row);
    });

    var note = document.createElement('div');
    note.style.cssText = 'margin-top:16px;padding:12px;background:rgba(16,185,129,0.08);border-radius:10px;border:1px solid rgba(16,185,129,0.2);font-size:0.78rem;color:#6ee7b7;text-align:center;';
    note.textContent = 'Runs silently in background. Your dashboard will show live PC health within 30 seconds.';

    card.appendChild(header); card.appendChild(steps); card.appendChild(note);
    modal.appendChild(card);
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
  }

  // Expose for onAuthSuccess
  window.showDownloadModal = showDownloadModal;

  function handleDownloadClick(e) {
    var loggedIn = localStorage.getItem('sentinel_user');
    if (!loggedIn) {
      // Not logged in -- gate behind signup, then auto-download after
      e.preventDefault();
      window._pendingDownload = DIRECT_URL;
      if (window.openAuthModal) window.openAuthModal('signup');
      return;
    }
    // Logged in -- let browser proceed, then show instructions
    setTimeout(showDownloadModal, 1000);
  }

  ['hero-windows-download-btn', 'step-windows-download-btn'].forEach(function(id) {
    var btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', handleDownloadClick);
  });
})();
/* =============================================================================
   PREMIUM UX: NAVBAR AUTH STATE, STATS COUNTUP, LIVE THREAT TICKER
============================================================================= */

// ── 1. Navbar Auth State (show user avatar when logged in) ──────────────────
(function initNavbarAuthState() {
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem('sentinel_user') || 'null'); } catch(e) {}

  var loginBtn = document.getElementById('nav-login-btn');
  var userMenu = document.getElementById('nav-user-menu');
  var userAvatar = document.getElementById('nav-user-avatar');
  var userName = document.getElementById('nav-user-name');
  var userBtn = document.getElementById('nav-user-btn');
  var userDropdown = document.getElementById('nav-user-dropdown');
  var logoutBtn = document.getElementById('nav-logout-btn');

  if (saved && saved.email) {
    // Logged in: hide Login, show avatar
    if (loginBtn) loginBtn.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (userAvatar) userAvatar.textContent = saved.initials || (saved.name || 'U').substring(0, 2).toUpperCase();
    if (userName) userName.textContent = (saved.name || saved.email.split('@')[0]).split(' ')[0];
  } else {
    if (loginBtn) loginBtn.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
  }

  // Toggle dropdown
  if (userBtn && userDropdown) {
    userBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', function() {
      if (userDropdown) userDropdown.classList.add('hidden');
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('sentinel_user');
      localStorage.removeItem('sentinel_token');
      window.location.reload();
    });
  }
})();

// ── 2. Animated CountUp for Stats ───────────────────────────────────────────
(function initStatsCountUp() {
  var started = false;

  function easeOutQuad(t) { return t * (2 - t); }

  function animateStat(el) {
    var target = parseFloat(el.getAttribute('data-target') || '0');
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var duration = 1800;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = easeOutQuad(progress);
      var current = eased * target;
      el.textContent = (decimals > 0 ? current.toFixed(decimals) : Math.round(current)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function startCountUps() {
    if (started) return;
    started = true;
    document.querySelectorAll('.stat-num').forEach(function(el) {
      animateStat(el);
    });
  }

  // Trigger when the section scrolls into view
  var trustSection = document.getElementById('trust-section');
  if (!trustSection) { return; }

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) { startCountUps(); observer.disconnect(); }
      });
    }, { threshold: 0.2 });
    observer.observe(trustSection);
  } else {
    startCountUps();
  }
})();

// ── 3. Live Threat Ticker (simulates a real-time global threat counter) ─────
(function initLiveThreatTicker() {
  var el = document.getElementById('live-threat-counter');
  if (!el) return;

  // Start from a realistic base that grows over the day
  var now = new Date();
  var secondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  var dailyRate = 1247; // threats blocked per day
  var perSecond = dailyRate / 86400;
  var count = Math.floor(secondsToday * perSecond * (0.85 + Math.random() * 0.3));

  el.textContent = count.toLocaleString();

  // Tick up every few seconds to simulate live activity
  setInterval(function() {
    var increment = Math.floor(Math.random() * 3) + 1;
    count += increment;
    el.textContent = count.toLocaleString();
    // Brief flash effect
    el.style.color = '#10b981';
    setTimeout(function() { el.style.color = '#f87171'; }, 300);
  }, Math.floor(Math.random() * 4000) + 2000);
})();

/* =========================================
   1. ARCANE STARDUST PARTICLES CANVAS
   ========================================= */
const canvas = document.getElementById('stardust-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
});
resizeCanvas();

class StardustParticle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.color = Math.random() > 0.4 ? 'rgba(0, 210, 255, ' : 'rgba(157, 78, 221, ';
    this.opacity = Math.random() * 0.6 + 0.2;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0) this.x = canvas.width;
    if (this.x > canvas.width) this.x = 0;
    if (this.y < 0) this.y = canvas.height;
    if (this.y > canvas.height) this.y = 0;
  }
  draw() {
    ctx.fillStyle = this.color + this.opacity + ')';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00d2ff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function initParticles() {
  particlesArray = [];
  const numberOfParticles = Math.floor((canvas.width * canvas.height) / 14000);
  for (let i = 0; i < numberOfParticles; i++) {
    particlesArray.push(new StardustParticle());
  }
}
initParticles();

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    particlesArray[i].draw();
  }
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* =========================================
   2. PROJECT CATEGORY FILTERING
   ========================================= */
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  });
});

/* =========================================
   3. 3D CYBER HOLOGRAPHIC AVATAR (LEFT SIDE)
   ========================================= */
function initCyberHologram() {
  const container = document.getElementById('hologram-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const width = container.clientWidth || 480;
  const height = container.clientHeight || 440;

  // Scene & Camera
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050814, 0.035);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 1.1, 3.8);

  // Transparent WebGL Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Configuration
  const config = {
    rotSpeed: 1.0,
    glitchIntensity: 0.35,
    colorCyan: 0x00d2ff,
    colorMagenta: 0xff0077,
    showWireframe: true,
    showPoints: true
  };

  const themes = {
    cyber: { cyan: 0x00d2ff, magenta: 0xff0077 },
    matrix: { cyan: 0x00ff66, magenta: 0xaaff00 },
    solarpunk: { cyan: 0xffaa00, magenta: 0xff0055 }
  };

  // Hologram Hierarchy
  const hologramGroup = new THREE.Group();
  scene.add(hologramGroup);

  const bustGroup = new THREE.Group();
  hologramGroup.add(bustGroup);

  // Custom Shader Material
  const hologramShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0.0 },
      colorEdge1: { value: new THREE.Color(config.colorCyan) },
      colorEdge2: { value: new THREE.Color(config.colorMagenta) },
      glitchStrength: { value: 0.35 },
      burst: { value: 0.0 }
    },
    vertexShader: `
      uniform float time;
      uniform float glitchStrength;
      uniform float burst;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying float vScan;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 pos = position;

        float scanWave = sin(pos.y * 12.0 - time * 3.5);
        vScan = scanWave;

        float glitchTrigger = step(0.96 - burst * 0.2, fract(sin(dot(floor(pos.yy * 10.0 + time * 6.0), vec2(12.9898, 78.233))) * 43758.5453));
        pos.x += glitchTrigger * (glitchStrength + burst * 1.5) * 0.08 * sin(time * 30.0 + pos.y);
        pos.z += glitchTrigger * (glitchStrength + burst * 1.5) * 0.04 * cos(time * 25.0);

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform vec3 colorEdge1;
      uniform vec3 colorEdge2;
      uniform float time;
      uniform float glitchStrength;
      uniform float burst;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying float vScan;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
        fresnel = pow(fresnel, 2.2);

        float scanline = sin(vWorldPosition.y * 55.0 - time * 5.0) * 0.5 + 0.5;
        scanline = pow(scanline, 1.8);

        vec3 baseColor = mix(colorEdge1, colorEdge2, smoothstep(-0.8, 1.2, vWorldPosition.y));
        vec3 finalColor = baseColor * (fresnel * 2.2 + 0.3) + baseColor * scanline * 0.4;

        float flicker = sin(time * 40.0) * 0.06;
        float alpha = clamp(fresnel * 0.95 + scanline * 0.25 + flicker + burst * 0.2, 0.1, 0.95);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    wireframe: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const particlePointsMaterial = new THREE.PointsMaterial({
    size: 0.024,
    color: new THREE.Color(config.colorCyan),
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  // 3D Avatar Geometries
  const headGeom = new THREE.SphereGeometry(0.55, 32, 28);
  headGeom.scale(0.85, 1.15, 0.95);
  const headMesh = new THREE.Mesh(headGeom, hologramShaderMaterial);
  headMesh.position.set(0, 1.05, 0);
  bustGroup.add(headMesh);

  const hairGeom = new THREE.CylinderGeometry(0.52, 0.72, 1.1, 24, 12, true);
  hairGeom.scale(1.02, 1.0, 1.05);
  const hairMesh = new THREE.Mesh(hairGeom, hologramShaderMaterial);
  hairMesh.position.set(0, 0.85, -0.05);
  bustGroup.add(hairMesh);

  const torsoGeom = new THREE.CylinderGeometry(0.38, 0.85, 1.3, 24, 16, true);
  torsoGeom.scale(1.3, 1.0, 0.8);
  const torsoMesh = new THREE.Mesh(torsoGeom, hologramShaderMaterial);
  torsoMesh.position.set(0, -0.1, 0);
  bustGroup.add(torsoMesh);

  const collarGeom = new THREE.ConeGeometry(0.48, 0.7, 16, 4, true);
  collarGeom.scale(1.2, 0.8, 0.7);
  collarGeom.rotateX(Math.PI);
  const collarMesh = new THREE.Mesh(collarGeom, hologramShaderMaterial);
  collarMesh.position.set(0, 0.45, 0.1);
  bustGroup.add(collarMesh);

  // Holographic Cyber Flower (Rose on lapel)
  const flowerGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const petalRing = new THREE.TorusGeometry(0.08 + i * 0.04, 0.015, 8, 16);
    petalRing.rotateX(Math.PI / 4 + i * 0.2);
    const ringMesh = new THREE.Mesh(petalRing, hologramShaderMaterial);
    flowerGroup.add(ringMesh);
  }
  flowerGroup.position.set(0.35, -0.2, 0.35);
  flowerGroup.scale.set(0.85, 0.85, 0.85);
  bustGroup.add(flowerGroup);

  // Point Cloud Nodes
  const mergedVertices = [];
  [headGeom, hairGeom, torsoGeom].forEach(geom => {
    const posAttr = geom.attributes.position;
    for (let i = 0; i < posAttr.count; i += 2) {
      mergedVertices.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
    }
  });
  const pointsGeom = new THREE.BufferGeometry();
  pointsGeom.setAttribute('position', new THREE.Float32BufferAttribute(mergedVertices, 3));
  const pointsMesh = new THREE.Points(pointsGeom, particlePointsMaterial);
  pointsMesh.position.copy(headMesh.position);
  pointsMesh.position.y -= 0.55;
  bustGroup.add(pointsMesh);

  // Pedestal Rings and Grid
  const pedestalGroup = new THREE.Group();
  pedestalGroup.position.set(0, -1.0, 0);
  hologramGroup.add(pedestalGroup);

  const ringRadii = [0.9, 1.35, 1.7, 2.05];
  const ringMeshes = [];
  ringRadii.forEach((rad, index) => {
    const ringGeom = new THREE.RingGeometry(rad, rad + 0.03, 64);
    ringGeom.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: index % 2 === 0 ? config.colorCyan : config.colorMagenta,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55 - index * 0.08,
      blending: THREE.AdditiveBlending
    });
    const rMesh = new THREE.Mesh(ringGeom, mat);
    pedestalGroup.add(rMesh);
    ringMeshes.push({ mesh: rMesh, speed: (index % 2 === 0 ? 1 : -1) * (0.005 + index * 0.003) });
  });

  const gridHelper = new THREE.PolarGridHelper(2.1, 16, 8, 32, config.colorCyan, config.colorMagenta);
  gridHelper.position.y = -0.01;
  pedestalGroup.add(gridHelper);

  // Floating Code Cards
  const floatingGlyphsGroup = new THREE.Group();
  hologramGroup.add(floatingGlyphsGroup);

  function createCodeCardTexture(snippetText, accentColor) {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx2 = c.getContext('2d');

    ctx2.fillStyle = 'rgba(6, 12, 28, 0.85)';
    ctx2.fillRect(0, 0, 512, 256);

    ctx2.strokeStyle = accentColor;
    ctx2.lineWidth = 4;
    ctx2.strokeRect(6, 6, 500, 244);

    ctx2.fillStyle = accentColor;
    ctx2.font = 'bold 20px "JetBrains Mono", monospace';
    ctx2.fillText('// SYNC_STREAM: [0x4F9B]', 24, 40);

    ctx2.fillStyle = '#cbd5e1';
    ctx2.font = '16px "JetBrains Mono", monospace';
    const lines = snippetText.split('\n');
    lines.forEach((line, i) => {
      ctx2.fillText(line, 24, 76 + i * 26);
    });

    return new THREE.CanvasTexture(c);
  }

  const codeSnippets = [
    "const dev = {\n  name: 'Guitar (ทิชากร)',\n  stack: 'Full-Stack',\n  cohort: 'JSD13'\n};",
    "import { FoodScience } from 'buu';\nimport { FullStackDev } from 'jsd13';\nconst synergy = blend(food, dev);",
    "async function igniteCareer() {\n  await bootcamp.complete();\n  return 'READY_FOR_WORK';\n}"
  ];

  const cards = [];
  for (let i = 0; i < 3; i++) {
    const texture = createCodeCardTexture(codeSnippets[i], i === 0 ? '#00d2ff' : '#ec4899');
    const cardMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const cardGeom = new THREE.PlaneGeometry(0.85, 0.42);
    const cardMesh = new THREE.Mesh(cardGeom, cardMat);

    const angle = (i * Math.PI * 2) / 3;
    cardMesh.position.set(Math.cos(angle) * 1.45, 0.35 + i * 0.35, Math.sin(angle) * 1.45);
    floatingGlyphsGroup.add(cardMesh);
    cards.push({ mesh: cardMesh, baseAngle: angle, yBase: cardMesh.position.y });
  }

  // Dust Particles
  const particleCount = 400;
  const dustGeom = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(particleCount * 3);
  const dustVelocity = [];

  for (let i = 0; i < particleCount; i++) {
    const idx = i * 3;
    dustPositions[idx] = (Math.random() - 0.5) * 4.0;
    dustPositions[idx + 1] = Math.random() * 3.5 - 1.0;
    dustPositions[idx + 2] = (Math.random() - 0.5) * 4.0;

    dustVelocity.push({
      y: 0.003 + Math.random() * 0.005,
      sway: Math.random() * Math.PI * 2
    });
  }

  dustGeom.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0x00d2ff,
    size: 0.022,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
  });
  const dustParticles = new THREE.Points(dustGeom, dustMat);
  scene.add(dustParticles);

  // Orbit Drag Controls
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let spherical = { radius: 3.8, theta: 0.0, phi: Math.PI / 2.3 };
  let targetSpherical = { ...spherical };

  function updateCameraFromSpherical() {
    spherical.radius += (targetSpherical.radius - spherical.radius) * 0.08;
    spherical.theta += (targetSpherical.theta - spherical.theta) * 0.08;
    spherical.phi += (targetSpherical.phi - spherical.phi) * 0.08;

    camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
    camera.position.y = spherical.radius * Math.cos(spherical.phi) + 0.35;
    camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
    camera.lookAt(0, 0.45, 0);
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    targetSpherical.theta -= deltaX * 0.007;
    targetSpherical.phi = Math.max(0.2, Math.min(Math.PI / 2 + 0.25, targetSpherical.phi - deltaY * 0.007));

    previousMousePosition = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Touch Drag
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - previousMousePosition.x;
    const deltaY = e.touches[0].clientY - previousMousePosition.y;

    targetSpherical.theta -= deltaX * 0.008;
    targetSpherical.phi = Math.max(0.2, Math.min(Math.PI / 2 + 0.2, targetSpherical.phi - deltaY * 0.008));

    previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Zoom on wheel (isolated to container)
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    targetSpherical.radius = Math.max(2.2, Math.min(6.0, targetSpherical.radius + e.deltaY * 0.003));
  }, { passive: false });

  // Burst Glitch Button
  const btnBurst = document.getElementById('btn-glitch-pulse');
  if (btnBurst) {
    let burstTimeout = null;
    btnBurst.addEventListener('click', () => {
      hologramShaderMaterial.uniforms.burst.value = 1.0;
      if (burstTimeout) clearTimeout(burstTimeout);
      burstTimeout = setTimeout(() => {
        hologramShaderMaterial.uniforms.burst.value = 0.0;
      }, 450);
    });
  }

  // Display Mode Toggles
  const btnWire = document.getElementById('toggle-wireframe');
  if (btnWire) {
    btnWire.addEventListener('click', () => {
      config.showWireframe = !config.showWireframe;
      headMesh.visible = config.showWireframe;
      hairMesh.visible = config.showWireframe;
      torsoMesh.visible = config.showWireframe;
      collarMesh.visible = config.showWireframe;
      flowerGroup.visible = config.showWireframe;
      btnWire.classList.toggle('active', config.showWireframe);
    });
  }

  const btnPoints = document.getElementById('toggle-points');
  if (btnPoints) {
    btnPoints.addEventListener('click', () => {
      config.showPoints = !config.showPoints;
      pointsMesh.visible = config.showPoints;
      btnPoints.classList.toggle('active', config.showPoints);
    });
  }

  // Neon Color Themes
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const themeKey = btn.getAttribute('data-theme');
      const selected = themes[themeKey];
      if (!selected) return;

      hologramShaderMaterial.uniforms.colorEdge1.value.setHex(selected.cyan);
      hologramShaderMaterial.uniforms.colorEdge2.value.setHex(selected.magenta);
      particlePointsMaterial.color.setHex(selected.cyan);
      dustMat.color.setHex(selected.cyan);

      ringMeshes.forEach((r, idx) => {
        r.mesh.material.color.setHex(idx % 2 === 0 ? selected.cyan : selected.magenta);
      });

      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Reset Camera Button
  const btnReset = document.getElementById('btn-reset-view');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      targetSpherical = { radius: 3.8, theta: 0.0, phi: Math.PI / 2.3 };
    });
  }

  // Resize Listener
  function handleHoloResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', handleHoloResize);

  // Animation Loop
  const clock = new THREE.Clock();
  let frameCount = 0;
  let lastFpsTime = performance.now();
  const fpsElem = document.getElementById('fps-counter');

  function animateHolo() {
    requestAnimationFrame(animateHolo);

    const elapsedTime = clock.getElapsedTime();

    // Calculate FPS
    frameCount++;
    const now = performance.now();
    if (now - lastFpsTime >= 1000) {
      if (fpsElem) fpsElem.innerText = `${frameCount} FPS`;
      frameCount = 0;
      lastFpsTime = now;
    }

    hologramShaderMaterial.uniforms.time.value = elapsedTime;

    // Levitation & Auto-spin
    if (!isDragging) {
      bustGroup.rotation.y += 0.007 * config.rotSpeed;
    }
    bustGroup.position.y = Math.sin(elapsedTime * 1.8) * 0.05;

    // Pedestal Rings
    ringMeshes.forEach(item => {
      item.mesh.rotation.z += item.speed * config.rotSpeed;
    });

    // Orbiting Code Cards
    cards.forEach((card, idx) => {
      const curAngle = card.baseAngle + elapsedTime * 0.25 * config.rotSpeed * (idx % 2 === 0 ? 1 : -1);
      card.mesh.position.x = Math.cos(curAngle) * 1.45;
      card.mesh.position.z = Math.sin(curAngle) * 1.45;
      card.mesh.position.y = card.yBase + Math.sin(elapsedTime * 2.0 + idx) * 0.08;
      card.mesh.lookAt(camera.position);
    });

    // Particles Drift
    const positions = dustGeom.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      positions[idx + 1] += dustVelocity[i].y;
      positions[idx] += Math.sin(elapsedTime + dustVelocity[i].sway) * 0.002;

      if (positions[idx + 1] > 2.8) {
        positions[idx + 1] = -1.0;
      }
    }
    dustGeom.attributes.position.needsUpdate = true;

    updateCameraFromSpherical();
    renderer.render(scene, camera);
  }

  animateHolo();
}

/* =========================================
   4. VS CODE GUIDE MODAL CONTROLLER
   ========================================= */
const guideModal = document.getElementById('guide-modal');
const btnToggleGuide = document.getElementById('btn-toggle-guide');
const btnCloseGuide = document.getElementById('btn-close-guide');
const btnGuideOk = document.getElementById('btn-guide-ok');

if (guideModal && btnToggleGuide) {
  btnToggleGuide.addEventListener('click', () => {
    guideModal.classList.remove('hidden');
  });
  if (btnCloseGuide) {
    btnCloseGuide.addEventListener('click', () => {
      guideModal.classList.add('hidden');
    });
  }
  if (btnGuideOk) {
    btnGuideOk.addEventListener('click', () => {
      guideModal.classList.add('hidden');
    });
  }
  guideModal.addEventListener('click', (e) => {
    if (e.target === guideModal) {
      guideModal.classList.add('hidden');
    }
  });
}

// Initialize Hologram on window load or DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCyberHologram);
} else {
  initCyberHologram();
  
}

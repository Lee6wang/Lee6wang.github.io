/**
 * Lightweight background layer management and homepage canvas animation.
 */

const homeCanvasState = {
  canvas: null,
  ctx: null,
  animationId: null,
  resizeHandler: null,
  pointerHandler: null,
  visibilityHandler: null,
  motionHandler: null,
  motionQuery: null,
  nodes: [],
  lines: [],
  pulses: [],
  width: 0,
  height: 0,
  dpr: 1,
  lastFrame: 0,
  pointer: {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  }
};

function isHomePage() {
  const baseUrl = window.siteBaseUrl || '';
  const homePath = `${baseUrl}/`.replace(/\/{2,}/g, '/');
  const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
  return currentPath === homePath;
}

function isDarkMode() {
  const mode = document.documentElement.getAttribute('data-mode');
  if (mode) return mode === 'dark';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animationPalette() {
  if (isDarkMode()) {
    return {
      line: 'rgba(112, 214, 200, 0.16)',
      node: 'rgba(112, 214, 200, 0.46)',
      pulse: 'rgba(96, 165, 250, 0.72)',
      accent: 'rgba(45, 212, 191, 0.5)',
      accentSoft: 'rgba(45, 212, 191, 0.16)',
      wave: 'rgba(250, 204, 21, 0.28)',
      text: 'rgba(226, 232, 240, 0.36)'
    };
  }

  return {
    line: 'rgba(32, 91, 107, 0.16)',
    node: 'rgba(15, 118, 110, 0.4)',
    pulse: 'rgba(37, 99, 235, 0.58)',
    accent: 'rgba(15, 118, 110, 0.42)',
    accentSoft: 'rgba(15, 118, 110, 0.12)',
    wave: 'rgba(161, 98, 7, 0.24)',
    text: 'rgba(31, 41, 55, 0.34)'
  };
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function ensureBackgroundLayer() {
  let homeEl = document.getElementById('home-bg');
  const staticEl = document.getElementById('static-bg');
  const legacyVantaEl = document.getElementById('vanta-bg');

  if (legacyVantaEl) legacyVantaEl.remove();

  if (isHomePage()) {
    if (staticEl) staticEl.remove();
    if (!homeEl) {
      homeEl = document.createElement('div');
      homeEl.id = 'home-bg';
      document.body.prepend(homeEl);
    }
    initHomeCanvasBackground(homeEl);
    return;
  }

  destroyHomeCanvasBackground();
  if (homeEl) homeEl.remove();
  if (!staticEl) {
    const el = document.createElement('div');
    el.id = 'static-bg';
    document.body.prepend(el);
  }
}

function initHomeCanvasBackground(container) {
  if (!container || !window.HTMLCanvasElement || prefersReducedMotion()) {
    destroyHomeCanvasBackground();
    return;
  }

  if (homeCanvasState.canvas && homeCanvasState.canvas.parentElement === container) return;

  destroyHomeCanvasBackground();

  const canvas = document.createElement('canvas');
  canvas.id = 'home-bg-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);

  homeCanvasState.canvas = canvas;
  homeCanvasState.ctx = canvas.getContext('2d');

  homeCanvasState.resizeHandler = () => resizeHomeCanvas(true);
  homeCanvasState.pointerHandler = (event) => {
    const width = homeCanvasState.width || window.innerWidth;
    const height = homeCanvasState.height || window.innerHeight;
    homeCanvasState.pointer.targetX = (event.clientX / width - 0.5) * 2;
    homeCanvasState.pointer.targetY = (event.clientY / height - 0.5) * 2;
  };
  homeCanvasState.visibilityHandler = () => {
    if (document.hidden) {
      stopHomeCanvasAnimation();
    } else {
      startHomeCanvasAnimation();
    }
  };
  window.addEventListener('resize', homeCanvasState.resizeHandler, { passive: true });
  document.addEventListener('pointermove', homeCanvasState.pointerHandler, { passive: true });
  document.addEventListener('visibilitychange', homeCanvasState.visibilityHandler);

  if (window.matchMedia) {
    homeCanvasState.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    homeCanvasState.motionHandler = () => ensureBackgroundLayer();
    if (homeCanvasState.motionQuery.addEventListener) {
      homeCanvasState.motionQuery.addEventListener('change', homeCanvasState.motionHandler);
    } else if (homeCanvasState.motionQuery.addListener) {
      homeCanvasState.motionQuery.addListener(homeCanvasState.motionHandler);
    }
  }

  resizeHomeCanvas(true);
  startHomeCanvasAnimation();
}

function destroyHomeCanvasBackground() {
  stopHomeCanvasAnimation();

  if (homeCanvasState.resizeHandler) {
    window.removeEventListener('resize', homeCanvasState.resizeHandler);
  }
  if (homeCanvasState.pointerHandler) {
    document.removeEventListener('pointermove', homeCanvasState.pointerHandler);
  }
  if (homeCanvasState.visibilityHandler) {
    document.removeEventListener('visibilitychange', homeCanvasState.visibilityHandler);
  }
  if (homeCanvasState.motionQuery && homeCanvasState.motionHandler && homeCanvasState.motionQuery.removeEventListener) {
    homeCanvasState.motionQuery.removeEventListener('change', homeCanvasState.motionHandler);
  } else if (homeCanvasState.motionQuery && homeCanvasState.motionHandler && homeCanvasState.motionQuery.removeListener) {
    homeCanvasState.motionQuery.removeListener(homeCanvasState.motionHandler);
  }
  if (homeCanvasState.canvas) {
    homeCanvasState.canvas.remove();
  }

  homeCanvasState.canvas = null;
  homeCanvasState.ctx = null;
  homeCanvasState.resizeHandler = null;
  homeCanvasState.pointerHandler = null;
  homeCanvasState.visibilityHandler = null;
  homeCanvasState.motionHandler = null;
  homeCanvasState.motionQuery = null;
  homeCanvasState.nodes = [];
  homeCanvasState.lines = [];
  homeCanvasState.pulses = [];
  homeCanvasState.lastFrame = 0;
  homeCanvasState.pointer.x = 0;
  homeCanvasState.pointer.y = 0;
  homeCanvasState.pointer.targetX = 0;
  homeCanvasState.pointer.targetY = 0;
}

function startHomeCanvasAnimation() {
  if (!homeCanvasState.canvas || homeCanvasState.animationId || document.hidden || prefersReducedMotion()) return;
  homeCanvasState.lastFrame = 0;
  homeCanvasState.animationId = window.requestAnimationFrame(drawHomeCanvas);
}

function stopHomeCanvasAnimation() {
  if (!homeCanvasState.animationId) return;
  window.cancelAnimationFrame(homeCanvasState.animationId);
  homeCanvasState.animationId = null;
}

function resizeHomeCanvas(rebuildScene) {
  const { canvas, ctx } = homeCanvasState;
  if (!canvas || !ctx) return;

  const rect = canvas.parentElement.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width || window.innerWidth));
  const height = Math.max(1, Math.round(rect.height || window.innerHeight));
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  homeCanvasState.width = width;
  homeCanvasState.height = height;
  homeCanvasState.dpr = dpr;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (rebuildScene) {
    buildHomeCanvasScene(width, height);
  }
}

function buildHomeCanvasScene(width, height) {
  const random = seededRandom(Math.round(width * 13 + height * 17));
  const isMobile = width < 768;
  const nodeCount = isMobile ? 26 : 58;
  const threshold = isMobile ? 128 : 190;
  const maxLines = isMobile ? 48 : 132;
  const pulseCount = isMobile ? 7 : 18;

  homeCanvasState.nodes = Array.from({ length: nodeCount }, (_, index) => {
    const column = index % 7;
    const row = Math.floor(index / 7);
    const jitterX = (random() - 0.5) * width * 0.09;
    const jitterY = (random() - 0.5) * height * 0.12;
    return {
      x: (0.1 + column * 0.14 + random() * 0.05) * width + jitterX,
      y: (0.06 + row * 0.16 + random() * 0.06) * height + jitterY,
      radius: 1.1 + random() * 1.7,
      phase: random() * Math.PI * 2
    };
  }).filter((node) => node.x > -40 && node.x < width + 40 && node.y > -40 && node.y < height + 40);

  const lines = [];
  for (let i = 0; i < homeCanvasState.nodes.length; i += 1) {
    for (let j = i + 1; j < homeCanvasState.nodes.length; j += 1) {
      const a = homeCanvasState.nodes[i];
      const b = homeCanvasState.nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < threshold && random() > 0.34) {
        lines.push({ a, b, distance });
      }
    }
  }

  homeCanvasState.lines = lines
    .sort((a, b) => a.distance - b.distance)
    .slice(0, maxLines);

  homeCanvasState.pulses = Array.from({ length: pulseCount }, () => {
    const line = homeCanvasState.lines[Math.floor(random() * homeCanvasState.lines.length)];
    return {
      line,
      offset: random(),
      speed: 0.035 + random() * 0.055,
      radius: 1.6 + random() * 1.6
    };
  }).filter((pulse) => pulse.line);
}

function drawHomeCanvas(timestamp) {
  const { canvas, ctx, width, height, dpr } = homeCanvasState;
  if (!canvas || !ctx) return;

  const isMobile = width < 768;
  const frameInterval = isMobile ? 1000 / 30 : 1000 / 60;
  if (homeCanvasState.lastFrame && timestamp - homeCanvasState.lastFrame < frameInterval) {
    homeCanvasState.animationId = window.requestAnimationFrame(drawHomeCanvas);
    return;
  }

  homeCanvasState.lastFrame = timestamp;
  homeCanvasState.pointer.x += (homeCanvasState.pointer.targetX - homeCanvasState.pointer.x) * 0.055;
  homeCanvasState.pointer.y += (homeCanvasState.pointer.targetY - homeCanvasState.pointer.y) * 0.055;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const palette = animationPalette();
  const time = timestamp * 0.001;
  const parallaxX = homeCanvasState.pointer.x * (isMobile ? 5 : 14);
  const parallaxY = homeCanvasState.pointer.y * (isMobile ? 4 : 10);

  drawSignalNetwork(ctx, palette, time, parallaxX, parallaxY);
  drawMotorVector(ctx, palette, time, parallaxX, parallaxY);
  drawPwmWave(ctx, palette, time, parallaxX, parallaxY);

  homeCanvasState.animationId = window.requestAnimationFrame(drawHomeCanvas);
}

function drawSignalNetwork(ctx, palette, time, parallaxX, parallaxY) {
  const { nodes, lines, pulses } = homeCanvasState;

  ctx.save();
  ctx.translate(parallaxX * 0.35, parallaxY * 0.25);
  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.line;

  lines.forEach((line) => {
    ctx.globalAlpha = clamp(1 - line.distance / 220, 0.18, 0.72);
    ctx.beginPath();
    ctx.moveTo(line.a.x, line.a.y);
    ctx.lineTo(line.b.x, line.b.y);
    ctx.stroke();
  });

  ctx.globalAlpha = 1;
  pulses.forEach((pulse) => {
    const progress = (pulse.offset + time * pulse.speed) % 1;
    const { a, b } = pulse.line;
    const x = a.x + (b.x - a.x) * progress;
    const y = a.y + (b.y - a.y) * progress;

    ctx.fillStyle = palette.pulse;
    ctx.shadowColor = palette.pulse;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, pulse.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  nodes.forEach((node) => {
    const flicker = 0.58 + Math.sin(time * 1.7 + node.phase) * 0.2;
    ctx.globalAlpha = flicker;
    ctx.fillStyle = palette.node;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

function drawMotorVector(ctx, palette, time, parallaxX, parallaxY) {
  const { width, height } = homeCanvasState;
  const radius = clamp(Math.min(width, height) * 0.13, 62, 132);
  const cx = width * (width < 768 ? 0.64 : 0.68) + parallaxX * 0.55;
  const cy = height * (width < 768 ? 0.23 : 0.29) + parallaxY * 0.45;
  const angle = time * 0.55;
  const vx = Math.cos(angle) * radius * 0.82;
  const vy = Math.sin(angle) * radius * 0.82;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 1;
  ctx.strokeStyle = palette.accentSoft;
  ctx.fillStyle = palette.text;
  ctx.font = '12px ui-monospace, SFMono-Regular, Consolas, monospace';

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-radius * 1.12, 0);
  ctx.lineTo(radius * 1.12, 0);
  ctx.moveTo(0, -radius * 1.12);
  ctx.lineTo(0, radius * 1.12);
  ctx.stroke();

  ctx.save();
  ctx.rotate(angle);
  ctx.strokeStyle = palette.line;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius * 0.96, 0);
    ctx.stroke();
    ctx.rotate(Math.PI / 3);
  }
  ctx.restore();

  ctx.strokeStyle = palette.accent;
  ctx.fillStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(vx, vy);
  ctx.stroke();
  drawArrowHead(ctx, vx, vy, angle, palette.accent);

  ctx.globalAlpha = 0.76;
  ctx.fillText('alpha', radius + 12, 4);
  ctx.fillText('beta', 8, -radius - 10);
  ctx.fillText('dq', vx * 0.55 + 8, vy * 0.55 - 8);
  ctx.restore();
}

function drawArrowHead(ctx, x, y, angle, fillStyle) {
  const size = 8;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size * 0.48);
  ctx.lineTo(-size, -size * 0.48);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPwmWave(ctx, palette, time, parallaxX, parallaxY) {
  const { width, height } = homeCanvasState;
  const waveWidth = clamp(width * 0.38, 210, 520);
  const startX = width - waveWidth - width * 0.08 + parallaxX * 0.35;
  const baseY = height * 0.78 + parallaxY * 0.35;
  const high = 18;
  const period = waveWidth / 8;
  const duty = 0.42 + Math.sin(time * 0.8) * 0.08;

  ctx.save();
  ctx.lineWidth = 1.35;
  ctx.strokeStyle = palette.wave;
  ctx.fillStyle = palette.text;
  ctx.font = '11px ui-monospace, SFMono-Regular, Consolas, monospace';
  ctx.beginPath();
  ctx.moveTo(startX, baseY);

  for (let i = 0; i < 8; i += 1) {
    const x0 = startX + i * period;
    const x1 = x0 + period * duty;
    const x2 = x0 + period;
    ctx.lineTo(x0, baseY);
    ctx.lineTo(x0, baseY - high);
    ctx.lineTo(x1, baseY - high);
    ctx.lineTo(x1, baseY);
    ctx.lineTo(x2, baseY);
  }

  ctx.stroke();
  ctx.globalAlpha = 0.7;
  ctx.fillText('PWM sync', startX, baseY + 18);
  ctx.restore();
}

document.addEventListener('DOMContentLoaded', ensureBackgroundLayer);
document.addEventListener('pjax:end', ensureBackgroundLayer);

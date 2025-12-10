/* ----------------------
   Cinematic Shooting Stars (Canvas)
   ---------------------- */
document.addEventListener("DOMContentLoaded", function () {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var stars = [];
  var maxStars = 26;
  var nextSpawn = 0;
  var lastTime = performance.now();
  var currentMode = detectMode();
  var palette = colorsForMode(currentMode);
  var fgLayer = {
    speed: [260, 460],
    length: [170, 280],
    thickness: [1.4, 2.6],
    glow: [12, 22],
    opacityScale: 1,
  };
  var bgLayer = {
    speed: [160, 280],
    length: [110, 170],
    thickness: [1, 1.8],
    glow: [7, 12],
    opacityScale: 0.8,
  };

  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = 0;
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);

  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  function detectMode() {
    var htmlMode = document.documentElement.getAttribute("data-mode");
    if (htmlMode === "dark" || htmlMode === "light") return htmlMode;

    var stored = null;
    try {
      stored = localStorage.getItem("mode");
    } catch (e) {
      stored = null;
    }
    if (stored === "dark" || stored === "light") return stored;

    var prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function setModeFromSource() {
    var nextMode = detectMode();
    if (nextMode !== currentMode) {
      currentMode = nextMode;
      palette = colorsForMode(currentMode);
    }
  }

  if (window.matchMedia) {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    if (mql.addEventListener) {
      mql.addEventListener("change", setModeFromSource);
    } else if (mql.addListener) {
      mql.addListener(setModeFromSource);
    }
  }

  var htmlObserver = new MutationObserver(setModeFromSource);
  htmlObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-mode"],
  });

  function colorsForMode(mode) {
    if (mode === "dark") {
      return {
        heads: ["rgba(210,245,255,1)", "rgba(190,230,255,1)", "rgba(225,230,255,1)"],
        tails: ["rgba(110,200,255,0)", "rgba(150,130,255,0)", "rgba(170,230,255,0)"],
        glows: ["rgba(120,220,255,0.6)", "rgba(180,160,255,0.5)", "rgba(190,220,255,0.55)"],
      };
    }
    return {
      heads: ["rgba(150,190,255,0.9)", "rgba(200,210,240,0.95)", "rgba(170,185,230,0.9)"],
      tails: ["rgba(130,170,230,0)", "rgba(180,190,220,0)", "rgba(150,160,210,0)"],
      glows: ["rgba(150,185,240,0.55)", "rgba(180,175,230,0.45)", "rgba(170,190,230,0.5)"],
    };
  }

  function randBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function spawnStar() {
    if (stars.length >= maxStars) return;
    var layer = Math.random() < 0.48 ? bgLayer : fgLayer;
    var angleDeg = randBetween(55, 78);
    var angle = (angleDeg * Math.PI) / 180;
    var speed = randBetween(layer.speed[0], layer.speed[1]);
    var length = randBetween(layer.length[0], layer.length[1]);
    var thickness = randBetween(layer.thickness[0], layer.thickness[1]);
    var startX = randBetween(-120, window.innerWidth + 120);
    var startY = randBetween(-160, -40);
    var opacity = randBetween(0.6, 0.95) * layer.opacityScale;
    var accel = randBetween(0.08, 0.18);
    var glowSize = randBetween(layer.glow[0], layer.glow[1]);
    var baseHead = pick(palette.heads);
    var baseTail = pick(palette.tails);
    var baseGlow = pick(palette.glows);
    var speedBoost = (speed - layer.speed[0]) / (layer.speed[1] - layer.speed[0] + 1);
    var brightness = 0.9 + speedBoost * 0.2;

    stars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      accel: accel,
      length: length,
      thickness: thickness,
      opacity: opacity,
      angle: angle,
      angleDeg: angleDeg,
      life: randBetween(1400, 2000),
      born: performance.now(),
      glow: baseGlow,
      head: tintAlpha(baseHead, brightness),
      tail: baseTail,
      glowSize: glowSize,
      depthFade: layer === fgLayer ? 1 : 0.85,
    });
  }

  function tintAlpha(rgbaString, factor) {
    var match = rgbaString.match(
      /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([0-9.]+))?\\)/
    );
    if (!match) return rgbaString;
    var r = Math.min(255, Math.round(parseInt(match[1], 10) * factor));
    var g = Math.min(255, Math.round(parseInt(match[2], 10) * factor));
    var b = Math.min(255, Math.round(parseInt(match[3], 10) * factor));
    var a = match[4] ? parseFloat(match[4]) : 1;
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  function updateAndDraw(now) {
    var dt = now - lastTime;
    lastTime = now;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = "lighter";

    for (var i = stars.length - 1; i >= 0; i -= 1) {
      var star = stars[i];
      var age = now - star.born;
      if (age > star.life) {
        stars.splice(i, 1);
        continue;
      }

      var lifeRatio = age / star.life;
      var eased = Math.sqrt(lifeRatio);
      var accelBoost = 1 + star.accel * eased * 1.3;
      var dtSeconds = dt / 1000;

      star.x += star.vx * accelBoost * dtSeconds;
      star.y += star.vy * accelBoost * dtSeconds;

      var fade = (1 - lifeRatio * 0.9) * star.opacity * star.depthFade;
      if (fade <= 0 || star.y > window.innerHeight + 200 || star.x > window.innerWidth + 200) {
        stars.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.translate(star.x, star.y);
      ctx.rotate(star.angle);
      var grad = ctx.createLinearGradient(0, 0, star.length, 0);
      grad.addColorStop(0, star.head);
      grad.addColorStop(0.18, star.head);
      grad.addColorStop(1, star.tail);

      ctx.shadowColor = star.glow;
      ctx.shadowBlur = star.glowSize;
      ctx.lineCap = "round";
      ctx.lineWidth = star.thickness;
      ctx.globalAlpha = fade;

      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(star.length, 0);
      ctx.stroke();

      ctx.globalAlpha = fade * 0.5;
      ctx.lineWidth = star.thickness * 0.55;
      ctx.shadowBlur = star.glowSize * 0.6;
      ctx.beginPath();
      ctx.moveTo(star.length * 0.25, 0);
      ctx.lineTo(star.length, 0);
      ctx.stroke();

      ctx.restore();
    }

    if (now >= nextSpawn) {
      spawnStar();
      nextSpawn = now + randBetween(480, 1100);
    }

    requestAnimationFrame(updateAndDraw);
  }

  requestAnimationFrame(updateAndDraw);
});

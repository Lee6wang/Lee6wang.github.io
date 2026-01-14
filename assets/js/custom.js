let vantaEffect = null;

function initVantaHome() {
  const el = document.getElementById("vanta-bg");
  if (!el || typeof VANTA === "undefined") return;

  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }

  vantaEffect = VANTA.NET({
    el,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    backgroundColor: 0x0b1020,
    color: 0x4cc9f0,
    points: 10.0,
    maxDistance: 20.0,
    spacing: 18.0
  });
}

document.addEventListener("DOMContentLoaded", initVantaHome);
document.addEventListener("pjax:end", initVantaHome); // 兼容 Chirpy 切页

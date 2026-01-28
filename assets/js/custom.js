/**
 * Vanta.js NET 动画初始化
 * 支持 Chirpy 主题的 light/dark 模式自动切换
 */

let vantaEffect = null;

// 主题配色方案
const themeColors = {
  light: {
    color: 0x3b82f6,           // 蓝色网格线
    backgroundColor: 0xffffff  // 白色背景
  },
  dark: {
    color: 0x4cc9f0,           // 青色网格线
    backgroundColor: 0x1b1b1b  // 深色背景
  }
};

// 检测当前主题
function getCurrentTheme() {
  // Chirpy 主题使用 data-mode 属性
  const mode = document.documentElement.getAttribute("data-mode");
  if (mode) return mode;

  // 回退：检测系统偏好
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function initVanta() {
  const el = document.getElementById("vanta-bg");
  if (!el || typeof VANTA === "undefined") return;

  // 如果已有实例，先销毁
  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }

  const theme = getCurrentTheme();
  const colors = themeColors[theme] || themeColors.light;

  // 初始化 Vanta NET 效果
  vantaEffect = VANTA.NET({
    el: el,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.0,
    minWidth: 200.0,
    scale: 1.0,
    scaleMobile: 1.0,
    color: colors.color,
    backgroundColor: colors.backgroundColor,
    points: 10.0,
    maxDistance: 20.0,
    spacing: 18.0
  });
}

// DOM 加载完成后初始化
document.addEventListener("DOMContentLoaded", initVanta);

// 兼容 Chirpy 主题的 pjax 页面切换
document.addEventListener("pjax:end", initVanta);

// 监听主题切换（Chirpy 通过修改 data-mode 属性切换主题）
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.attributeName === "data-mode") {
      initVanta();
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-mode"]
});

/**
 * Vanta.js NET 动画初始化
 * 仅在首页 (#vanta-bg 存在时) 生效
 */

let vantaEffect = null;

function initVanta() {
  const el = document.getElementById("vanta-bg");

  // 如果元素不存在或 VANTA 未加载，直接返回
  if (!el || typeof VANTA === "undefined") return;

  // 如果已有实例，先销毁
  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }

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
    color: 0x4cc9f0,           // 网格线颜色：青色
    backgroundColor: 0x0b1020, // 背景颜色：深蓝黑色
    points: 10.0,              // 网格点数量
    maxDistance: 20.0,         // 连线最大距离
    spacing: 18.0              // 点的间距
  });
}

// DOM 加载完成后初始化
document.addEventListener("DOMContentLoaded", initVanta);

// 兼容 Chirpy 主题的 pjax 页面切换
document.addEventListener("pjax:end", initVanta);

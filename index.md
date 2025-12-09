---
layout: page
title: Home
permalink: /
---
# 👋 Hi, I'm Haitao Li

Welcome to my personal site!  
Here I share things I build, things I learn, and occasionally—things I photograph.

If you're looking for my **technical background, research interests, and engineering work**,  
please visit the **[About](/about/)** page.

---

## 📸 A Glimpse of My Photography

I enjoy capturing light, seasons, and quiet moments.  
Here are a few photos I took that I personally like:

👉 To view the full collection, please visit the **[Photograph](/photograph/)** page.

---

<style>
#hero-rotating-text {
  font-size: 2.1rem;
  font-weight: 600;
  text-align: center;
  margin-top: 12px;
  letter-spacing: 0.04em;

  /* 渐变文字核心 */
  background: linear-gradient(120deg, #4c6fff, #18c0c1);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  color: transparent;

  /* 让渐变缓慢流动，看起来更灵动 */
  animation: heroGradientMove 6s ease infinite;
  min-height: 2.6rem; /* 防止高度跳动 */
}

/* 光滑的渐变流动动画 */
@keyframes heroGradientMove {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
</style>

<div id="hero-rotating-text"></div>

{% raw %}
<script>
document.addEventListener("DOMContentLoaded", function() {
  const lines = [
    "Build what you wish to see in the world.",
    "Small steps, constant progress.",
    "Stay curious. Stay building.",
    "Precision in mind, courage in practice.",
    "Make it work. Make it better."
  ];

  const gradients = [
    ["#4c6fff", "#18c0c1"],
    ["#ff7a18", "#af002d"],
    ["#00c6ff", "#0072ff"],
    ["#7f5af0", "#2cb67d"],
    ["#ff6cab", "#7366ff"]
  ];

  const el = document.getElementById("hero-rotating-text");
  if (!el) return;

  let lineIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed   = 70;   // 打字速度
  const deletingSpeed = 45;   // 删除速度
  const holdTime      = 1200; // 打完之后停留时间

  // 随机切换渐变配色
  function setRandomGradient() {
    const g = gradients[Math.floor(Math.random() * gradients.length)];
    el.style.backgroundImage = `linear-gradient(120deg, ${g[0]}, ${g[1]})`;
  }

  function type() {
    const current = lines[lineIndex];

    if (!isDeleting) {
      // 正在打字
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        // 一句打完，稍作停留再开始删除
        isDeleting = true;
        setTimeout(type, holdTime);
        return;
      }
    } else {
      // 正在删除
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        // 删完，切换到下一句并换一个渐变
        isDeleting = false;
        lineIndex = (lineIndex + 1) % lines.length;
        setRandomGradient();
      }
    }

    const delay = isDeleting ? deletingSpeed : typingSpeed;
    setTimeout(type, delay);
  }

  setRandomGradient();
  type();
});
</script>
{% endraw %}
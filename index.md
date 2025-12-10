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

## 📚 Explore More Content

To make it easier to browse different topics on this site:

- **[Categories](/categories/)** — Articles grouped by themes such as embedded systems, robotics, control, and technical notes.
- **[Tags](/tags/)** — Quick jumps to specific topics like STM32, Bootloader, IAP, Control, Sensors, etc.
- **[Archives](/archives/)** — A chronological list of all posts, useful for reviewing past work and updates.

These sections will continue to grow as I publish more articles and project notes.

---

<p style="
  font-size: 2.1rem;
  font-weight: 600;
  text-align: center;
  margin-top: 16px;
  letter-spacing: 0.04em;
  background: linear-gradient(120deg, #4c6fff, #18c0c1);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  color: transparent;
">
  Make it work. Make it better.
</p>


{% raw %}
<script>
document.addEventListener("DOMContentLoaded", function () {
  function createMeteor() {
    var meteor = document.createElement("div");

    var thickness = Math.random() * 1.5 + 1;      // 流星粗细
    var length = Math.random() * 140 + 100;       // 流星长度
    var startX = Math.random() * window.innerWidth;
    var startY = -80;                             // 从屏幕上方开始
    var duration = Math.random() * 1500 + 1200;   // 飞行时间

    meteor.style.position = "fixed";
    meteor.style.top = startY + "px";
    meteor.style.left = startX + "px";
    meteor.style.width = length + "px";
    meteor.style.height = thickness + "px";
    meteor.style.background =
      "linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0))";
    meteor.style.borderRadius = "999px";
    meteor.style.pointerEvents = "none";
    meteor.style.zIndex = 0;          // 保持在背景层
    meteor.style.transform = "rotate(315deg)";

    document.body.appendChild(meteor);

    var endX = startX + 320;
    var endY = startY + 320;
    var startTime = performance.now();

    function animate(now) {
      var t = (now - startTime) / duration;
      if (t >= 1) {
        document.body.removeChild(meteor);
        return;
      }

      var currentX = startX + (endX - startX) * t;
      var currentY = startY + (endY - startY) * t;

      meteor.style.left = currentX + "px";
      meteor.style.top = currentY + "px";
      meteor.style.opacity = 1 - t;   // 逐渐消失

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }

  // 每 2.5 秒生成一颗流星（可以自己调节间隔）
  setInterval(createMeteor, 2500);
});
</script>
{% endraw %}


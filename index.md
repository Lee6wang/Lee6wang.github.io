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

<p id="hero-rotating-text" style="
  font-size: 2.1rem;
  font-weight: 600;
  text-align: center;
  margin-top: 16px;
  letter-spacing: 0.04em;
  -webkit-background-clip: text;
  color: transparent;
">
</p>

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
      // 打字
      el.textContent = current.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === current.length) {
        // 一句打完，停顿一下再开始删
        isDeleting = true;
        setTimeout(type, holdTime);
        return;
      }
    } else {
      // 删除
      el.textContent = current.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        // 删完，切下一句并换渐变
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


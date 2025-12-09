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

<div id="hero-rotating-text"
     style="font-size:3rem; margin-top:8px; color:#555; transition: opacity 0.5s ease;">
</div>

{% raw %}
<script>
document.addEventListener("DOMContentLoaded", function() {
  const lines = [
    "Build what you wish to see in the world."
    "Small steps, constant progress."
    "Stay curious. Stay building."
    "Precision in mind, courage in practice."
    "Make it work. Make it better."
  ];

  const el = document.getElementById("hero-rotating-text");
  if (!el) return;

  let idx = 0;

  function update() {
    el.style.opacity = 0;
    setTimeout(function() {
      el.textContent = lines[idx];
      el.style.opacity = 1;
      idx = (idx + 1) % lines.length;
    }, 200);
  }

  update();
  setInterval(update, 2600);
});
</script>
{% endraw %}

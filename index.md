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

<style>
.fade-in {
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 1.2s ease-out, transform 1.2s ease-out;
}

.fade-in.show {
  opacity: 1;
  transform: translateY(0);
}
</style>

<script>
document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll('.fade-in');
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('show');
    }, 200 * index); // stagger animation (200ms between each photo)
  });
});
</script>

<div style="margin-top: 20px;">

  <div class="fade-in" style="
    background: #ffffff;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    padding: 10px;
    margin-bottom: 24px;
  ">
    <img src="/assets/img/photo1.jpg" alt="Photo 1"
         style="width: 100%; border-radius: 10px; display: block;">
  </div>

  <div class="fade-in" style="
    background: #ffffff;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    padding: 10px;
    margin-bottom: 8px;
  ">
    <img src="/assets/img/photo2.jpg" alt="Photo 2"
         style="width: 100%; border-radius: 10px; display: block;">
  </div>

</div>

---

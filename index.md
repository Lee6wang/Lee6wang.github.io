---
layout: page
title: Home
permalink: /
---
# 👋 Hi, I'm Haitao Li

**Embedded Systems & Robotics Developer**  
Master student at **Beihang University (BUAA)**, Instrument Science & Technology.

I focus on building reliable, real-time, and scalable systems in embedded firmware, robotics, and intelligent equipment.

---

## 🔧 I work on

- STM32 firmware (HAL/LL, FreeRTOS)  
- Bootloader & IAP upgrade architectures  
- Motor control, low-level drivers, CAN communication  
- Embedded AI, perception and sensor fusion  

---

## 📝 Recent Posts

<ul>
  {% for post in site.posts %}
  <li>
    <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    <span> — {{ post.date | date: "%Y-%m-%d" }}</span>
  </li>
  {% endfor %}
</ul>

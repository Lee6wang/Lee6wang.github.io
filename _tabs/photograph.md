---
layout: page
title: Photograph
icon: fas fa-camera
order: 5
---

# 📷 Photograph

I enjoy capturing moments, light, and scenes from my daily life.  
This page collects some of my favorite photos.

---

<div style="margin-top: 20px;">

{% for p in site.data.photograph %}
  <div style="
    background: #ffffff;
    border-radius: 14px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    padding: 10px;
    margin-bottom: 24px;
  ">
    <img src="{{ p.file | relative_url }}" alt="{{ p.title | default: 'Photo' }}"
         style="width: 100%; border-radius: 10px; display: block;">

    <div style="margin-top: 10px; font-size: 0.9rem; color: #555;">
      {% if p.title %}
      <div><strong>{{ p.title }}</strong></div>
      {% endif %}

      {% if p.taken_at or p.location %}
      <div>
        {% if p.taken_at %}📅 {{ p.taken_at }}{% endif %}
        {% if p.taken_at and p.location %} · {% endif %}
        {% if p.location %}📍 {{ p.location }}{% endif %}
      </div>
      {% endif %}

      {% if p.note %}
      <div style="margin-top: 4px;">{{ p.note }}</div>
      {% endif %}
    </div>
  </div>
{% endfor %}

</div>

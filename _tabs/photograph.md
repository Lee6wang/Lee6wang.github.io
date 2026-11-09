---
layout: page
title: 摄影
title_zh: 摄影
title_en: Photograph
icon: fas fa-camera
order: 6
permalink: /photograph/
---

<section class="i18n-block" data-i18n-lang="zh" markdown="1">

我喜欢捕捉日常生活中的瞬间、光线和场景。
这个页面收集了一些我喜欢的照片。

---

</section>

<section class="i18n-block" data-i18n-lang="en" markdown="1" hidden aria-hidden="true">

I enjoy capturing moments, light, and scenes from my daily life.  
This page collects some of my favorite photos.

---

</section>

<div class="photo-journal">

{% for p in site.data.photograph %}
  <div class="photo-journal-entry">
    <img src="{{ p.file | relative_url }}" alt="{{ p.title_en | default: p.title | default: 'Photo' }}"
         class="photo-journal-image" loading="lazy" decoding="async">

    <div class="photo-journal-caption">
      {% if p.title_zh or p.title_en or p.title %}
      <div>
        <strong>
          <span class="i18n-inline" data-i18n-lang="zh">{{ p.title_zh | default: p.title }}</span>
          <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">{{ p.title_en | default: p.title }}</span>
        </strong>
      </div>
      {% endif %}

      {% if p.taken_at or p.location %}
      <div>
        {% if p.taken_at %}📅 {{ p.taken_at }}{% endif %}
        {% if p.taken_at and p.location %} · {% endif %}
        {% if p.location_zh or p.location_en or p.location %}
        📍
        <span class="i18n-inline" data-i18n-lang="zh">{{ p.location_zh | default: p.location }}</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">{{ p.location_en | default: p.location }}</span>
        {% endif %}
      </div>
      {% endif %}

      {% if p.note_zh or p.note_en or p.note %}
      <div style="margin-top: 4px;">
        <span class="i18n-inline" data-i18n-lang="zh">{{ p.note_zh | default: p.note }}</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">{{ p.note_en | default: p.note }}</span>
      </div>
      {% endif %}
    </div>
  </div>
{% endfor %}

</div>

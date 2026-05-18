---
layout: page
title: 首页
title_en: Home
permalink: /
---

<section class="home-hero">
  <p class="home-kicker">
    <span class="i18n-inline" data-i18n-lang="zh">嵌入式系统 / 电机控制 / 机器人</span>
    <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Embedded Systems / Motor Control / Robotics</span>
  </p>

  <h1>Haitao Li</h1>

  <div class="i18n-block" data-i18n-lang="zh">
    北京航空航天大学仪器科学与技术硕士在读，关注嵌入式系统、机器人、电机控制和工程工具链。我在这里记录工程实践、技术笔记、研究探索，以及少量摄影作品。
  </div>

  <div class="i18n-block" data-i18n-lang="en" hidden aria-hidden="true">
    Master's student in Instrument Science and Technology at Beihang University, focusing on embedded systems, robotics, motor control, and engineering toolchains. This site collects my engineering notes, research exploration, and selected photography.
  </div>

  <div class="home-actions">
    <a href="{{ '/about/' | relative_url }}">
      <span class="i18n-inline" data-i18n-lang="zh">关于我</span>
      <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">About</span>
    </a>
    <a href="#featured-posts">
      <span class="i18n-inline" data-i18n-lang="zh">精选文章</span>
      <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Featured</span>
    </a>
    <a href="{{ '/photograph/' | relative_url }}">
      <span class="i18n-inline" data-i18n-lang="zh">摄影</span>
      <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Photograph</span>
    </a>
    <a href="https://github.com/Lee6wang" target="_blank" rel="noopener">GitHub</a>
  </div>
</section>

<section class="home-section">
  <div class="home-section-heading">
    <span class="i18n-inline" data-i18n-lang="zh">研究与工程方向</span>
    <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Research and Engineering Interests</span>
  </div>

  <div class="home-grid">
    <article class="home-card">
      <p class="home-card-label">Firmware</p>
      <h2>
        <span class="i18n-inline" data-i18n-lang="zh">嵌入式与固件</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Embedded and Firmware</span>
      </h2>
      <p>
        <span class="i18n-inline" data-i18n-lang="zh">STM32、FreeRTOS、Bootloader/IAP、外设驱动和通信协议，重点关注可维护的 MCU 工程实现。</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">STM32, FreeRTOS, Bootloader/IAP, peripheral drivers, and communication protocols with a focus on maintainable MCU projects.</span>
      </p>
    </article>

    <article class="home-card">
      <p class="home-card-label">Control</p>
      <h2>
        <span class="i18n-inline" data-i18n-lang="zh">电机控制与机器人</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Motor Control and Robotics</span>
      </h2>
      <p>
        <span class="i18n-inline" data-i18n-lang="zh">从 PMSM 数学建模、FOC、SVPWM 到现代控制和机器人系统集成，连接理论推导与工程落地。</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">From PMSM modeling, FOC, and SVPWM to modern control and robotic system integration, connecting theory with implementation.</span>
      </p>
    </article>

    <article class="home-card">
      <p class="home-card-label">Workflow</p>
      <h2>
        <span class="i18n-inline" data-i18n-lang="zh">工程工具链与笔记</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Toolchains and Notes</span>
      </h2>
      <p>
        <span class="i18n-inline" data-i18n-lang="zh">整理跨平台开发、CMake、VS Code、调试流程和底层 C 语言细节，让项目更容易复现和迭代。</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Notes on cross-platform development, CMake, VS Code, debugging workflows, and low-level C details for reproducible engineering.</span>
      </p>
    </article>
  </div>
</section>

<section class="home-section" id="featured-posts">
  <div class="home-section-heading">
    <span class="i18n-inline" data-i18n-lang="zh">精选文章</span>
    <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Featured Posts</span>
  </div>

  <div class="home-grid home-grid-featured">
    <a class="home-card home-link-card" href="{{ '/posts/BootLoader-IAP/' | relative_url }}">
      <p class="home-card-label">STM32</p>
      <h2>
        <span class="i18n-inline" data-i18n-lang="zh">Bootloader 与 IAP 升级方案</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Bootloader and IAP Upgrade</span>
      </h2>
      <p>
        <span class="i18n-inline" data-i18n-lang="zh">从启动流程、Flash 分区到应用跳转，梳理 MCU 固件升级的完整工程路径。</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">A complete MCU firmware upgrade path from boot flow and flash layout to application jumps.</span>
      </p>
    </a>

    <a class="home-card home-link-card" href="{{ '/posts/PMSM/' | relative_url }}">
      <p class="home-card-label">PMSM</p>
      <h2>
        <span class="i18n-inline" data-i18n-lang="zh">从传递函数走向状态空间</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">From Transfer Functions to State Space</span>
      </h2>
      <p>
        <span class="i18n-inline" data-i18n-lang="zh">以永磁同步电机为例，理解控制理论工具如何服务真实系统分析。</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">A PMSM-centered note on how control theory tools support real system analysis.</span>
      </p>
    </a>

    <a class="home-card home-link-card" href="{{ '/posts/FreeRtos01/' | relative_url }}">
      <p class="home-card-label">RTOS</p>
      <h2>
        <span class="i18n-inline" data-i18n-lang="zh">如何正确理解 FreeRTOS</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Understanding FreeRTOS Correctly</span>
      </h2>
      <p>
        <span class="i18n-inline" data-i18n-lang="zh">不从 API 清单开始，而是从任务、调度、资源和工程问题理解 RTOS。</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Understanding RTOS from tasks, scheduling, resources, and engineering problems instead of API lists.</span>
      </p>
    </a>

    <a class="home-card home-link-card" href="{{ '/posts/vscode-cmake-workflow/' | relative_url }}">
      <p class="home-card-label">Toolchain</p>
      <h2>
        <span class="i18n-inline" data-i18n-lang="zh">VS Code + CMake 嵌入式工作流</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">VS Code + CMake Workflow</span>
      </h2>
      <p>
        <span class="i18n-inline" data-i18n-lang="zh">面向嵌入式项目的通用开发流程，减少对单一 IDE 和厂商工程的依赖。</span>
        <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">A portable embedded workflow that reduces dependence on a single IDE or vendor project format.</span>
      </p>
    </a>
  </div>
</section>

<section class="home-section">
  <div class="home-section-heading">
    <span class="i18n-inline" data-i18n-lang="zh">最近文章</span>
    <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Recent Posts</span>
  </div>

  <div class="home-list">
    {% for post in site.posts limit:5 %}
      <a class="home-list-item" href="{{ post.url | relative_url }}">
        <span class="home-list-date">{{ post.date | date: "%Y.%m.%d" }}</span>
        <span class="home-list-title">
          <span class="i18n-inline" data-i18n-lang="zh">{{ post.title }}</span>
          <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">{{ post.title_en | default: post.title }}</span>
        </span>
      </a>
    {% endfor %}
  </div>
</section>

<section class="home-section">
  <div class="home-section-heading">
    <span class="i18n-inline" data-i18n-lang="zh">摄影预览</span>
    <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">Photography Preview</span>
  </div>

  <div class="home-photo-grid">
    {% for p in site.data.photograph limit:3 %}
      <a class="home-photo" href="{{ '/photograph/' | relative_url }}">
        <span class="home-photo-image" style="background-image: url('{{ p.file | relative_url }}');" aria-hidden="true"></span>
        <span>
          <span class="i18n-inline" data-i18n-lang="zh">{{ p.title_zh | default: p.title }}</span>
          <span class="i18n-inline" data-i18n-lang="en" hidden aria-hidden="true">{{ p.title_en | default: p.title }}</span>
        </span>
      </a>
    {% endfor %}
  </div>
</section>

<p class="home-slogan">Make it work. Make it better.</p>

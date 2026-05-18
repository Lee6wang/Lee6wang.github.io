# AGENT.md

本文件给后续在本仓库工作的代理使用。开始修改前先阅读本文，再按实际任务补充查看相关文件。

## 项目概览

这是 `Lee6wang.github.io` 的个人 GitHub Pages 站点，基于 Jekyll 和 `jekyll-theme-chirpy`。

- 站点主题：`jekyll-theme-chirpy`，版本约束在 `Gemfile` 中。
- 站点配置：`_config.yml`。
- 文章目录：`_posts/`。
- 页面标签页：`_tabs/`。
- 数据文件：`_data/`。
- 静态资源：`assets/`。
- 自定义 Liquid/Ruby 扩展：`_includes/`、`_plugins/`。
- 部署流程：`.github/workflows/pages-deploy.yml`。

主要内容是中文技术博客，主题集中在嵌入式系统、STM32、FreeRTOS、电机控制、PMSM、工程工作流和个人记录。站点的公开身份信息目前是 Haitao Li，标题和社交信息配置在 `_config.yml`。

## 常用命令

优先使用 Bundler 运行 Jekyll 命令：

```bash
bundle install
bundle exec jekyll serve --livereload
bundle exec jekyll build
```

当前 Windows 本地环境已安装 Ruby 3.3 with MSYS2 DevKit 到 `C:\Ruby33-x64`。如果当前 shell 没有把 Ruby 加入 `PATH`，使用完整路径执行：

```powershell
C:\Ruby33-x64\bin\bundle.bat install
C:\Ruby33-x64\bin\bundle.bat exec C:\Ruby33-x64\bin\jekyll.bat build
C:\Ruby33-x64\bin\bundle.bat exec C:\Ruby33-x64\bin\jekyll.bat serve --livereload --host 127.0.0.1 --port 4000
```

本地预览地址：

```text
http://127.0.0.1:4000/
```

仓库自带脚本：

```bash
bash tools/run.sh
bash tools/run.sh --production
bash tools/test.sh
```

`tools/test.sh` 会执行生产构建并运行 `htmlproofer`，其中外链检查被禁用。GitHub Actions 使用 Ruby 3.3，并在 `main` 或 `master` 分支 push 时构建和部署。

## 目录约定

- `_posts/YYYY-MM-DD-slug.md`：博客文章。文件名日期用于排序和 URL 语义，front matter 中的 `date` 是展示和归档依据。
- `assets/figure/YYYY-MM-DD/`：文章配图目录，通常和文章日期对应，图片文件多为 `1.png`、`2.png` 这种顺序命名。
- `assets/photograph/`：摄影页图片。
- `_data/photograph.yml`：摄影页数据源，每条记录包含 `file`、`taken_at`、`title`、`location`、`note`。
- `_tabs/*.md`：Chirpy 标签页，使用 `layout`、`title`、`icon`、`order` 控制页面类型和侧边栏顺序。
- `assets/css/style.scss`：MathJax 显示样式微调。
- `assets/css/custom.scss`：首页 Vanta 背景和非首页静态背景。
- `assets/js/custom.js`：Vanta NET 背景初始化和主题切换处理。
- `_includes/footer/custom.html`：按页面 URL 注入首页动态背景或其他页面静态背景。
- `_plugins/posts-lastmod-hook.rb`：通过 git 历史给文章补 `last_modified_at`。

## 文章 Front Matter

常见文章头部格式：

```yaml
---
title: "文章标题"
date: 2026-03-04 19:00:00 +0800
categories: [Motor Control, Engineering]
tags: [PMSM]
math: true
---
```

要求和注意点：

- 技术公式文章需要显式加 `math: true`。
- 分类和标签由 Chirpy 自动生成归档页，不要随意批量重命名已有分类或标签。
- 现有分类包含 `Engineering`、`STM32`、`RTOS`、`Motor Control`、`Mac`、`Reflection` 等。
- 保持中文长文的写作风格，通常是工程解释、问题引入、分节推导、代码块和图片结合。
- Markdown 正文里已经存在一些 `---` 或 `------` 分隔线，修改时不要误认为都是 front matter 边界。
- 旧文章中有少量拼写、标点、分类格式不一致问题。除非任务明确要求清理，否则不要做大规模规范化，避免改变既有 URL、归档和标签行为。

## 图片与资源

- 文章图片优先使用以站点根开头的路径，例如 `/assets/figure/2026-01-28/1.png`。
- 也有旧文章使用 `../assets/...`，可在触碰对应文章时顺手统一为根路径，但不要无关批量改动。
- 新增文章配图时，优先新建 `assets/figure/YYYY-MM-DD/`，并按文章引用顺序命名。
- 摄影页新增图片时，同时更新 `assets/photograph/` 和 `_data/photograph.yml`。
- 不要随意替换 `assets/lib/three.r134.min.js` 或 `assets/lib/vanta.net.min.js`；它们服务于首页背景。

## 样式与交互

站点样式主要来自 Chirpy 主题，仓库只做小范围覆盖。

- 自定义 CSS/SCSS 改动应优先放在 `assets/css/custom.scss` 或 `assets/css/style.scss`。
- 自定义 JS 改动应优先放在 `assets/js/custom.js`。
- 首页背景由 Vanta NET 实现，其他页面使用 `/assets/images/background.jpg` 作为静态背景。
- `_includes/footer/custom.html` 已经按 `page.url == "/"` 判断首页和非首页背景，不要在多个位置重复注入相同脚本。
- 修改主题行为前先确认 Chirpy 的默认布局是否已经提供相关能力，避免复制主题内部文件造成维护负担。

## 格式规范

遵守 `.editorconfig`：

- UTF-8。
- 2 空格缩进。
- LF 换行。
- 文件末尾保留换行。
- 默认去除行尾空格，但 Markdown 允许保留行尾空格。
- JS/CSS/SCSS 偏好单引号，YAML 偏好双引号。

仓库包含中文内容和少量 emoji。编辑中文 Markdown 时保持 UTF-8，不要因为终端显示乱码而误改正文编码。

## 验证建议

内容或样式改动后，至少执行：

```bash
bundle exec jekyll build
```

在当前 Windows 环境中等价命令是：

```powershell
C:\Ruby33-x64\bin\bundle.bat exec C:\Ruby33-x64\bin\jekyll.bat build
```

发布前或链接相关改动后，执行：

```bash
bash tools/test.sh
```

如果本地 Ruby gems 尚未安装，先运行 `bundle install`。在网络受限环境中，记录无法安装依赖的原因，不要提交生成的 `_site/`。

## 工作边界

- 不要提交 `_site/`、`.jekyll-cache/`、`.sass-cache/` 或其他构建产物。
- 不要无关修改主题配置、站点身份信息、社交链接和部署 workflow。
- 不要批量压缩或替换图片，除非任务明确要求。
- 不要随意改变 `permalink: /posts/:title/`，这会影响所有文章链接。
- 修改文章时优先做局部编辑，保留作者原有语气和内容结构。
- 对数学、控制、电机、嵌入式等技术内容，发现疑似公式或工程事实错误时先核对上下文，再给出明确说明。

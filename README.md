# Haitao Li — Personal Lab

A bilingual Jekyll/Chirpy site. English lives at `/`; Chinese lives at `/zh/`. Existing article paths remain valid and now serve English, with the Chinese version at the same path under `/zh/`.

## Develop and verify

```bash
bundle install
bash tools/run.sh --port 4000
bash tools/test.sh
```

The preview server serves both languages from `_site/`. After editing, rebuild with `bundle exec ruby tools/build.rb`, then refresh. The PWA may show an update notification; apply it to replace a cached version.

On this Mac, first set `PATH=/opt/homebrew/opt/ruby@3.3/bin:$PATH` and `BUNDLE_PATH=vendor/bundle`.

Do not use plain `jekyll build` or `jekyll serve`: the bilingual build stages two isolated Jekyll sites, resolves corresponding documents, and combines their output. GitHub Actions uses the same build and checks. Building locally does not publish anything.

## Content and translations

- `_content/en/` and `_content/zh/`: independent `index.md`, `_tabs/`, and `_posts/`.
- Each translated pair uses the same stable `translation_key`; filenames retain the existing article slugs and capitalization.
- `_data/i18n/en/` and `_data/i18n/zh/`: UI copy, learning paths, and photography captions.
- `_includes/lab-home.html`, `_includes/photo-journal.html`, layouts, CSS, images, and background animation are shared.

Each build receives only its own articles and data. Archives, recommendations, counts, metadata, reading time, and search are generated from that language. The language switch uses ordinary links, works without JavaScript, and stays on the corresponding document. Missing translations are disabled, never silently redirected. Browser language and previous localStorage language preferences do not override the URL.

The root sitemap contains both languages. Each page has its own canonical URL and reciprocal `hreflang` links; English is `x-default` where available. Service workers use separate language cache prefixes and scopes, with root scope excluding `/zh/`.

`tools/test.sh` builds production output, checks language/URL correspondence and search isolation, and runs HTML-Proofer for internal links and images. `_site/` and staging files are not committed.

## Theme overrides

The first page opened in a tab plays a 1.6-second lightning-and-reveal entrance, with a branching green arc extending from the center, flowing green character trails, a soft scanning sweep, and a brief name decode on the homepage. Character trails fade before the entrance ends; mobile screens use half as many columns. A shared `sessionStorage` flag prevents replay on refresh, navigation, or language changes in that tab. Reduced motion, background tabs, and unavailable storage skip the effect. Closing the tab ends the session (browser session restoration may preserve it). The effect is decorative and does not block interaction.

`_layouts/default.html` follows Chirpy 7.6 with one body-start hook for the background and language switch. Keep the switch outside the cached footer. `assets/js/service-worker.js` is staged at the theme's worker source path to preserve theme registration while isolating caches. Review these overrides when upgrading Chirpy.

## License

This work is published under [MIT][mit] License.

[gem]: https://rubygems.org/gems/jekyll-theme-chirpy
[chirpy]: https://github.com/cotes2020/jekyll-theme-chirpy/
[CD]: https://en.wikipedia.org/wiki/Continuous_deployment
[mit]: https://github.com/cotes2020/chirpy-starter/blob/master/LICENSE

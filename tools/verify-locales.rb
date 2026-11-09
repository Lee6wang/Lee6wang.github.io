#!/usr/bin/env ruby
# frozen_string_literal: true

require 'nokogiri'
require 'json'
require 'uri'
require 'yaml'
require 'date'

ROOT = File.expand_path('..', __dir__)
OUTPUT = File.join(ROOT, '_site')
HOST = YAML.safe_load_file(File.join(ROOT, '_config.yml')).fetch('url')

def check(condition, message)
  raise message unless condition
end

def local_file(url)
  path = URI::DEFAULT_PARSER.unescape(URI.parse(url).path)
  path += 'index.html' if path.end_with?('/')
  File.join(OUTPUT, path.delete_prefix('/'))
end

pages = Dir[File.join(OUTPUT, '**/*.html')]
check(!pages.empty?, 'Build the site first')
pages.each do |file|
  relative = file.delete_prefix(OUTPUT)
  chinese = relative.start_with?('/zh/')
  lang = chinese ? 'zh-CN' : 'en'
  html = Nokogiri::HTML(File.read(file))
  check(html.at_css('html')['lang'] == lang, "Wrong language: #{relative}")
  check(html.css('[data-i18n-lang], #site-i18n-data, script[src*="i18n.js"]').empty?, "Runtime translation remains: #{relative}")
  canonical = html.at_css('link[rel="canonical"]')&.[]('href')
  expected = HOST + relative.sub(/index\.html$/, '')
  check(canonical == expected, "Canonical mismatch: #{relative}: #{canonical}")
  versions = html.css('link[rel="alternate"][hreflang]').to_h { |link| [link['hreflang'], link['href']] }
  # Theme utility pages (e.g. 404) may intentionally omit alternate metadata.
  unless versions.empty?
    check(versions[lang] == expected, "Self hreflang missing: #{relative}")
    versions.each do |code, url|
      check(File.file?(local_file(url)), "Missing translation target: #{url}")
      next if code == 'x-default'
      other = Nokogiri::HTML(File.read(local_file(url)))
      reciprocal = other.css('link[rel="alternate"][hreflang]').find { |link| link['hreflang'] == lang }
      check(reciprocal && reciprocal['href'] == expected, "Nonreciprocal hreflang: #{relative}")
    end
    links = html.css('.language-switcher a')
    check(links.size == versions.keys.reject { |code| code == 'x-default' }.size, "Invalid language switch: #{relative}")
    links.each do |link|
      check(HOST + link['href'] == versions[link['hreflang']], "Language switch points to another page: #{relative}")
    end
    check(html.css('.language-switcher a[aria-current="page"]').size == 1, "Missing current language: #{relative}")
  end
  # Navigation, recommendations, archives and search targets stay within the chosen locale.
  html.css('a[href]').each do |link|
    next if link.ancestors('.language-switcher').any?
    href = link['href']
    next unless href.start_with?('/') && !href.start_with?('//')
    next if href.start_with?('/assets/', '/zh/assets/')
    check(href.start_with?('/zh/') == chinese, "Cross-language content link in #{relative}: #{href}")
  end
end

%w[en zh].each do |locale|
  prefix = locale == 'zh' ? '/zh' : ''
  posts = Dir[File.join(ROOT, "_content/#{locale}/_posts/*.md")].filter_map do |path|
    front = File.read(path).match(/\A---\n(.*?)\n---/m)[1]
    data = YAML.safe_load(front, permitted_classes: [Date, Time])
    next if data['published'] == false
    slug = File.basename(path, '.md').sub(/^\d{4}-\d{2}-\d{2}-/, '')
    ["#{prefix}/posts/#{slug}/", data]
  end.to_h
  search = JSON.parse(File.read(File.join(OUTPUT, "#{prefix.delete_prefix('/')}/assets/js/data/search.json")))
  check(search.size == posts.size, "Wrong search count for #{locale}")
  check(search.map { |item| item['url'] }.sort == posts.keys.sort, "Search paths differ for #{locale}")
  search.each do |item|
    check(item['title'] == posts.fetch(item['url'])['title'], "Wrong search title: #{item['url']}")
    check(!item['content'].empty?, "Empty search content: #{item['url']}")
  end
  pmsm = search.find { |item| item['url'].end_with?('/posts/PMSM/') }
  check(pmsm['content'].include?(locale == 'en' ? 'state space' : '状态空间'), "Wrong search body: #{locale}")
  if locale == 'en'
    check(search.none? { |item| item['title'].match?(/\p{Han}/) }, 'Chinese titles leaked into English search')
  end
  check(File.read(File.join(OUTPUT, "#{prefix.delete_prefix('/')}/sw.min.js")).include?("haitao-#{locale}-"), "Unscoped PWA cache: #{locale}")
end

sitemap = Nokogiri::XML(File.read(File.join(OUTPUT, 'sitemap.xml')))
urls = sitemap.xpath('//*[local-name()="loc"]').map(&:text)
check(urls.include?(HOST + '/posts/PMSM/') && urls.include?(HOST + '/zh/posts/PMSM/'), 'Sitemap missing a locale')
check(urls.uniq == urls, 'Duplicate sitemap URLs')
check(!File.exist?(File.join(OUTPUT, 'AGENT.md')), 'Internal instructions were published')
puts "Locale verification passed: #{pages.size} pages; canonical, hreflang, links, search, sitemap and PWA scopes."

# A future untranslated article must have a disabled option, not a misleading link.
require 'liquid'
switcher = Liquid::Template.parse(File.read(File.join(ROOT, '_includes/language-switcher.html')))
missing = switcher.render!({
  'page' => { 'language_versions' => { 'zh' => { 'lang' => 'zh-CN', 'url' => '/zh/posts/example/' } } },
  'site' => { 'locale' => 'zh', 'data' => { 'ui' => { 'language' => { 'label' => '语言', 'unavailable' => '暂无对应译文' } } } }
})
fragment = Nokogiri::HTML.fragment(missing)
check(fragment.at_css('span[aria-disabled="true"]')&.text == 'EN', 'Missing translation must be disabled')
check(fragment.css('a').size == 1 && fragment.at_css('a')['href'] == '/zh/posts/example/', 'Missing translation must not redirect')
puts 'Missing-translation rendering passed.'

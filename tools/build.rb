#!/usr/bin/env ruby
# frozen_string_literal: true

require 'bundler/setup'
require 'jekyll'
require 'tmpdir'
require 'fileutils'
require 'nokogiri'

ROOT = File.expand_path('..', __dir__)
LOCALES = { 'en' => { 'lang' => 'en', 'baseurl' => '' },
            'zh' => { 'lang' => 'zh-CN', 'baseurl' => '/zh' } }.freeze

# Read and generate both isolated sites before rendering, so links are resolved
# from actual Jekyll URLs (including generated archives), never guessed in JS.
def html_documents(site)
  (site.pages + site.collections.values.flat_map(&:docs)).select do |doc|
    doc.url.end_with?('/', '.html') && doc.data['sitemap'] != false
  end
end

def route_key(doc)
  return doc.data['translation_key'] if doc.data['translation_key']
  return "archive:#{doc.type}:#{doc.title}" if doc.is_a?(Jekyll::Archives::Archive)

  "page:#{doc.url}"
end

Dir.chdir(ROOT) do
  Dir.mktmpdir('haitao-locales-') do |workspace|
    sites = LOCALES.map do |locale, settings|
      source = File.join(workspace, locale)
      FileUtils.mkdir_p(source)
      %w[_includes _layouts _data assets].each do |entry|
        FileUtils.cp_r(entry, source) if File.exist?(entry)
      end
      # Override the theme asset by source path, keeping readable worker source in assets/js.
      FileUtils.mkdir_p(File.join(source, 'assets/js/dist'))
      FileUtils.mv(File.join(source, 'assets/js/service-worker.js'), File.join(source, 'assets/js/dist/sw.min.js'))
      FileUtils.cp_r(Dir.glob("_content/#{locale}/*", File::FNM_DOTMATCH).reject { |p| %w[. ..].include?(File.basename(p)) }, source)
      FileUtils.cp_r(Dir["_data/i18n/#{locale}/*"], File.join(source, '_data'))
      FileUtils.rm_rf(File.join(source, '_data/i18n'))
      ui = YAML.safe_load_file("_data/i18n/#{locale}/ui.yml")
      config = Jekyll.configuration({
        'config' => File.join(ROOT, '_config.yml'),
        'source' => source,
        'destination' => File.join(workspace, "output-#{locale}"),
        'plugins_dir' => File.join(ROOT, '_plugins'),
        'content_root' => File.join(ROOT, "_content/#{locale}"),
        'repository_root' => ROOT,
        'locale' => locale,
        'cache_dir' => File.join(workspace, "cache-#{locale}"),
        'disable_disk_cache' => true
      }.merge(settings).merge(ui.fetch('site')))
      site = Jekyll::Site.new(config)
      site.read
      site.generate
      site.collections.values.flat_map(&:docs).each do |doc|
        raise "Missing translation_key: #{doc.path}" unless doc.data['translation_key']
      end
      [locale, site]
    end.to_h

    routes = {}
    sites.each do |locale, site|
      html_documents(site).each do |doc|
        key = route_key(doc)
        routes[key] ||= {}
        raise "Duplicate translation_key #{key} in #{locale}" if routes[key].key?(locale)

        routes[key][locale] = { 'lang' => site.config['lang'], 'url' => "#{site.baseurl}#{doc.url}" }
      end
    end
    sites.each do |locale, site|
      html_documents(site).each do |doc|
        doc.data['language_versions'] = routes.fetch(route_key(doc))
      end
      site.render
      site.cleanup
      site.write
      puts "Built #{locale}: #{site.posts.docs.size} posts, #{html_documents(site).size} HTML pages"
    end

    # Combine only completed builds. A failed locale leaves the last preview intact.
    output = File.join(ROOT, '_site')
    FileUtils.rm_rf(output)
    FileUtils.cp_r(sites.fetch('en').dest, output)
    FileUtils.cp_r(sites.fetch('zh').dest, File.join(output, 'zh'))
    FileUtils.touch(File.join(output, '.nojekyll'))

    # Publish one sitemap containing both languages, preserving each locale's URLs.
    sitemap = Nokogiri::XML(File.read(File.join(output, 'sitemap.xml')))
    chinese = Nokogiri::XML(File.read(File.join(output, 'zh/sitemap.xml')))
    chinese.root.element_children.each { |node| sitemap.root.add_child(node.dup) }
    File.write(File.join(output, 'sitemap.xml'), sitemap.to_xml)
  end
end

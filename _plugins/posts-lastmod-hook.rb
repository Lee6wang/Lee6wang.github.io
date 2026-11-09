# frozen_string_literal: true

require 'open3'

Jekyll::Hooks.register :posts, :post_init do |post|
  next if post.data['last_modified_at']

  root = post.site.config['repository_root'] || post.site.source
  relative = post.path.delete_prefix("#{post.site.source}/")
  source = File.join(post.site.config['content_root'] || root, relative)
  candidates = [source]
  # Preserve pre-migration history until the moved files have their first commit.
  legacy = post.site.config['locale'] == 'en' ? '_includes/i18n-posts/en' : '_posts'
  candidates << File.join(root, legacy, File.basename(post.path))
  candidates.each do |path|
    dates, status = Open3.capture2('git', '-C', root, 'log', '--follow', '-2', '--format=%aI', '--', path)
    next unless status.success? && dates.lines.size > 1

    post.data['last_modified_at'] = dates.lines.first.strip
    break
  end
end

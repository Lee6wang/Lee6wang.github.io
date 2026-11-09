#!/usr/bin/env bash
# Build both languages and check the combined static site.
set -euo pipefail
cd "$(dirname "$0")/.."
JEKYLL_ENV=production bundle exec ruby tools/build.rb
bundle exec ruby tools/verify-locales.rb
bundle exec htmlproofer _site --disable-external \
  --ignore-urls '/^http:\/\/127.0.0.1/,/^http:\/\/0.0.0.0/,/^http:\/\/localhost/'

#!/usr/bin/env bash
# Re-run after editing content; serve the combined output with no language redirects.
set -euo pipefail
cd "$(dirname "$0")/.."
host=127.0.0.1
port=4000
export JEKYLL_ENV=development
while (($#)); do
  case "$1" in
    -H|--host) host="$2"; shift 2 ;;
    --port) port="$2"; shift 2 ;;
    -p|--production) export JEKYLL_ENV=production; shift ;;
    -h|--help) echo "Usage: bash tools/run.sh [-H HOST] [--port PORT] [-p|--production]"; exit ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done
bundle exec ruby tools/build.rb
bundle exec ruby -rwebrick -e 'WEBrick::HTTPServer.new(Port: ARGV[0].to_i, BindAddress: ARGV[1], DocumentRoot: "_site").tap { |server| trap("INT") { server.shutdown }; server.start }' "$port" "$host"

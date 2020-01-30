#!/usr/bin/env bash

set -e

REPO_OWNER="commercetools"
REPO_NAME="merchant-center-application-kit"

get_latest_release() {
  # Get the release marked as latest (no prelease)
  curl --silent "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases/latest" |
    grep '"tag_name":' |
    sed -E 's/.*"([^"]+)".*/\1/'
}
get_next_release() {
  # Get the last created release (no matter if it's a prerelease or not)
  curl --silent "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/releases?per_page=1" |
    grep '"tag_name":' |
    sed -E 's/.*"([^"]+)".*/\1/'
}

LATEST=$(get_latest_release)
NEXT=$(get_next_release)

cat > versions.js << EOF
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
module.exports = {
  latest: '$LATEST',
  next: '$NEXT'
}
EOF

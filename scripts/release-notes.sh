#!/bin/bash

# Generate release notes for the current release only
# Extracts changes between the previous tag and HEAD

# Get the latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$LATEST_TAG" ]; then
    # No tags yet, get all commits
    echo "### Changes"
    echo ""
    git log --pretty=format:"- %s (\`%h\`)" HEAD
else
    # Get commits since the latest tag, excluding chore/ci/dev commits
    echo "### Changes"
    echo ""
    git log --pretty=format:"- %s (\`%h\`)" "${LATEST_TAG}..HEAD" | grep -vE "^- (chore|ci|dev):"
fi

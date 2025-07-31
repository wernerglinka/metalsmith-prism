#!/bin/bash

# Secure release script for metalsmith-prism
# Handles GitHub token securely without exposing it in package.json

# Check if release type is provided
if [ $# -eq 0 ]; then
    echo "Error: Please specify release type (patch, minor, or major)"
    echo "Usage: ./scripts/release.sh [patch|minor|major] [options]"
    exit 1
fi

# Get release type
RELEASE_TYPE=$1
shift # Remove first argument so we can pass the rest to release-it

# Validate release type
if [[ ! "$RELEASE_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "Error: Invalid release type. Must be patch, minor, or major"
    exit 1
fi

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    echo "Please install it: https://cli.github.com/"
    exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: GitHub CLI is not authenticated"
    echo "Please run: gh auth login"
    exit 1
fi

# Get GitHub token from gh CLI
export GH_TOKEN=$(gh auth token)

if [ -z "$GH_TOKEN" ]; then
    echo "Error: Could not retrieve GitHub token from gh CLI"
    exit 1
fi

echo "🚀 Starting $RELEASE_TYPE release..."

# Run release-it with the specified type and any additional options
npx release-it "$RELEASE_TYPE" "$@"

# Clear the token from environment
unset GH_TOKEN

echo "✅ Release completed!"
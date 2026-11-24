#!/bin/bash
# Équivalent macOS/Linux de deploy.ps1 : build Jekyll puis publication sur la branche gh-pages.

set -euo pipefail

cd "$(dirname "$0")"
ROOT_PATH="$(pwd)"
SITE_PATH="$ROOT_PATH/_site"
DEPLOY_PATH="$ROOT_PATH/_ghpages_worktree"

cleanup() {
    if [ -d "$DEPLOY_PATH" ]; then
        git worktree remove "$DEPLOY_PATH" -f
    fi
}

echo "=== Building Jekyll site ==="
if ! bundle exec jekyll build; then
    echo "❌ Jekyll build failed. Make sure Ruby, Bundler, and Jekyll are installed."
    exit 1
fi

if [ ! -d "$SITE_PATH" ]; then
    echo "❌ _site folder not found at $SITE_PATH"
    exit 1
fi

# Ensure .nojekyll exists
touch "$SITE_PATH/.nojekyll"

# 1. Ensure gh-pages branch exists
git fetch origin gh-pages 2>/dev/null || true
if git show-ref --verify --quiet refs/remotes/origin/gh-pages; then
    # Branche présente sur le remote : la (re)créer en local à partir d'origin/gh-pages
    git branch -f gh-pages origin/gh-pages
elif ! git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "gh-pages branch does not exist. Creating orphan branch..."
    git checkout --orphan gh-pages
    git rm -rf . --ignore-unmatch
    git commit --allow-empty -m "Init gh-pages branch"
    git push origin gh-pages
    git checkout main
fi

# 2. Use a worktree for gh-pages
if [ -d "$DEPLOY_PATH" ]; then
    git worktree remove "$DEPLOY_PATH" -f 2>/dev/null || rm -rf "$DEPLOY_PATH"
    git worktree prune
fi

echo "=== Adding gh-pages worktree ==="
git worktree add "$DEPLOY_PATH" gh-pages
trap cleanup EXIT

# 3. Clear old files in worktree
echo "=== Cleaning gh-pages worktree ==="
find "$DEPLOY_PATH" -mindepth 1 -maxdepth 1 -not -name ".git" -exec rm -rf {} +

# 4. Copy _site into worktree (including dotfiles such as .nojekyll)
echo "=== Copying _site contents ==="
cp -R "$SITE_PATH"/. "$DEPLOY_PATH"/

# 5. Commit & push from worktree
cd "$DEPLOY_PATH"
git add .
if git diff --cached --quiet; then
    echo "Nothing to commit (no changes)"
else
    git commit -m "Deploy static site"
fi
git push origin gh-pages

echo "✅ Deployment complete!"

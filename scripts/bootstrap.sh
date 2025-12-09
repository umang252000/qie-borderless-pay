#!/usr/bin/env bash
set -e

echo "Bootstrapping project directories..."
mkdir -p contracts hardhat frontend backend tests docs .devcontainer

# initialize git
if [ ! -d ".git" ]; then
  git init
  git checkout -b dev || true
fi

# create template .gitignore and README
cat > .gitignore <<'EOF'
node_modules
.env
.env.local
dist
.cache
.vscode
.DS_Store
coverage
artifacts
typechain
/*.keystore
EOF

cat > README.md <<'EOF'
# QIE Borderless Pay - Hackathon Project

Repo scaffold initialized. Follow the README for dev steps.
EOF

# Make scripts executable
chmod +x scripts/*
echo "Bootstrap complete. You may now set up packages in frontend, backend, and hardhat directories."
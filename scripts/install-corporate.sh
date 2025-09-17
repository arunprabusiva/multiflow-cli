#!/bin/bash

echo "🏢 Multimflow Corporate Installation"
echo "=================================="
echo "Installing Multimflow for corporate environments with restrictions"
echo ""

# Check if we have Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 16+ first."
    echo "   Download from: https://nodejs.org/en/download/"
    exit 1
fi

echo "✅ Node.js: $(node --version)"

# Create local directory for MultiFlow
MULTIFLOW_DIR="$HOME/.multiflow"
mkdir -p "$MULTIFLOW_DIR"

echo "📦 Installing Multimflow locally (no admin rights needed)..."

# Try different installation methods
if npm install multiflow-cli --prefix "$MULTIFLOW_DIR" 2>/dev/null; then
    echo "✅ Installed via npm"
    MULTIFLOW_CMD="$MULTIFLOW_DIR/node_modules/.bin/multiflow-cli"
elif npx multiflow-cli --version 2>/dev/null; then
    echo "✅ Using npx (no installation needed)"
    MULTIFLOW_CMD="npx multiflow-cli"
else
    echo "⚠️  npm blocked, downloading standalone version..."
    curl -o "$MULTIFLOW_DIR/multiflow.js" https://raw.githubusercontent.com/arunprabusiva/multiflow-cli/main/multiflow-standalone.js
    chmod +x "$MULTIFLOW_DIR/multiflow.js"
    MULTIFLOW_CMD="node $MULTIFLOW_DIR/multiflow.js"
fi

# Create wrapper script
cat > "$MULTIFLOW_DIR/mflow" << EOF
#!/bin/bash
$MULTIFLOW_CMD "\$@"
EOF

chmod +x "$MULTIFLOW_DIR/mflow"

# Add to PATH
echo ""
echo "🔧 Setting up PATH..."
if [[ ":$PATH:" != *":$MULTIFLOW_DIR:"* ]]; then
    echo "export PATH=\"\$PATH:$MULTIFLOW_DIR\"" >> ~/.bashrc
    echo "export PATH=\"\$PATH:$MULTIFLOW_DIR\"" >> ~/.zshrc 2>/dev/null || true
fi

echo ""
echo "✅ Multimflow installed successfully!"
echo ""
echo "📋 Usage:"
echo "   $MULTIFLOW_DIR/mmflow --help"
echo "   $MULTIFLOW_DIR/mmflow init"
echo ""
echo "🔄 Restart your terminal or run: source ~/.bashrc"
echo "   Then you can use: mmflow --help"

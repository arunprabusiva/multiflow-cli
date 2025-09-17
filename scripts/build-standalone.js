#!/usr/bin/env node

// Build standalone executable for corporate environments
const fs = require('fs');
const path = require('path');

console.log('🔨 Building standalone MultiFlow executable...');

// Create a single-file executable script
const standaloneScript = `#!/usr/bin/env node

// MultiFlow CLI - Standalone Version for Corporate Environments
// No npm install required - just download and run

${fs.readFileSync(path.join(__dirname, 'src/core/RepoOrch.js'), 'utf8')}

${fs.readFileSync(path.join(__dirname, 'src/cli.js'), 'utf8').replace('const RepoOrch = require(\'./core/RepoOrch\');', '// RepoOrch class included above')}
`;

fs.writeFileSync('multiflow-standalone.js', standaloneScript);
console.log('✅ Created multiflow-standalone.js');
console.log('📋 Usage: node multiflow-standalone.js --help');
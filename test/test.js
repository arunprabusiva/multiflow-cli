#!/usr/bin/env node

// Simple test to verify MultiFlow CLI works
const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Running MultiFlow CLI tests...');

try {
  // Test CLI is accessible
  const cliPath = path.join(__dirname, '..', 'src', 'cli.js');
  const helpOutput = execSync(`node "${cliPath}" --help`, { encoding: 'utf8' });
  
  if (helpOutput.includes('Coordinate Git operations across multiple repositories')) {
    console.log('✅ CLI help command works');
  } else {
    throw new Error('CLI help output incorrect');
  }

  // Test version command
  const versionOutput = execSync(`node "${cliPath}" --version`, { encoding: 'utf8' });
  const packageJson = require('../package.json');
  if (versionOutput.includes(packageJson.version)) {
    console.log('✅ CLI version command works');
  } else {
    throw new Error(`CLI version output incorrect. Expected: ${packageJson.version}, Got: ${versionOutput}`);
  }

  console.log('🎉 All tests passed!');
  process.exit(0);
} catch (error) {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
}
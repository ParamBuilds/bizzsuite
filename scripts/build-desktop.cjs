/**
 * Desktop Build Script
 * 
 * This script automates the desktop release pipeline:
 * 1. Build the web app (Vite)
 * 2. Copy dist to BizSuiteDesktop
 * 3. Build the Electron installer
 * 
 * Usage:
 *   node scripts/build-desktop.js [--win|--mac|--linux]
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DESKTOP_DIR = path.join(ROOT_DIR, 'BizSuiteDesktop');
const WEB_DIST = path.join(ROOT_DIR, 'dist');
const DESKTOP_DIST = path.join(DESKTOP_DIR, 'dist');

// Parse arguments
const args = process.argv.slice(2);
const platform = args.find(a => a.startsWith('--'))?.replace('--', '') || 'win';

function log(message) {
  console.log(`\n[Desktop Build] ${message}`);
}

function run(command, cwd = ROOT_DIR) {
  log(`Running: ${command}`);
  execSync(command, { cwd, stdio: 'inherit' });
}

function copyDir(src, dest) {
  // Remove existing destination
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  
  // Create destination directory
  fs.mkdirSync(dest, { recursive: true });
  
  // Copy files recursively
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  try {
    log('Starting desktop build pipeline...');
    log(`Target platform: ${platform}`);
    
    // Step 1: Build web app
    log('Step 1/3: Building web application...');
    run('npm run build');
    
    if (!fs.existsSync(WEB_DIST)) {
      throw new Error('Web build failed - dist folder not found');
    }
    
    // Step 2: Copy dist to BizSuiteDesktop
    log('Step 2/3: Copying build to BizSuiteDesktop...');
    copyDir(WEB_DIST, DESKTOP_DIST);
    log(`Copied ${WEB_DIST} -> ${DESKTOP_DIST}`);
    
    // Verify copy
    const indexPath = path.join(DESKTOP_DIST, 'index.html');
    if (!fs.existsSync(indexPath)) {
      throw new Error('Copy failed - index.html not found in desktop dist');
    }
    
    // Step 3: Build Electron installer
    log('Step 3/3: Building Electron installer...');
    
    // Install dependencies if needed
    const nodeModules = path.join(DESKTOP_DIR, 'node_modules');
    if (!fs.existsSync(nodeModules)) {
      log('Installing desktop dependencies...');
      run('npm install', DESKTOP_DIR);
    }
    
    // Build for target platform
    run(`npm run build:${platform}`, DESKTOP_DIR);
    
    log('✅ Desktop build complete!');
    log(`Installer available at: ${path.join(DESKTOP_DIR, 'release')}`);
    
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    process.exit(1);
  }
}

main();

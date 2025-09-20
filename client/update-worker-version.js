const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, 'dist/gym-tracker/service-worker.js');
const packageJson = require('./package.json');
const version = `v${packageJson.version}-${Date.now()}`;

if (fs.existsSync(swPath)) {
  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(/const CACHE_NAME = '[^']*'/, `const CACHE_NAME = '${version}'`);
  fs.writeFileSync(swPath, swContent);
  console.log(`Service worker updated with version: ${version}`);
}
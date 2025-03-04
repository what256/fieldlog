#!/usr/bin/env node

/**
 * This script bumps the version number in app.json and package.json
 * Usage: node scripts/version-bump.js [major|minor|patch]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get bump type from command line args
const bumpType = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(bumpType)) {
  console.error('Error: Bump type must be either "major", "minor", or "patch"');
  process.exit(1);
}

// Read package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Parse version
const [major, minor, patch] = currentVersion.split('.').map(num => parseInt(num, 10));

// Calculate new version
let newMajor = major;
let newMinor = minor;
let newPatch = patch;

switch (bumpType) {
  case 'major':
    newMajor += 1;
    newMinor = 0;
    newPatch = 0;
    break;
  case 'minor':
    newMinor += 1;
    newPatch = 0;
    break;
  case 'patch':
    newPatch += 1;
    break;
}

const newVersion = `${newMajor}.${newMinor}.${newPatch}`;

// Update package.json
packageJson.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

// Read app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Update app.json version
appJson.expo.version = newVersion;

// Update build numbers
if (appJson.expo.ios) {
  const currentBuildNumber = parseInt(appJson.expo.ios.buildNumber || '1', 10);
  appJson.expo.ios.buildNumber = (currentBuildNumber + 1).toString();
}

if (appJson.expo.android) {
  const currentVersionCode = parseInt(appJson.expo.android.versionCode || 1, 10);
  appJson.expo.android.versionCode = currentVersionCode + 1;
}

// Write back app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

// Git operations
try {
  // Add changes
  execSync('git add package.json app.json');
  
  // Commit changes
  execSync(`git commit -m "Bump version to ${newVersion}"`);
  
  // Create tag
  execSync(`git tag v${newVersion}`);
  
  console.log(`
✅ Successfully bumped version from ${currentVersion} to ${newVersion}
   - package.json updated
   - app.json updated (including build numbers)
   - Git commit created
   - Git tag v${newVersion} created
   
To push these changes and the tag:
   git push && git push --tags
`);
} catch (error) {
  console.error('Error performing git operations:', error.message);
  console.log(`
✅ Successfully bumped version from ${currentVersion} to ${newVersion} in files
⚠️ Git operations failed. You'll need to commit the changes manually.
`);
} 
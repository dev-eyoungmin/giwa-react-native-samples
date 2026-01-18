const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const fs = require('fs');

const localSdkPath = path.resolve(__dirname, '../giwa-react-native-sdk');
const appNodeModules = path.resolve(__dirname, 'node_modules');

const config = getDefaultConfig(__dirname);

// Use local SDK if it exists, otherwise use node_modules version
if (fs.existsSync(localSdkPath)) {
  // Watch the SDK directory for changes (local development)
  config.watchFolders = [localSdkPath];

  // Map SDK package and force React from app
  config.resolver.extraNodeModules = {
    'giwa-react-native-wallet': localSdkPath,
    'react': path.resolve(appNodeModules, 'react'),
    'react-native': path.resolve(appNodeModules, 'react-native'),
  };

  // Use app's node_modules first, then SDK's for other dependencies
  config.resolver.nodeModulesPaths = [
    appNodeModules,
    path.resolve(localSdkPath, 'node_modules'),
  ];
}

module.exports = config;

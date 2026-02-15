const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Allow bundling .tflite models as assets
config.resolver.assetExts.push("tflite");

module.exports = config;

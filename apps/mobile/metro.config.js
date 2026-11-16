const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// pnpm 모노레포(watchFolders, nodeModulesPaths, symlink)는 Expo가 자동으로 처리함
const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });

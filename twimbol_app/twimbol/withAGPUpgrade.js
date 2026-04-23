const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withAGPUpgrade(config) {
  return withProjectBuildGradle(config, (config) => {
    // Find the default AGP version Expo uses and forcefully upgrade it to 8.9.1
    config.modResults.contents = config.modResults.contents.replace(
      /com\.android\.tools\.build:gradle:[\d\.]+/,
      'com.android.tools.build:gradle:8.9.1'
    );
    return config;
  });
};
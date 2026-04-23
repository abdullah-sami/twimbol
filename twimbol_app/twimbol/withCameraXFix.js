const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withCameraXFix(config) {
  return withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // The resolution strategy block we want to inject
    const resolutionStrategyFix = `
    configurations.all {
        resolutionStrategy.eachDependency { details ->
            if (details.requested.group == 'androidx.camera') {
                details.useVersion '1.5.0-alpha03'
            }
        }
    }`;

    // Only inject if it doesn't already exist to prevent duplicate blocks
    if (!buildGradle.includes("details.requested.group == 'androidx.camera'")) {
      // Find the 'allprojects {' block and inject our fix immediately after it
      config.modResults.contents = buildGradle.replace(
        /allprojects\s*\{/,
        `allprojects {${resolutionStrategyFix}`
      );
    }

    return config;
  });
};
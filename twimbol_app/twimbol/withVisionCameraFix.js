const { withProjectBuildGradle, withSettingsGradle } = require('@expo/config-plugins');

module.exports = function withVisionCameraFix(config) {
  // 1. Upgrade AGP in settings.gradle (Where Expo SDK 53+ actually defines it)
  config = withSettingsGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(/8\.8\.2/g, '8.9.1');
    return config;
  });

  // 2. Upgrade AGP in build.gradle (As a fallback) and Pin CameraX to 1.6.0
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    
    // Replace AGP if defined as a variable here
    contents = contents.replace(/8\.8\.2/g, '8.9.1');

    // Pin CameraX to the stable 1.6.0 release
    const cameraXPin = `
    configurations.all {
        resolutionStrategy.eachDependency { details ->
            if (details.requested.group == 'androidx.camera') {
                details.useVersion '1.6.0'
            }
        }
    }`;
    
    if (!contents.includes("details.requested.group == 'androidx.camera'")) {
      contents = contents.replace(/allprojects\s*\{/, `allprojects {${cameraXPin}`);
    }
    
    config.modResults.contents = contents;
    return config;
  });

  return config;
};
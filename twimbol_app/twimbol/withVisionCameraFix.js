const { withDangerousMod, withProjectBuildGradle } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withVisionCameraFix(config) {
  // 1. Intercept and upgrade AGP in the new Version Catalog (libs.versions.toml)
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const tomlPath = path.join(config.modRequest.platformProjectRoot, 'gradle', 'libs.versions.toml');
      if (fs.existsSync(tomlPath)) {
        let tomlContent = fs.readFileSync(tomlPath, 'utf8');
        // Find the AGP variable and aggressively swap it to 8.9.1
        tomlContent = tomlContent.replace(/agp\s*=\s*"[^"]+"/, 'agp = "8.9.1"');
        fs.writeFileSync(tomlPath, tomlContent);
      }
      return config;
    },
  ]);

  // 2. Keep the CameraX 1.6.0 pin in build.gradle
  config = withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    
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
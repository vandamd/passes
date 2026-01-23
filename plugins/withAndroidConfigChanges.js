const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withAndroidConfigChanges(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }
    const hasCameraPermission = manifest["uses-permission"].some(
      (p) => p.$?.["android:name"] === "android.permission.CAMERA"
    );
    if (!hasCameraPermission) {
      manifest["uses-permission"].push({
        $: { "android:name": "android.permission.CAMERA" },
      });
    }

    const mainActivity = manifest.application[0].activity.find(
      (activity) => activity.$["android:name"] === ".MainActivity"
    );
    if (mainActivity) {
      mainActivity.$["android:configChanges"] =
        "keyboard|keyboardHidden|orientation|screenSize|screenLayout|uiMode|density|fontScale|smallestScreenSize";
    }

    return config;
  });
};

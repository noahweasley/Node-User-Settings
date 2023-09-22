"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  const optionalFilename = "user-settings.json";

  const hasName = await settings.hasKey("name");
  const hasName2 = await settings.hasKey("name", optionalFilename);

  console.log("Preference has name? : %s", hasName);
  console.log("Optional preference has name ? : %s", hasName2);
})();

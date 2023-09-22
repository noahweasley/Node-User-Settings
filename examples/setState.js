"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  const optionalFilename = "user-settings.json";

  const isSet = await settings.setState("name", "Noah");
  const isSet2 = await settings.setState("version", "1.0.0", optionalFilename);

  console.log("is value set? %s and %s", isSet, isSet2);
})();

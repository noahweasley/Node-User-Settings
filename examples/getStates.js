"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  const value1 = await settings.getStates(["name", "version"]);

  const optionalFilename = "user-settings.json";
  const value2 = await settings.getStates(["name", "Job"], optionalFilename);

  console.log("got: %s", [...value1, ...value2]);
})();

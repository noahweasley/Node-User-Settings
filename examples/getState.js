"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  const name1 = await settings.getState("name", "Noah");

  const optionalFilename = "user-settings.json";
  const name2 = await settings.getState("name", "Noah", optionalFilename);

  console.log("got: %s and %s", name1, name2);
})();

"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  let optionalFilename = "user-settings.json";

  let values = await settings.setStates({ name: "Noah", version: "1.0.0" });
  let values2 = await settings.setStates({ name: "Wesley", Job: "Front end Engineer" }, optionalFilename);

  console.log("The values that were set: %s", [...values, ...values2]);
})();

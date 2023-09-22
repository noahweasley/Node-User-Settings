"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

(async function main() {
  const optionalFilename = "user-settings.json";

  const values = await settings.setStates({ name: "Noah", version: "1.0.0" });
  const values2 = await settings.setStates({ name: "Wesley", Job: "Front end Engineer" }, optionalFilename);

  console.log("The values that were set: %s", [...values, ...values2]);
})();

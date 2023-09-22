"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

settings.setStates_c({ name: "Noah", version: "1.0.0" }, null, (_err, values) => {
  console.log(`value that was set: ${values}`);
});

const optionalFilename = "user-settings.json";

settings.setStates_c({ name: "Wesley", Job: "Front end Engineer" }, optionalFilename, (_err, values) => {
  console.log(`value the was set (optional): ${values}`);
});

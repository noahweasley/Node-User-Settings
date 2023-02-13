"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

settings.getStates_c(["name", "version"], null, (_err, value1) => {
  console.log("Got %s: ", value1);
});

let optionalFilename = "user-settings.json";

settings.getStates_c(["name", "Job"], optionalFilename, (_err, value2) => {
  console.log("Got %s: ", value2);
});

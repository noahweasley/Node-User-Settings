"use-strict";

const settings = require("../src/index").defaults;

// disable electron storage path else exception is thrown
settings.setUseElectronStorage(false);
settings.setDefaultPreferenceFilePath("./examples/settings.json");

settings.hasKey_c("name", null, (_err, hasKey) => {
  console.log(`Preference has a name ? : ${hasKey}`);
});

const optionalFilename = "user-settings.json";

settings.hasKey_c("name", optionalFilename, (_err, hasKey) => {
  console.log(`Optional preference has a name ? : ${hasKey}`);
});

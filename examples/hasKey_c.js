"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

settings.hasKey_c("name", null, (_err, hasKey) => {
  console.log("Preference has a name ? : " + hasKey);
});

let optionalFilename = "user-settings.json";

settings.hasKey_c("name", optionalFilename, (_err, hasKey) => {
  console.log("Optional preference has a name ? : " + hasKey);
});

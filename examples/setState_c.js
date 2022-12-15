"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

settings.setState_c("name", "Noah", null, (_err, isSet) => {
  console.log("is name set (callback): " + isSet);
});

let optionalFilename = "user-settings.json";

settings.setState_c("name", "Wesley", optionalFilename, (_err, isSet) => {
  console.log("is name set (callback): " + isSet);
});

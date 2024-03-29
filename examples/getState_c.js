"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

settings.getState_c("name", "Noah", null, (_err, isSet) => {
  console.log("Retrieved author's name: " + isSet);
});

let optionalFilename = "user-settings.json";

settings.getState_c("name", "Wesley", optionalFilename, (_err, isSet) => {
  console.log("Retrieved author's name: " + isSet);
});

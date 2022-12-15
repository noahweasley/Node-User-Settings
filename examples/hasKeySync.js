"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

let hasName = settings.hasKeySync("name");

let optionalFilename = "user-settings.json";

let hasVersion = settings.hasKeySync("version", optionalFilename);

console.log("Preference has name ? : %s", hasName);

console.log("Preference has version ? : %s", hasVersion);

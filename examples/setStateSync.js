"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

let isSet = settings.setStateSync("name", "Noah");

let optionalFilename = "user-settings.json";

let isSet2 = settings.setStateSync("version", "1.0.0", optionalFilename);

console.log("is name set (sync): %s and %s", isSet, isSet2);
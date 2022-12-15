"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

let name = settings.getStateSync("name", "Unknown");

let optionalFilename = "user-settings.json";

let version = settings.getStateSync("version", "1.0.0", optionalFilename);

console.log("got: %s and %s", name, version);
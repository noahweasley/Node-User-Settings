"use-strict";

const settings = require("../src/index").defaults;

settings.setDefaultPreferenceFilePath("./examples/settings.json");

let value1 = settings.setStatesSync({ name: "Noah", version: "1.0.0" });

let optionalFilename = "user-settings.json";

let value2 = settings.setStatesSync({ name: "Wesley", Job: "Front end Engineer" }, optionalFilename);

console.log("The values there were set %s", [...value1, ...value2]);

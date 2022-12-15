"use-strict";

const settings = require("../src/index")({
  preferenceFileDir: process.env.NODE_USER_SETTINGS_DIRECTORY,
  fileName: "Settings",
  fileExt: "json"
});

console.log(settings);

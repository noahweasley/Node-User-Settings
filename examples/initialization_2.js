"use-strict";

const settings = require("../src/index")({
  /** Use this line only and set a full path to file */
  preferenceFileName: process.env.NODE_USER_SETTINGS_FILE_PATH,
  /** Use this line with either preferenceFileName (pointing to the filename only) or with fileName and fileExt */
  preferenceFileDir: process.env.NODE_USER_SETTINGS_DIRECTORY,
  fileName: "Settings",
  fileExt: "json"
});

console.log(settings);

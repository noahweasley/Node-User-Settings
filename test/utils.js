const fsp = require("fs/promises");
const fs = require("fs");
const path = require("path");

/**
 * replaces file path of a given path with the path's directory appended with the new file name
 *
 * @param {string} preferenceFilePath the given file in which would be replaced
 * @param {string} optionalFilename   the new file name to be appended to the directory of the given file
 * @returns                           a new file path to the file required
 */
module.exports.getTempFileDirectoryFromPath = function (preferenceFilePath, optionalFilename) {
  return path.join(path.dirname(preferenceFilePath), optionalFilename);
};

/**
 * Synchronously persists a custom states to the preference file using state mapping
 *
 * @param {string} preferenceFilePath
 * @param {JSON} statesMap
 * @returns
 */
module.exports.pumpPreferenceSync = function (preferenceFilePath, statesMap) {
  let preferenceOb = {};
  let inserted = Object.keys(statesMap).map((key) => (preferenceOb[`${key}`] = `${statesMap[`${key}`]}`));

  try {
    fs.writeFileSync(preferenceFilePath, JSON.stringify(preferenceOb), { encoding: "utf-8" });
  } catch (err) {
    this.deleteSettingsSync(preferenceFilePath);
    this.pumpPreferenceSync(preferenceFilePath, statesMap);
  }

  return inserted;
};

/**
 * Asynchronously persists a custom states to the preference file using state mapping
 *
 * @param {string} preferenceFilePath
 * @param {JSON} statesMap
 * @returns
 */
module.exports.pumpPreference = async function (preferenceFilePath, statesMap) {
  let preferenceOb = {};
  let inserted = Object.keys(statesMap).map((key) => (preferenceOb[`${key}`] = `${statesMap[`${key}`]}`));

  let filehandle;
  try {
    filehandle = await fsp.open(preferenceFilePath, "wx+");
    await fsp.writeFile(preferenceFilePath, JSON.stringify(preferenceOb), { encoding: "utf-8", mode: 755 });
  } catch (err) {
    await this.deleteSettings(preferenceFilePath);
    this.pumpPreference(preferenceFilePath, statesMap);
  } finally {
    filehandle?.close();
  }

  return inserted;
};

/**
 * Asynchronously persists a custom states to the preference file using state mapping
 *
 * @param {string} preferenceFilePath
 * @param {JSON} statesMap
 * @param {Function} callbackfn
 * @returns
 */
module.exports.pumpPreference_c = function (preferenceFilePath, statesMap, callbackfn) {
  let preferenceOb = {};
  let inserted = Object.keys(statesMap).map((key) => (preferenceOb[`${key}`] = `${statesMap[`${key}`]}`));

  fs.open(preferenceFilePath, "wx+", (err, fd) => {
    if (err) {
      return callbackfn(err);
    } else {
      fs.writeFile(fd, JSON.stringify(preferenceOb), { encoding: "utf-8" }, function (err) {
        callbackfn(err, inserted);
      });
    }
  });
};

module.exports.deleteSettings = async function (preferenceFilePath) {
  return await fsp.unlink(preferenceFilePath);
};

module.exports.deleteSettingsSync = function (preferenceFilePath) {
  return fs.unlinkSync(preferenceFilePath);
};

module.exports.readPreference = async function (preferenceFilePath) {
  let preference = await fsp.readFile(preferenceFilePath, { encoding: "utf-8" });
  return JSON.parse(preference);
};

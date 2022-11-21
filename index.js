/**
 * MIT License
 *
 * Copyright (c) 2022 Noah
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 **/

"use-strict";

const path = require("path");
const fsp = require("fs/promises");
const fs = require("fs");

const CONSTANTS = require("./pref-constants");

/**
 * @param {*} config the configuration to be used in initialization
 * @returns the required APIs
 */
module.exports = function (config) {
  let { preferenceFileDir, preferenceFileName, fileName, fileExt } = config;

  // preferenceFileName is deprecated to enable custom file extensions

  preferenceFileName && console.warn("preferenceFileName option is deprecated, please refer to the docs");

  const defPreferenceFilePath = path.join(
    preferenceFileDir,
    preferenceFileName ? preferenceFileName : `${fileName}.${fileExt || CONSTANTS.fileExt}`
  );

  const getDefaultPreferenceFilePath = () => defPreferenceFilePath;

  const getPreferenceFilePath = (prefFileName) =>
    prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

  // check arguments so that there is no error thrown at runtime; synchronously
  function checkArgs(...args) {
    args.forEach((arg) => {
      if (arg && !args instanceof String) {
        throw new Error(`${arg} must be a String`);
      }
    });
  }

  // check arguments so that there is no error thrown at runtime; asynchronously
  function checkArgsP(...args) {
    args.forEach((arg) => {
      if (arg && !args instanceof String) {
        return Promise.reject(new Error(`${arg} must be a String`));
      }
    });

    return Promise.resolve(args.length);
  }

  /**
   * asychronoously replaces the data in the user settings with the one specified by `dataOb`.
   * A very uselful api for development purposes
   *
   * @param {*} dataOb a JSON object to be persisted
   * @param {*} preferenceFileName an optional file name to persist the settings
   * @returns true if it was persisted
   */
  async function serialize(dataOb, preferenceFileName) {
    return await setPreferences(dataOb, preferenceFileName);
  }

  /**
   * synchronously replaces the data in the user settings with the one specified by `dataOb`.
   * A very uselful api for development purposes
   *
   * @param {*} dataOb a JSON object to be persisted
   * @param {*} preferenceFileName an optional file name to persist the settings
   * @returns true if it was persisted
   */
  function serializeSync(dataOb, preferenceFileName) {
    return setPreferencesSync(dataOb, preferenceFileName);
  }

  /**
   * asynchronously gets the data in the user settings.
   * A very uselful api for development purposes
   *
   * @returns the persisted object as it exists in disk
   */
  async function deserialize(preferenceFileName) {
    return JSON.stringify(await getPreferences(preferenceFileName));
  }

  /**
   * synchronously gets the data in the user settings.
   * A very uselful api for development purposes
   *
   * @returns the persisted object as it exist in disk, synchronously
   */
  function deserializeSync(preferenceFileName) {
    return JSON.stringify(getPreferencesSync(preferenceFileName));
  }

  /**
   * asynchronously delete a specific settings file or the default, if the preference filename was not specified.
   * A very uselful api for development purposes
   *
   * @param preferenceFileName the optional file to be deleted
   */
  async function deleteFile(preferenceFileName) {
    let filePath = getPreferenceFilePath(preferenceFileName);

    try {
      return await fsp.unlink(filePath);
    } catch (err) {}
    return;
  }

  /**
   * synchrounously delete a specific settings file or the default, if the preference filename was not specified.
   * A very uselful api for development purposes
   *
   * @param preferenceFileName the optional file to be deleted
   */
  function deleteFileSync(preferenceFileName) {
    checkArgs(preferenceFileName);
    let filePath = getPreferenceFilePath(preferenceFileName);

    try {
      return fs.unlinkSync(filePath);
    } catch (err) {}
  }

  // asynchronously read the preference file from disk and then return an object representation of the file
  async function getPreferences(prefFileName) {
    await checkArgsP(prefFileName);
    let filePath = getPreferenceFilePath(preferenceFileName);

    try {
      let data = await fsp.readFile(filePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPrefFile();
    }

    async function createPrefFile() {
      let filehandle;
      try {
        filehandle = await fsp.open(filePath, "wx");
        await fsp.writeFile(filehandle, "{}");
      } catch (err) {
        if (err.code === "EEXIST") return {};
        else if (err.code === "ENOENT") createPrefDirectory(filePath);
        else return {};
      } finally {
        await filehandle?.close();
      }

      async function createPrefDirectory() {
        try {
          await fsp.mkdir(preferenceFileDir, {
            recursive: true
          });
        } catch (err) {
          // ignored
        } finally {
          return {};
        }
      }

      return {};
    }
  }

  // synchronously reads the preference file from disk and then return an object representation of the file
  function getPreferencesSync(prefFileName) {
    checkArgs(prefFileName);
    let filePath = getPreferenceFilePath(prefFileName);

    try {
      let data = fs.readFileSync(filePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPrefFileSync();
    }

    function createPrefFileSync() {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "{}");
        return {};
      } else {
        return createPrefDirectorySync();
      }

      function createPrefDirectorySync() {
        fs.mkdirSync(preferenceFileDir, { recursive: true });
        return {};
      }
    }
  }

  // asynchronously reads the preference file from disk and then return an object representation of the file
  function getPreferencesWithCallback(prefFileName, callbackfnc) {
    checkArgs(prefFileName);
    let filePath = getPreferenceFilePath(prefFileName);

    fs.readFile(filePath, function (err, data) {
      if (err) {
        return createPrefFile(callbackfnc);
      } else {
        return callbackfnc(null, JSON.parse(data.toString()));
      }
    });

    function createPrefFile(callbackfnc) {
      fs.open(filePath, "wx", (err, fd) => {
        if (err /** file not found or some other error occurred */) {
          return createPrefDirectory(fd, callbackfnc);
        } else {
          fs.writeFile(fd, "{}", (err) => callbackfnc(err, "{}"));
        }
      });

      // create file directory
      function createPrefDirectory(fd, callbackfnc) {
        fs.mkdir(fd, { recursive: true }, (err) => {
          callbackfnc(err, {});
          fd?.close();
        });
      }
    }
  }

  // asynchronously writes to file, the JSON object specified by *pref*
  async function setPreferences(pref, prefFileName) {
    await checkArgsP(pref, prefFileName);
    let fileName = getPreferenceFilePath(prefFileName);

    const preference = JSON.stringify(pref);
    try {
      await fsp.writeFile(fileName, preference);
      return true;
    } catch (err) {
      return false;
    }
  }

  // synchronously writes to file, the JSON object specified by *pref*
  function setPreferencesSync(pref, prefFileName) {
    checkArgs(pref, prefFileName);
    let fileName = getPreferenceFilePath(prefFileName);
    const preference = JSON.stringify(pref);

    try {
      fs.writeFileSync(fileName, preference);
      return true;
    } catch (err) {
      return false;
    }
  }

  // asynchrounously writes to file, the JSON object specified by "pref"
  function setPreferencesWithCallback(pref, prefFileName, callbackfnc) {
    checkArgs(pref, prefFileName);
    const filePath = getPreferenceFilePath(prefFileName);
    const preference = JSON.stringify(pref);

    fs.writeFile(filePath, preference, (err) => {
      if (err) {
        callbackfnc(false);
      } else {
        return callbackfnc(true);
      }
    });
  }

  /**
   *  asynchronously checks if the key specified by *key* is present
   *
   * @param key the key to check it's existence
   */
  async function hasKey(key, prefFileName) {
    await checkArgsP(key);
    let dataOB = await getPreferences(prefFileName);
    return Object.keys(dataOB).includes(key);
  }

  /**
   *  synchronously checks if the key specified by *key* is present
   *
   * @param key the key to check it's existence
   */
  function hasKeySync(key, prefFileName) {
    checkArgs(key);
    let dataOB = getPreferencesSync(prefFileName);
    return Object.keys(dataOB).includes(key);
  }

  /**
   * asynchronously checks if the key specified by *key* is present
   *
   * @param key the key to check it's existence
   */
  function hasKey_c(key, prefFileName, callbackfnc) {
    checkArgs(key);
    getPreferencesWithCallback(prefFileName, (err, dataOB) => {
      if (err) callbackfnc(err);
      else callbackfnc(null, Object.keys(dataOB).includes(key));
    });
  }

  /**
   *  asynchronously retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   * @returns a Promises that resolves to the value set previously or just resolves to the default value
   */
  async function getState(key, defaultValue, prefFileName) {
    await checkArgsP(key, prefFileName);
    return new Promise(async (resolve, _reject) => {
      // first check if key exists
      if (await hasKey(key, prefFileName)) {
        const dataOB = await getPreferences(prefFileName);
        resolve(`${dataOB[`${key}`]}`);
      } else {
        // emit promise based result
        resolve(`${defaultValue}`);
      }
    });
  }

  /**
   * synchronously  retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   */
  function getStateSync(key, defaultValue, prefFileName) {
    checkArgs(key, prefFileName);
    // first check if key exists
    if (hasKeySync(key, prefFileName)) {
      const dataOB = getPreferencesSync(prefFileName);
      return `${dataOB[`${key}`]}`;
    } else return `${defaultValue}`;
  }

  /**
   * using callbacks, asynchronously  retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   * @param {*} callbackfnc a qualified callback method with and error object as first argument and data as the second
   */
  function getState_c(key, defaultValue, prefFileName, callbackfnc) {
    checkArgs(prefFileName);

    hasKey_c(key, prefFileName, (_err1, hasKey) => {
      if (hasKey) {
        getPreferencesWithCallback(prefFileName, (_err2, dataOB) => callbackfnc(null, `${dataOB[`${key}`]}`));
      } else {
        callbackfnc(null, `${defaultValue}`);
      }
    });
  }

  /**
   *  asynchronously retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   * @returns a Promise that resolves to the values set previously or just resolves to an empty array
   */
  async function getStates(states = [], prefFileName) {
    await checkArgsP(prefFileName);
    return new Promise(async (resolve, reject) => {
      if (!states instanceof Array) {
        reject(new Error("states must be a qualified Array object"));
      }

      const dataOB = await getPreferences(prefFileName);
      let values = states.map((key) => `${dataOB[`${key}`]}`);

      resolve(values);
    });
  }

  /**
   * synchronously  retrieves the state of a user preference using a key-value pair
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} defaultValue the default value to be retrieved if that key has never been set
   * @returns a Promise that resolves to the values set previously or just resolves to an empty array
   */
  function getStatesSync(states, prefFileName) {
    checkArgs(prefFileName);
    if (!states instanceof Array) {
      throw new Error("states must be a qualified Array object");
    }
    const dataOB = getPreferencesSync(prefFileName);
    let values = states.map((key) => `${dataOB[`${key}`]}`);

    return values;
  }

  /**
   * synchronously sets the state of a user preference using a key-value pair
   * Note: A new key would be created after this request
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} value the value to be set
   */
  function setStateSync(key, value, prefFileName) {
    checkArgs(key, prefFileName);
    let pref = getPreferencesSync(prefFileName);
    pref[`${key}`] = `${value}`;
    return setPreferencesSync(pref);
  }

  /**
   *  asynchronously sets the state of a user preference using a key-value pair
   *  Note: A new key would be created after this request
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param {*} key the key in settings in which it's value would be retrieved
   * @param {*} value the value to be set
   */
  async function setState(key, value, prefFileName) {
    await checkArgsP(key, prefFileName);
    return new Promise(async (resolve, _reject) => {
      let pref = await getPreferences(prefFileName);
      pref[`${key}`] = `${value}`;

      const isPreferenceSet = await setPreferences(pref, prefFileName);

      resolve(isPreferenceSet);
    });
  }

  /**
   *  asynchronously sets the states of a user preference using a JSON object containing key-value pairs
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param states an object representing the states to be synched
   * @returns the number of staes that was saved
   */
  async function setStates(states, prefFileName) {
    await checkArgsP(prefFileName);
    return new Promise(async (resolve, reject) => {
      if (!states instanceof Object) {
        reject(new Error("states must be a qualified JSON object"));
      }
      let pref = await getPreferences(prefFileName);
      let inserted = Object.keys(states).map((key) => (pref[`${key}`] = `${states[`${key}`]}`));

      const isPreferenceSet = await setPreferences(pref, prefFileName);
      isPreferenceSet ? resolve(inserted) : reject([]);
    });
  }

  /**
   * synchronously sets the states of a user preference using a JSON object containing key-value pairs
   *
   * @param {*} prefFileName refers to file name for the preference to be use if this was set, if not, then
   *                     the default file would be used
   * @param states an object representing the states to be synched
   * @returns the number of staes that was saved
   */
  function setStatesSync(states, prefFileName) {
    checkArgs(prefFileName);
    if (!states instanceof Object) {
      throw new Error("states must be a qualified JSON object");
    }
    let pref = getPreferencesSync(prefFileName);
    let inserted = Object.keys(states).map((key) => (pref[`${key}`] = `${states[`${key}`]}`));

    return setPreferencesSync(pref) ? inserted : [];
  }

  /**
   * asynchronously removes a preference value from settings if it exists
   * Note: Trying to use *getState()* would just return the default arg set
   *
   * @param {*} key the key in settings that would be deleted
   */
  async function deleteKey(key, prefFileName) {
    await checkArgsP(key, prefFileName);
    let pref = await getPreferences(prefFileName);
    // check if key is present in prefs
    if (await hasKey(key, prefFileName)) {
      delete pref[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return await setPreferences(pref, prefFileName);
  }

  /**
   * synchronously removes a preference value from settings if it exists
   * Note: Trying to use *getState()* would just return the default arg set
   *
   * @param {*} key the key in settings that would be deleted
   */
  function deleteKeySync(key, prefFileName) {
    checkArgs(key, prefFileName);
    let pref = getPreferencesSync();
    // check if key is present in prefs
    if (hasKeySync(key, prefFileName)) {
      delete pref[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return setPreferencesSync(pref);
  }

  return {
    getDefaultPreferenceFilePath,
    getState,
    getState_c,
    getStateSync,
    getStates,
    getStatesSync,
    setStateSync,
    setState,
    setStates,
    setStatesSync,
    deleteKey,
    deleteKeySync,
    hasKey,
    hasKeySync,
    hasKey_c,
    serialize,
    deserialize,
    serializeSync,
    deserializeSync,
    deleteFile,
    deleteFileSync
  };
};

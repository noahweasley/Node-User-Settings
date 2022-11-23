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

  /**
   * Gets the default save path to the preference
   *
   * @returns {*} the default save path to the preference
   */
  const getDefaultPreferenceFilePath = () => defPreferenceFilePath;

  function getPreferenceFilePath(optionalFileName) {
    return optionalFileName ? path.join(preferenceFileDir, optionalFileName) : defPreferenceFilePath;
  }

  // check arguments so that there is no error thrown at runtime; synchronously
  function checkArgs(...args) {
    args.forEach(function (arg) {
      if (arg && !args instanceof String) {
        throw new Error(`${arg} must be a String`);
      }
    });
  }

  // check arguments so that there is no error thrown at runtime; asynchronously
  function checkArgsP(...args) {
    args.forEach(function (arg) {
      if (arg && !args instanceof String) {
        return Promise.reject(new Error(`${arg} must be a String`));
      }
    });

    return Promise.resolve(args.length);
  }

  /**
   * Asynchronously replaces all data in preference
   *
   * @param {*} preferenceOb      A JSON object to be serialized and persisted
   * @param {*} optionalFileName  An optional filename used to persist the settings. This can be left null
   * @returns                     a Promise that resolves to a boolean indicating if it was persisted
   */
  async function serialize(preferenceOb, optionalFileName) {
    return await setPreferences(preferenceOb, optionalFileName);
  }

  /**
   * Asynchronously replaces all data in preference
   *
   * @param {*} preferenceOb       A JSON object to be serialized and persisted
   * @param {*} optionalFileName   An optional filename used to persist the settings. This can be left _null_
   * @param {*} callbackfn        A Node-Js qualified callback with any error that occurred as the first argument
   *                              and a Boolean; if the file was successfully persisted
   */
  function serialize_c(preferenceOb, optionalFileName, callbackfn) {
    setPreferencesWithCallback(preferenceOb, optionalFileName, callbackfn);
  }

  /**
   * Synchronously replaces all data in preference
   *
   * @param {*} preferenceOb       A JSON object to be serialized and persisted
   * @param {*} optionalFileName   An optional filename used to persist the settings. This can be left null
   * @returns                      true if it was persisted
   */
  function serializeSync(preferenceOb, optionalFileName) {
    return setPreferencesSync(preferenceOb, optionalFileName);
  }

  /**
   * Asynchronously retrieves all the data in preference
   *
   * @param {*} optionalFileName An optional filename used to persist the settings. This can be left null

   * @returns                    a Promise that resolves to the persisted object as it exists in preference
   */
  async function deserialize(optionalFileName) {
    return JSON.stringify(await getPreferences(optionalFileName));
  }

  /**
   * Synchronously retrieves all the data in preference
   *
   * @returns  The persisted object as it exists in preference
   */
  function deserializeSync(optionalFileName) {
    return JSON.stringify(getPreferencesSync(optionalFileName));
  }

  /**
   * Asynchronously retrieves all the data in preference
   *
   * @param {*} optionalFileNameAn  optional filename used to persist the settings. This can be left null
   * @param {*} callbackfn          A Node-Js qualified callback with any error that occurred as the first
   *                                argument and a String; which is the data that was deserialized and retrieved
   *
   */
  function deserialize_c(optionalFileName, callbackfn) {
    getPreferencesWithCallback(optionalFileName, callbackfn);
  }

  /**
   * Asynchronously deletes the preference file
   *
   * @param optionalFileName  An optional filename in which the corresponding file would be deleted. This can be left null
   * @returns                 a Promise that resolves to a boolean, indicating if the file was deleted
   */
  async function deleteFile(optionalFileName) {
    let filePath = getPreferenceFilePath(optionalFileName);

    try {
      return await fsp.unlink(filePath);
    } catch (err) {}
    return;
  }

  /**
   * Synchronously deletes the preference file
   *
   * @param optionalFileName An optional filename in which the corresponding file would be deleted. This can be left null
   * @returns                a boolean indicating if the file was deleted
   */
  function deleteFileSync(optionalFileName) {
    checkArgs(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

    try {
      return fs.unlinkSync(filePath);
    } catch (err) {}
  }

  /**
   * Asynchronously deletes the preference file
   *
   * @param optionalFileName An optional filename in which the corresponding file would be deleted. This can be left null
   * @param callbackfn       A Node-Js qualified callback with any error that occurred as the first argument and a Boolean;
   *                         if the file was successfully deleted
   *
   */
  function deleteFile_c(optionalFileName, callbackfn) {
    checkArgs(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);
    fs.unlink(filePath, callbackfn);
  }

  // asynchronously read the preference file from disk and then return an object representation of the file
  async function getPreferences(optionalFileName) {
    await checkArgsP(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

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
  function getPreferencesSync(optionalFileName) {
    checkArgs(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

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
  function getPreferencesWithCallback(optionalFileName, callbackfn) {
    checkArgs(optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

    fs.readFile(filePath, function (err, data) {
      if (err) {
        return createPrefFile(callbackfn);
      } else {
        return callbackfn(null, JSON.parse(data.toString()));
      }
    });

    function createPrefFile(callbackfn) {
      fs.open(filePath, "wx", (err, fd) => {
        if (err /** file not found or some other error occurred */) {
          return createPrefDirectory(fd, callbackfn);
        } else {
          fs.writeFile(fd, "{}", (err) => callbackfn(err, {}));
        }
      });

      // create file directory
      function createPrefDirectory(fd, callbackfn) {
        fs.mkdir(fd, { recursive: true }, (err) => {
          callbackfn(err, {});
          fd?.close();
        });
      }
    }
  }

  // asynchronously writes to file, the JSON object specified by *preferenceOb*
  async function setPreferences(preferenceOb, optionalFileName) {
    await checkArgsP(preferenceOb, optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);

    const preference = JSON.stringify(preferenceOb);

    try {
      await fsp.writeFile(filePath, preference);
      return true;
    } catch (err) {
      return false;
    }
  }

  // synchronously writes to file, the JSON object specified by *preferenceOb*
  function setPreferencesSync(preferenceOb, optionalFileName) {
    checkArgs(preferenceOb, optionalFileName);
    let filePath = getPreferenceFilePath(optionalFileName);
    const preference = JSON.stringify(preferenceOb);

    try {
      fs.writeFileSync(filePath, preference);
      return true;
    } catch (err) {
      return false;
    }
  }

  // asynchronously writes to file, the JSON object specified by "preferenceOb"
  function setPreferencesWithCallback(preferenceOb, optionalFileName, callbackfn) {
    checkArgs(preferenceOb, optionalFileName);
    const filePath = getPreferenceFilePath(optionalFileName);
    const preference = JSON.stringify(preferenceOb);

    fs.writeFile(filePath, preference, (err) => callbackfn(err, err ? false : true));
  }

  /**
   * Asynchronously checks if a key exists
   *
   * @param key               The key in the preference in which it's value would be checked for it's existence
   * @param optionalFileName  An optional filename used to do the check. This can be left null
   * @returns                 a Promise that resolves to a Boolean; indicating if the key exists in the persisted preference
   */
  async function hasKey(key, optionalFileName) {
    await checkArgsP(key);
    let preferenceOb = await getPreferences(optionalFileName);
    return Object.keys(preferenceOb).includes(key);
  }

  /**
   *  Synchronously checks if a key exists
   *
   * @param key              The key in the preference in which it's value would be checked for it's existence
   * @param optionalFileName An optional filename used to do the check. This can be left null
   * @returns                a Boolean; indicating if the key exists in the persisted preference
   */
  function hasKeySync(key, optionalFileName) {
    checkArgs(key);
    let preferenceOb = getPreferencesSync(optionalFileName);
    return Object.keys(preferenceOb).includes(key);
  }

  /**
   * Asynchronously checks if a key exists
   *
   * @param key               The key in the preference in which it's value would be checked for it's existence
   * @param optionalFileName  An optional filename used to do the check. This can be left null
   * @param callbackfn        A Node-Js qualified callback with any error that occurred as the first argument and a Boolean;
   *                          indicating if the key exists in the persisted preference
   */
  function hasKey_c(key, optionalFileName, callbackfn) {
    checkArgs(key);
    getPreferencesWithCallback(optionalFileName, (err, preferenceOb) => {
      if (err) callbackfn(err);
      else callbackfn(null, Object.keys(preferenceOb).includes(key));
    });
  }

  /**
   *  Gets a value asynchronously
   *
   * @param {*} optionalFileName  refers to file name for the preference to be use if this was set, if not, then
   *                              the default file would be used
   * @param {*} key               The key in the preference in which it's value would be retrieved
   * @param {*} defaultValue      A default value to be used if that key has never been set
   * @returns                     a Promise that resolves to a string. The value which was mapped to the key specified
   */
  async function getState(key, defaultValue, optionalFileName) {
    await checkArgsP(key, optionalFileName);
    return new Promise(async (resolve, _reject) => {
      // first check if key exists
      if (await hasKey(key, optionalFileName)) {
        const preferenceOb = await getPreferences(optionalFileName);
        resolve(`${preferenceOb[`${key}`]}`);
      } else {
        // emit promise based result
        resolve(`${defaultValue}`);
      }
    });
  }

  /**
   * Gets a value synchronously
   *
   * @param {*} optionalFileName    refers to file name for the preference to be use if this was set, if not, then
   *                                the default file would be used
   * @param {*} defaultValue        the default value to be retrieved if that key has never been set
   * @param {*} key                 An optional filename used to persist the settings. This can be left null
   * @returns                       A String; the value which was mapped to the key specified
   */
  function getStateSync(key, defaultValue, optionalFileName) {
    checkArgs(key, optionalFileName);
    // first check if key exists
    if (hasKeySync(key, optionalFileName)) {
      const preferenceOb = getPreferencesSync(optionalFileName);
      return `${preferenceOb[`${key}`]}`;
    } else return `${defaultValue}`;
  }

  /**
   * Gets a value asynchronously
   *
   * @param {*} key               The key in the preference in which it's value would be retrieved
   * @param {*} optionalFileName  An optional filename used to persist the settings. This can be left _null_
   * @param {*} defaultValue      the default value to be retrieved if that key has never been set
   * @param {*} callbackfn        A Node-Js qualified callback with any error that occurred as the first argument and a String;
   *                              the value which was mapped to the key specified
   */
  function getState_c(key, defaultValue, optionalFileName, callbackfn) {
    checkArgs(optionalFileName);

    hasKey_c(key, optionalFileName, (_err1, hasKey) => {
      if (hasKey) {
        getPreferencesWithCallback(optionalFileName, (_err2, preferenceOb) =>
          callbackfn(null, `${preferenceOb[`${key}`]}`)
        );
      } else {
        callbackfn(null, `${defaultValue}`);
      }
    });
  }

  /**
   *  Gets multiple value simultaneously and asynchronously
   *
   * @param {*} optionalFileName An optional filename used to persist the settings. This can be left null
   * @param {*} states           An array of keys of which values would be retrieved
   * @returns                    A Promise that resolves an Array; A list of all the values that were retrieved
   */
  async function getStates(states = [], optionalFileName) {
    await checkArgsP(optionalFileName);
    return new Promise(async (resolve, reject) => {
      if (!states instanceof Array) {
        reject(new Error("states must be a qualified Array object"));
      }

      const preferenceOb = await getPreferences(optionalFileName);
      let values = states.map((key) => `${preferenceOb[`${key}`]}`);

      resolve(values);
    });
  }

  /**
   * Gets multiple value simultaneously and synchronously
   *
   * @param {*} states           An array of keys of which values would be retrieved
   * @param {*} optionalFileName An optional filename used to persist the settings. This can be left null
   * @returns                    An Array; a list of all the values that were retrieved

   */
  function getStatesSync(states = [], optionalFileName) {
    checkArgs(optionalFileName);
    if (!states instanceof Array) {
      throw new Error("states must be a qualified Array object");
    }
    const preferenceOb = getPreferencesSync(optionalFileName);
    let values = states.map((key) => `${preferenceOb[`${key}`]}`);

    return values;
  }

  /**
   * Gets multiple value simultaneously and asynchronously
   *
   * @param {*} optionalFileName   optional filename used to persist the settings. This can be left null
   * @param {*} states             an array of keys of which values would be retrieved
   * @param {*} callbackfn         a qualified callback function with error as the first argument and the data as the second
   */
  function getStates_c(states = [], optionalFileName, callbackfn) {
    checkArgs(optionalFileName);
    if (!states instanceof Array) callbackfn(new Error("states must be a qualified Array object"));

    getPreferencesWithCallback(optionalFileName, (err, preferenceOb) => {
      if (err) {
        return callbackfn(err);
      } else {
        let values = states.map((key) => `${preferenceOb[`${key}`]}`);
        return callbackfn(null, values);
      }
    });
  }

  /**
   * Sets a value synchronously
   *
   * @param {*} optionalFileName refers to file name for the preference to be use if this was set, if not, then
   *                            the default file would be used
   * @param {*} key             The key in the preference in which it's value would be set
   * @param {*} value           The value to be set and mapped to the key
   * @returns                   A Boolean; indicating if the operation was successful or not
   */
  function setStateSync(key, value, optionalFileName) {
    checkArgs(key, optionalFileName);
    let preferenceOb = getPreferencesSync(optionalFileName);
    preferenceOb[`${key}`] = `${value}`;
    return setPreferencesSync(preferenceOb);
  }

  /**
   *  Sets a value asynchronously
   *
   * @param {*} key              The key in the preference in which it's value would be set
   * @param {*} value            the value to be set and mapped to the key
   * @param {*} optionalFileName An optional filename used to persist the settings. This can be left null
   * @returns                    a Promise that resolves to a Boolean; indicating if the operation was successful or not
   */
  async function setState(key, value, optionalFileName) {
    await checkArgsP(key, optionalFileName);
    return new Promise(async (resolve, _reject) => {
      let preferenceOb = await getPreferences(optionalFileName);
      preferenceOb[`${key}`] = `${value}`;

      const isPreferenceSet = await setPreferences(preferenceOb, optionalFileName);

      resolve(isPreferenceSet);
    });
  }

  /**
   *  Sets a value asynchronously
   *
   * @param {*} optionalFileName An optional filename used to persist the settings. This can be left null
   * @param {*} key              The key in the preference in which it's value would be set
   * @param {*} value            The value to be set and mapped to the key
   * @param {*} callbackfn       Node-Js qualified callback with any error that occurred as the first argument and a Boolean;
   *                             indicating if the operation was successful or not
   */
  function setState_c(key, value, optionalFileName, callbackfn) {
    checkArgs(key, optionalFileName);

    getPreferencesWithCallback(optionalFileName, (_err, preferenceOb) => {
      preferenceOb[`${key}`] = `${value}`;
      setPreferencesWithCallback(preferenceOb, optionalFileName, callbackfn);
    });
  }

  /**
   *  asynchronously sets the states of a user preference using a JSON object containing key-value pairs
   *
   * @param states               A map with the key-value pair to be persisted
   * @param {*} optionalFileName An optional filename used to persist the settings. This can be left null
   * @returns                    A Promise that resolves an Array; list of all the values that were persisted / set
   */
  async function setStates(states, optionalFileName) {
    await checkArgsP(optionalFileName);
    return new Promise(async (resolve, reject) => {
      if (!states instanceof Object) {
        reject(new Error("states must be a qualified JSON object"));
      }
      let preferenceOb = await getPreferences(optionalFileName);
      let inserted = Object.keys(states).map((key) => (preferenceOb[`${key}`] = `${states[`${key}`]}`));

      const isPreferenceSet = await setPreferences(preferenceOb, optionalFileName);
      isPreferenceSet ? resolve(inserted) : reject([]);
    });
  }

  /**
   *  Sets multiple value simultaneously and synchronously
   *
   * @param {*} states           A map with the key-value pair to be persisted
   * @param {*} optionalFileName refers to file name for the preference to be use if this was set, if not, then
   *                             the default file would be used
   * @returns                    an Array; a list of all the values that were persisted / set
   */
  function setStatesSync(states, optionalFileName) {
    checkArgs(optionalFileName);
    if (!states instanceof Object) {
      throw new Error("states must be a qualified JSON object");
    }
    let preferenceOb = getPreferencesSync(optionalFileName);
    let inserted = Object.keys(states).map((key) => (preferenceOb[`${key}`] = `${states[`${key}`]}`));

    return setPreferencesSync(preferenceOb) ? inserted : [];
  }

  /**
   * Sets multiple value simultaneously and asynchronously
   *
   * @param {*} states            A map with the key-value pair to be persisted
   * @param {*} optionalFileName  An optional filename used to persist the settings. This can be left null
   * @param {*} callbackfn        A Node-Js qualified callback with any error that occurred as the first argument and an Array; a list of all the values that were persisted / set
   */
  function setStates_c(states, optionalFileName, callbackfn) {
    checkArgs(optionalFileName);
    if (!states instanceof Object) {
      throw new Error("states must be a qualified JSON object");
    }

    getPreferencesWithCallback(optionalFileName, (err1, preferenceOb) => {
      if (err1) {
        return callbackfn(err1);
      } else {
        let inserted = Object.keys(states).map((key) => (preferenceOb[`${key}`] = `${states[`${key}`]}`));

        setPreferencesWithCallback(preferenceOb, optionalFileName, (err2, isInserted) => {
          if (isInserted) {
            callbackfn(err2, inserted);
          } else {
            callbackfn(err2);
          }
        });
      }
    });
  }

  /**
   * Asynchronously deletes a single entry
   *
   * @param {*} key               The key in the preference in which it's value would be deleted
   * @param {*} optionalFileName  An optional filename used to persist the settings. This can be left null
   * @returns                     a Promise that resolves to a Boolean; indicating if the key was successfully deleted
   */
  async function deleteKey(key, optionalFileName) {
    await checkArgsP(key, optionalFileName);
    let preferenceOb = await getPreferences(optionalFileName);
    // check if key is present in preference
    if (await hasKey(key, optionalFileName)) {
      delete preferenceOb[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return await setPreferences(preferenceOb, optionalFileName);
  }

  /**
   *
   * Synchronously deletes a single entry
   *
   * @param {*} key               The key in the preference in which it's value would deleted
   * @param {*} optionalFileName  An optional filename used to persist the settings. This can be left null
   * @returns                     A Boolean; indicating if the key was successfully deleted
   */
  function deleteKeySync(key, optionalFileName) {
    checkArgs(key, optionalFileName);
    let preferenceOb = getPreferencesSync();
    // check if key is present in preference
    if (hasKeySync(key, optionalFileName)) {
      delete preferenceOb[`${key}`];
    } else {
      // nothing was deleted, but still return true
      return true;
    }

    return setPreferencesSync(preferenceOb);
  }

  /**
   * Asynchronously deletes a single entry
   *
   * @param {*} key              The key in the preference in which it's value would be deleted
   * @param {*} optionalFileName An optional filename used to persist the settings. This can be left null
   * @param {*} callbackfn       A Node-Js qualified callback with any error that occurred as the first argument and a Boolean;
   *                             indicating if the key was successfully deleted
   */
  function deleteKey_c(key, optionalFileName, callbackfn) {
    checkArgs(key, optionalFileName);

    getPreferencesWithCallback(optionalFileName, (err1, preferenceOb) => {
      if (err1) {
        return callbackfn(err1);
      } else {
        hasKey_c(key, optionalFileName, (err2, hasKey) => {
          if (hasKey) {
            delete preferenceOb[`${key}`];
            callbackfn(err2, true);
          } else {
            // nothing was deleted, but still return true
            callbackfn(err2, true);
          }
        });
      }
    });
  }

  const DICTIONARY = Object.freeze({
    getDefaultPreferenceFilePath,
    getState,
    getState_c,
    getStateSync,
    getStates,
    getStatesSync,
    getStates_c,
    setStateSync,
    setState,
    setState_c,
    setStates,
    setStatesSync,
    setStates_c,
    deleteKey,
    deleteKeySync,
    deleteKey_c,
    hasKey,
    hasKeySync,
    hasKey_c,
    serialize,
    serializeSync,
    serialize_c,
    deserialize,
    deserializeSync,
    deserialize_c,
    deleteFile,
    deleteFile_c,
    deleteFileSync
  });

  return DICTIONARY;
};
/**
 * MIT License

Copyright (c) 2022 Noah

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*
**/

"use-strict";

const path = require("path");
const fsp = require("fs/promises");
const fs = require("fs");

/**
 * @param {*} config the configuration to be used in initialization
 * @returns the required APIs
 */
module.exports = function (config) {
  // defaults
  const DEFAULTS = Object.freeze({
    preferenceFileName: "Settings.json",
    fileName: "Settings",
    fileExt: "json"
  });

  let { preferenceFileDir, preferenceFileName, fileName, fileExt } = config;

  // preferenceFileName is deprecated to enable custom file extensions

  if (preferenceFileName) {
    console.warn("preferenceFileName option is deprecated, please refer to the docs");
  }

  const defPreferenceFilePath = path.join(
    preferenceFileDir, preferenceFileName ? preferenceFileName : `${fileName}.${fileExt || DEFAULTS.fileExt}`
  );

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

  const getDefaultPreferenceFilePath = () => defPreferenceFilePath;

  /**
   * @returns the persisted object as it exists in disk
   */
  async function deserialize(preferenceFileName) {
    return JSON.stringify(await getPreferences(preferenceFileName));
  }

  /**
   * @returns the persisted object as it exist in disk, synchronously
   */
  function deserializeSync(preferenceFileName) {
    return JSON.stringify(getPreferencesSync(preferenceFileName));
  }

  /**
   * asynchronously delete a specific settings file or the default, if the preference filename was not specified
   *
   * @param preferenceFileName the optional file to be deleted
   */
  async function deleteFile(preferenceFileName) {
    let file;
    if (preferenceFileName) {
      file = path.join(preferenceFileDir, preferenceFileName);
    } else {
      file = getDefaultPreferenceFilePath();
    }

    try {
      return await fsp.unlink(file);
    } catch (err) {
      console.warn("error occurred while deleting file", err.message);
    }
    return;
  }

  /**
   * synchrounously delete a specific settings file or the default, if the preference filename was not specified
   *
   * @param preferenceFileName the optional file to be deleted
   */
  function deleteFileSync(preferenceFileName) {
    let file;
    if (preferenceFileName) {
      file = path.join(preferenceFileDir, preferenceFileName);
    } else {
      file = getDefaultPreferenceFilePath();
    }

    try {
      return fs.unlinkSync(file);
    } catch (err) {
      console.warn("error occurred while deleting file", err.message);
      return;
    }
  }

  // asynchronously read the preference file from disk and then return an object representation of the file
  async function getPreferences(prefFileName) {
    await checkArgsP(prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    try {
      let data = await fsp.readFile(fileName, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPrefFile();
    }

    async function createPrefFile() {
      let filehandle;
      try {
        filehandle = await fsp.open(fileName, "wx");
        await fsp.writeFile(filehandle, "{}");
      } catch (err) {
        if (err.code === "EEXIST") return {};
        else if (err.code === "ENOENT") createPrefDirectory(fileName);
        else {
          console.log(err.code);
          return {};
        }
      } finally {
        await filehandle?.close();
      }

      async function createPrefDirectory() {
        try {
          await fsp.mkdir(preferenceFileDir, {
            recursive: true
          });
        } catch (err) {
          console.log("Error while creating file directory");
        } finally {
          return {};
        }
      }

      return {};
    }
  }

  // synchronously read the preference file from disk and then return an object representation of the file
  function getPreferencesSync(prefFileName) {
    checkArgs(prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    try {
      let data = fs.readFileSync(fileName, "utf8");
      return JSON.parse(data);
    } catch (err) {
      return createPrefFileSync();
    }

    function createPrefFileSync() {
      if (fs.existsSync(fileName)) {
        fs.writeFileSync(fileName, "{}");
        return {};
      } else {
        return createPrefDirectorySync(fileName);
      }

      function createPrefDirectorySync() {
        fs.mkdirSync(preferenceFileDir, { recursive: true });
        return {};
      }
    }
  }

  // asynchronously writes to file, the specific pref specified by *pref*
  async function setPreferences(pref, prefFileName) {
    await checkArgsP(pref, prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    const preference = JSON.stringify(pref);
    try {
      await fsp.writeFile(fileName, preference);
      return true;
    } catch (err) {
      console.error(`An error occurred while writing file: ${err}`);
      return false;
    }
  }

  // synchronously writes to file, the specific pref specified by *pref*
  function setPreferencesSync(pref, prefFileName) {
    checkArgs(pref, prefFileName);
    let fileName = prefFileName ? path.join(preferenceFileDir, prefFileName) : defPreferenceFilePath;

    const preference = JSON.stringify(pref);
    try {
      fs.writeFileSync(fileName, preference);
      return true;
    } catch (err) {
      console.error(`An error occurred while writing file: ${err}`);
      return false;
    }
  }

  /**
   *  asynchronously checks if the key specified by *key* is present
   *
   * @param key the key to check it's existence
   */
  async function hasKey(key, prefFileName) {
    await checkArgsP(key);
    // check if object has property key
    let dataOB = await getPreferences(prefFileName);
    return Object.keys(dataOB).includes(key);
  }

  /**
   *  synchronously hecks if the key specified by *key* is present
   *
   * @param key the key to check it's existence
   */
  function hasKeySync(key, prefFileName) {
    checkArgs(key);
    // check if object has property key
    let dataOB = getPreferencesSync(prefFileName);
    return Object.keys(dataOB).includes(key);
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
      } else resolve(`${defaultValue}`);
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
      let values = states.map(key => `${dataOB[`${key}`]}`);

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
    let values = states.map(key => `${dataOB[`${key}`]}`);

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
      resolve(await setPreferences(pref, prefFileName));
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
      let inserted = Object.keys(states).map(key => (pref[`${key}`] = `${states[`${key}`]}`))

      await setPreferences(pref, prefFileName);
      resolve(inserted);
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
    let inserted = Object.keys(states).map(key => (pref[`${key}`] = `${states[`${key}`]}`))

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
    deserialize,
    deserializeSync,
    deleteFile,
    deleteFileSync
  };
};

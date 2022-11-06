# Node User Settings

### A universal but simple node library to implement user settings, but originally built to work with Electron.js. Synchronous version of the API is also available.

## Installation and API Usage

### Installation

```
npm i node-user-settings --save

```

### API Usage Examples


### Please Note

* You can specify an optional filename in which settings would be saved or retrieved by using the last arguments in each of the stated functions. An optional filename isn't required and can be left blank.

* Adding a sync as suffix to each functions, provides you with the synchronous version

* The last argument would always be an optional filename. A new file would be created after using the third argument

* `preferenceFileName` is now deprecated as of v1.1.0 and you should use, `fileName` and `fileExt` instead to set the file name to be used to save settings. This small addition would be used in the future and might not be useful for now. But it is highly recommended to stop using `preferenceFileName` for future versions, because it would be removed soon.

* Leaving `fileExt` config option blank but setting a `fileName`, results in a file with the `.json` file extention.


```javascript

// preferenceFileName is optional, it defaults to a Settings.json file
  
const Settings = require('node-user-settings')({
  preferenceFileDir: 'path/to/save/settings',
  preferenceFileName: 'Settings.json',
  fileName: 'Settings',
  fileExt: 'json'
})


// get a value,  asynchronously 

await Settings.getState('key', optionalFileName)

// set a key, asynchronously 

await Settings.setState('key', 'value', optionalFileName)

// use the third argument to specify an optional file name to save the settings

await Settings.setState('key', 'value', optionalFileName)

//  asynchronously set multiple states, but run them sequentially and `states` refers to the number of states saved

let states = {
  key1: value1,
  key2: value2,
}

await Settings.setStates(states, optionalFileName)

//  asynchronously get multiple states, but run them sequentially

let states = ['key1', 'key2', 'key3']
let [value1, value2, value3] = await Settings.getStates(states, optionalFileName)

// to use settings and run them in parallel, it's better to use this version but I have no idea what would happen if you do use it :)

let [res1, res2] = await Promise.all([
  Settings.setState('key', value, optionalFileName),
  Settings.setState('key', value, optionalFileName),
])

// asynchronously checks if a key exists

 await settings.hasKey("key", optionalFileName);
 
 // asynchronously deletes a single key
 
  await settings.deleteKey("key", optionalFileName);
  
// you could also delete the whole file if you like
  
  await settings.deleteFile(optionalFileName);
   
// asynchronously get the whole object as it was persisted on disk

await Settings.deserialize(optionalFileName);

```

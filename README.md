# Node User Settings

### A simple promise based node settings library, but originally built to work with Electron.js. Synchronous version of the API is also available.

## Installation and API Usage

### Installation

```
npm i node-user-settings --save

```

### API Usage Examples


### Please Note

* you can specify an optional filename in which settings would be saved or retrieved by using the last arguments in each of the stated functions

* adding a sync as suffix to each functions, provides you with the synchronous version

* the last argument would always be an optional filename. A new file would be created after using the third argument

```javascript

// preferenceFileName is optional, it defaults to a Settings.json file

const Settings = require('node-user-settings')({
  preferenceFileDir: 'path/to/save/settings',
  preferenceFileName: 'Settings.json'
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

 await settings.hasKey("moduleName", OPTIONAL_FILENAME);
 
 // asynchronously deletes a single key
 
  await settings.deleteKey("moduleName", OPTIONAL_FILENAME);
  
// you could also delete the whole file if you like
  
  await settings.deleteFile(OPTIONAL_FILENAME);
   
// asynchronously get the whole object as it was persisted on disk

await Settings.deserialize(optionalFileName);

```

## Contributing

### Setting things up

`npm install && npm test`

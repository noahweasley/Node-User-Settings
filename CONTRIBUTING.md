## Contributing to the codebase

* Clone the repository and run  `$ npm install && npm test`

* Before running `$ npm test` , make sure you have a `.env` file placed at the root of your project and it should have this declaraction

```dosini
NODE_USER_SETTINGS_DIRECTORY="path/to/save/settings/file"
```

* After making changes to the APIs, also re-run tests to verify that nothing was broken.

* Open a pull request with your changes to the API

* Wait for a merge 
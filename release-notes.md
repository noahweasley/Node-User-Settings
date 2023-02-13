## Node User Settings v2.0.0

> Provided out-of-the-box support for Electron JS applications with little or no-configurations

### Breaking Changes

- Broke support for previous versions of the API, added `useElectronStorage` and `setUseElectronStorage()` to API, `useElectronStorage` must be set to false in Non-Electron applications. Throws an error if `useElectronStorage` is not set to false or `setUseElectronStorage(false)` is not called in non-Electron applications

### New Features

- Added 4 new functions; `setUseElectronStorage()`, `setElectronFilePath()`, `getElectronFilePath()`, `isUsingElectronStorage()`

### Bug Fixes

- Improved documentation

### Other Changes

- Updated examples with the required way to set up the API

- Temporarily fixed EPERM error in tests by running them individually and changing a few more things in tests

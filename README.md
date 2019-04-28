# Windows Locale

[![Node](https://img.shields.io/node/v/windows-locale.svg?style=flat-square)](https://npmjs.org/package/windows-locale) [![Version](https://img.shields.io/npm/v/windows-locale.svg?style=flat-square)](https://npmjs.org/package/windows-locale) [![Downloads](https://img.shields.io/npm/dt/windows-locale.svg?style=flat-square)](https://npmjs.org/package/windows-locale) [![Travis](https://img.shields.io/travis/TiagoDanin/Windows-Locale.svg?branch=master&style=flat-square)](https://travis-ci.org/TiagoDanin/Windows-Locale) 

Windows Language Code Identifier (LCID) for JavaScript

## Installation

Module available through the [npm registry](https://www.npmjs.com/). It can be installed using the  [`npm`](https://docs.npmjs.com/getting-started/installing-npm-packages-locally) or [`yarn`](https://yarnpkg.com/en/) command line tools.

```sh
# NPM
npm install windows-locale --save
# Or Using Yarn
yarn add windows-locale
```

## Example

```js
const locale = require('windows-locale')

console.log(locale['pt-br'])
/*
{
	language: 'Portuguese',
	location: 'Brazil',
	id: 1046,
	tag: 'pt-BR',
	version: 'ReleaseA'
}
*/
```

## Documentation

### `locale`
List of Languages

### `locale[language]`
Get Windows Language Code Identifier (LCID) information

- language (String)
- location (String || Null)
- id (Number)
- tag (String)
- version (String)

### Source
**NOTE:** Source is [winprotocoldoc.blob.core.windows.net/productionwindowsarchives/MS-LCID/%5bMS-LCID%5d.pdf](https://winprotocoldoc.blob.core.windows.net/productionwindowsarchives/MS-LCID/%5bMS-LCID%5d.pdf)

## Dependencies

None

## Dev Dependencies

- [pdf2json](https://ghub.io/pdf2json): A PDF file parser that converts PDF binaries to text based JSON, powered by porting a fork of PDF.JS to Node.js

## Contributors

Pull requests and stars are always welcome. For bugs and feature requests, please [create an issue](https://github.com/TiagoDanin/Windows-Locale/issues). [List of all contributors](https://github.com/TiagoDanin/Windows-Locale/graphs/contributors).

## License

[MIT](LICENSE) © [Tiago Danin](https://TiagoDanin.github.io)
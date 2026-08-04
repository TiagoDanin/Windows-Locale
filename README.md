# Windows Locale

[![Node](https://img.shields.io/node/v/windows-locale.svg?style=flat-square)](https://npmjs.org/package/windows-locale) [![Version](https://img.shields.io/npm/v/windows-locale.svg?style=flat-square)](https://npmjs.org/package/windows-locale) [![Downloads](https://img.shields.io/npm/dt/windows-locale.svg?style=flat-square)](https://npmjs.org/package/windows-locale)

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
**NOTE:** Data is generated from the Microsoft **[MS-LCID]: Windows Language Code Identifier (LCID) Reference** specification, revision **16.0** (2024-04-23).

- Specification: [learn.microsoft.com/en-us/openspecs/windows_protocols/ms-lcid/70feba9f-294e-491e-b6eb-56532684c37f](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-lcid/70feba9f-294e-491e-b6eb-56532684c37f)
- PDF: [winprotocoldocs-bhdugrdyduf5h2e4.b02.azurefd.net/MS-LCID/%5bMS-LCID%5d.pdf](https://winprotocoldocs-bhdugrdyduf5h2e4.b02.azurefd.net/MS-LCID/%5bMS-LCID%5d.pdf)

To regenerate `index.json`, download the PDF above as `[MS-LCID].pdf` into the repository root and run:

```sh
yarn build
```

## Dependencies

None

## Dev Dependencies

- [pdf2json](https://ghub.io/pdf2json): A PDF file parser that converts PDF binaries to text based JSON, powered by porting a fork of PDF.JS to Node.js

## Contributors

Pull requests and stars are always welcome. For bugs and feature requests, please [create an issue](https://github.com/TiagoDanin/Windows-Locale/issues). [List of all contributors](https://github.com/TiagoDanin/Windows-Locale/graphs/contributors).

## License

[MIT](LICENSE) © [Tiago Danin](https://TiagoDanin.github.io)

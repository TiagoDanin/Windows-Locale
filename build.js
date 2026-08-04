const fs = require('fs')
const path = require('path')
const PDFParser = require('pdf2json')

// Source: [MS-LCID] Windows Language Code Identifier (LCID) Reference
// Revision 16.0 (2024-04-23)
// https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-lcid/70feba9f-294e-491e-b6eb-56532684c37f
const filename = path.join(__dirname, '[MS-LCID].pdf')
const outputFile = path.join(__dirname, 'index.json')
const typesFile = path.join(__dirname, 'index.d.ts')
const moduleFile = path.join(__dirname, 'index.mjs')
const moduleTypesFile = path.join(__dirname, 'index.d.mts')

// Header label of the second column, used to locate the LCID table pages.
const tableHeader = 'Location (or type)'

// Fallback column anchors (horizontal position of each column of the table),
// used when the header of the table cannot be measured from the document.
//                         Language | Location | ID  | Tag | Version
const fallbackColumns = [4.612, 11.451, 21.677, 25.539, 29.516]

// Field of each column, in the same order as the columns of the table.
const columnFields = ['language', 'location', 'id', 'tag', 'version']

// Maximum vertical distance between two lines of a same row. Rows of the table
// are ~1.19 apart, wrapped lines of a same row are ~0.6 apart.
const maxWrapDistance = 1

// Boilerplate printed on the header/footer of every page.
const boilerplate = [
  '[MS',
  'LCID]',
  'Copyright',
  'Windows Language Code Identifier (LCID) Reference',
  'Release:'
]

const getPages = pdfData => {
  // pdf2json >= 2 exposes `Pages`, older releases used `formImage.Pages`.
  if (Array.isArray(pdfData.Pages)) {
    return pdfData.Pages
  }

  if (pdfData.formImage && Array.isArray(pdfData.formImage.Pages)) {
    return pdfData.formImage.Pages
  }

  throw new Error('Unable to read the pages of the PDF')
}

const getText = text => {
  if (!text.R || text.R.length === 0) {
    return ''
  }

  return text.R.map(run => decodeURIComponent(run.T || '')).join('')
}

// Groups the texts of a page by their vertical position, sorted top to bottom.
const getLines = page => {
  const lines = new Map()

  for (const text of page.Texts || []) {
    if (!lines.has(text.y)) {
      lines.set(text.y, [])
    }

    lines.get(text.y).push({ x: text.x, text: getText(text) })
  }

  return [...lines.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([y, texts]) => ({
      y,
      texts: texts.sort((a, b) => a.x - b.x)
    }))
}

const isBoilerplate = line => {
  const content = line.texts.map(text => text.text).join('')
  return boilerplate.some(entry => content.includes(entry))
}

// Reads the column anchors from the header row of the table.
const getColumns = lines => {
  const header = lines.find(line => line.texts.some(text => text.text === tableHeader))
  if (!header) {
    return null
  }

  const columns = [...new Set(
    header.texts
      .filter(text => text.text.trim())
      .map(text => text.x)
  )].sort((a, b) => a - b)

  if (columns.length !== columnFields.length) {
    return null
  }

  return columns
}

const getColumnIndex = (columns, x) => {
  let index = -1

  // A small tolerance keeps texts starting marginally before the anchor
  // inside their own column.
  for (const [position, column] of columns.entries()) {
    if (x >= column - 0.1) {
      index = position
    }
  }

  return index
}

// Collapses a line into one cell per column of the table.
const getCells = (columns, line) => {
  const cells = columnFields.map(() => '')

  for (const text of line.texts) {
    const index = getColumnIndex(columns, text.x)
    if (index < 0) {
      continue
    }

    cells[index] += text.text
  }

  return cells
}

const parseId = value => {
  const id = String(value || '').trim()
  if (!/^(0x[\da-f]+|\d+)$/i.test(id)) {
    return null
  }

  return Number(id)
}

const parsePage = (page, columns) => {
  const lines = getLines(page)
  const headerIndex = lines.findIndex(line => line.texts.some(text => text.text === tableHeader))
  if (headerIndex < 0) {
    return []
  }

  const idColumn = columnFields.indexOf('id')
  const rows = []
  let previousY = null

  for (const line of lines.slice(headerIndex + 1)) {
    if (isBoilerplate(line)) {
      continue
    }

    const cells = getCells(columns, line)
    const id = parseId(cells[idColumn])

    if (id === null) {
      // A line without an ID is either the wrapped continuation of the
      // previous row or content that does not belong to the table.
      const isWrap = rows.length > 0 &&
        previousY !== null &&
        line.y - previousY <= maxWrapDistance

      if (!isWrap) {
        continue
      }

      const row = rows[rows.length - 1]
      for (const [index, field] of columnFields.entries()) {
        row[field] += cells[index]
      }

      previousY = line.y
      continue
    }

    const row = {}
    for (const [index, field] of columnFields.entries()) {
      row[field] = cells[index]
    }

    rows.push(row)
    previousY = line.y
  }

  return rows
}

// Balances a name truncated in the middle of a parenthesis by the PDF layout,
// e.g. `Mongolian (Traditional` -> `Mongolian (Traditional)`.
const balance = value => {
  const opened = (value.match(/\(/g) || []).length
  const closed = (value.match(/\)/g) || []).length

  if (opened > closed) {
    return value + ')'.repeat(opened - closed)
  }

  if (closed > opened) {
    return '('.repeat(closed - opened) + value
  }

  return value
}

// Trims the value and collapses the duplicated spaces left by the PDF layout.
const clean = value => balance(String(value || '').replace(/\s+/g, ' ').trim())

// Language tags never start or end with a separator, the PDF sometimes leaves
// a dangling one behind (e.g. `tzm-Latn-`).
const cleanTag = value => clean(value).replace(/^-+|-+$/g, '')

const sanitize = row => ({
  language: clean(row.language) || null,
  location: clean(row.location) || null,
  id: parseId(row.id),
  tag: cleanTag(row.tag) || null,
  version: clean(row.version) || null
})

// Quotes a key as a JavaScript/TypeScript single quoted string literal.
const quote = value => `'${value.replace(/\\/g, '\\\\').replace(/'/g, '\\\'')}'`

// TypeScript declarations of the CommonJS entry point, with the union of every
// key of the dataset so that `locales['pt-br']` is checked at compile time.
// The interface and the union live inside the namespace merged with the
// constant: a module using `export =` cannot have other top level exports.
const getTypes = keys => [
  '// Generated by build.js. Do not edit.',
  'declare namespace locales {',
  '\tinterface WindowsLocale {',
  '\t\tlanguage: string',
  '\t\tlocation: string | null',
  '\t\tid: number',
  '\t\ttag: string',
  '\t\tversion: string',
  '\t}',
  '',
  '\ttype LocaleTag =',
  ...keys.map(key => `\t\t| ${quote(key)}`),
  '}',
  '',
  'declare const locales: Record<locales.LocaleTag, locales.WindowsLocale>',
  '',
  'export = locales',
  ''
].join('\n')

// TypeScript declarations of the ESM entry point, matching the exports of
// index.mjs.
const getModuleTypes = keys => [
  '// Generated by build.js. Do not edit.',
  'export interface WindowsLocale {',
  '\tlanguage: string',
  '\tlocation: string | null',
  '\tid: number',
  '\ttag: string',
  '\tversion: string',
  '}',
  '',
  'export type LocaleTag =',
  ...keys.map(key => `\t| ${quote(key)}`),
  '',
  'declare const locales: Record<LocaleTag, WindowsLocale>',
  '',
  'export default locales',
  'export { locales }',
  ''
].join('\n')

// ESM entry point. The data is inlined instead of being imported from the JSON
// file: import attributes (`with {type: 'json'}`) are not supported by every
// runtime and bundler, and `createRequire` is unavailable outside Node.
const getModule = output => [
  '// Generated by build.js. Do not edit.',
  `const locales = ${JSON.stringify(output, null, '\t')}`,
  '',
  'export default locales',
  'export { locales }',
  ''
].join('\n')

const build = pdfData => {
  const pages = getPages(pdfData)
  const tables = pages.filter(page =>
    (page.Texts || []).some(text => getText(text) === tableHeader)
  )

  if (tables.length === 0) {
    throw new Error(`Unable to find the LCID table (header "${tableHeader}") in the PDF`)
  }

  const columns = getColumns(getLines(tables[0])) || fallbackColumns

  const rows = tables
    .flatMap(page => parsePage(page, columns))
    .map(row => sanitize(row))
    .filter(row => row.tag && row.version && row.id !== null)

  const output = {}
  for (const row of rows) {
    const key = row.tag.toLowerCase()

    if (output[key]) {
      console.warn(`Duplicated tag "${row.tag}" (${row.id}), keeping the first entry`)
      continue
    }

    output[key] = row
  }

  const keys = Object.keys(output)

  fs.writeFileSync(outputFile, JSON.stringify(output, null, '\t'))
  fs.writeFileSync(typesFile, getTypes(keys))
  fs.writeFileSync(moduleFile, getModule(output))
  fs.writeFileSync(moduleTypesFile, getModuleTypes(keys))

  console.log(`${keys.length} locales from ${tables.length} pages`)
}

console.time('build in')

const pdfParser = new PDFParser()
pdfParser.on('pdfParser_dataError', errData => {
  console.error(errData.parserError)
  process.exitCode = 1
})

pdfParser.on('pdfParser_dataReady', pdfData => {
  build(pdfData)
  console.timeEnd('build in')
})

pdfParser.loadPDF(filename)

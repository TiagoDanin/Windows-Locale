const locale = require('.')
const assert = require('assert')

assert.equal(locale['pt-br'].language, 'Portuguese')
assert.equal(locale['pt-br'].location, 'Brazil')
assert.equal(locale['pt-br'].id, 1046)
assert.equal(locale['pt-br'].tag, 'pt-BR')
assert.equal(locale['pt-br'].version, 'Release A')

const keys = Object.keys(locale)

assert.ok(keys.length >= 828, `expected at least 828 locales, got ${keys.length}`)

// https://github.com/TiagoDanin/Windows-Locale/issues/2
// Those tags used to keep a dangling separator left behind by the PDF layout.
assert.ok(locale['tzm-latn'], 'missing tzm-latn')
assert.equal(locale['tzm-latn'].tag, 'tzm-Latn')

assert.ok(locale['ccp-cakm'], 'missing ccp-cakm')
assert.equal(locale['ccp-cakm'].tag, 'ccp-Cakm')

assert.ok(locale['ca-es'], 'missing ca-es')
assert.equal(locale['ca-es'].tag, 'ca-ES')

// The rows the dangling separator used to truncate must be present in full,
// otherwise the asserts above would still pass against the neutral tags alone.
assert.equal(locale['tzm-latn-ma'].tag, 'tzm-Latn-MA')
assert.equal(locale['tzm-arab-ma'].tag, 'tzm-Arab-MA')
assert.equal(locale['ccp-cakm-bd'].tag, 'ccp-Cakm-BD')
assert.equal(locale['ccp-cakm-in'].tag, 'ccp-Cakm-IN')
assert.equal(locale['ca-es-valencia'].tag, 'ca-ES-valencia')
assert.equal(locale['ca-es-valencia'].language, 'Valencian')

// Entries the previous parser got wrong: `ce-RU` used to be read as `cd-RU`
// and both Fulah/Nigeria rows carried the 0x1000 placeholder instead of 0x0467.
assert.ok(!locale['cd-ru'], 'cd-ru is a misread of ce-RU')
assert.equal(locale['ce-ru'].language, 'Chechen')
assert.equal(locale['ff-ng'].id, 1127)
assert.equal(locale['ff-latn-ng'].id, 1127)

for (const key of keys) {
	const entry = locale[key]

	assert.ok(!key.startsWith('-') && !key.endsWith('-'), `key "${key}" has a dangling separator`)
	assert.equal(key, entry.tag.toLowerCase(), `key "${key}" does not match its tag "${entry.tag}"`)
	assert.ok(!entry.tag.startsWith('-') && !entry.tag.endsWith('-'), `tag "${entry.tag}" has a dangling separator`)

	for (const field of ['language', 'location', 'tag', 'version']) {
		const value = entry[field]
		if (value === null) {
			continue
		}

		assert.equal(typeof value, 'string', `${key}.${field} is not a string`)
		assert.equal(value, value.trim(), `${key}.${field} ("${value}") is not trimmed`)
		assert.ok(!value.includes('  '), `${key}.${field} ("${value}") has duplicated spaces`)

		const opened = (value.match(/\(/g) || []).length
		const closed = (value.match(/\)/g) || []).length
		assert.equal(opened, closed, `${key}.${field} ("${value}") has unbalanced parentheses`)
	}

	assert.ok(entry.language, `${key} has no language`)
	assert.ok(entry.version, `${key} has no version`)
	assert.ok(Number.isInteger(entry.id), `${key} has an invalid id`)
}

console.log(`Done! ${keys.length} locales`)

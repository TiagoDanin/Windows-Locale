const locale = require('.')
const assert = require('assert')


assert.equal(locale['pt-br'].language, 'Portuguese')
assert.equal(locale['pt-br'].location, 'Brazil')
assert.equal(locale['pt-br'].id, 1046)
assert.equal(locale['pt-br'].tag, 'pt-BR')
assert.equal(locale['pt-br'].version, 'ReleaseA')

console.log('Done!')

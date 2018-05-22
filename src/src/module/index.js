var shajs = require('sha.js')
var Buffer = require('safe-buffer').Buffer

var unicode = require('./unicode')

// default password generation options
var defaultOptions = {
  length: 12,
  minCharacters: {
    special: 0,
    number: 0,
    letter: 0,
    alphaNum: 0,
    lowerCase: 0,
    upperCase: 0
  },
  algorithm: 'sha256',
  rounds: 1
}

/**
 * Creates an instance of PretzelPass.
 *
 * @constructor
 * @this {PretzelPass}
 * @param {Object} opts The constraint options for password generation
 * @param {string|Buffer} salt The salt used in the hash algorithm
 */
function PretzelPass (opts, salt) {
  var self = this

  opts = opts || {}
  salt = salt || []

  self.setOptions(opts)
  self.setSalt(salt)
}

/**
 * Sets the constraint option of the instance.
 *
 * @access public
 * @this {PretzelPass}
 * @param {Object} opts The constraint options for password generation
 */
PretzelPass.prototype.setOptions = function (opts) {
  var self = this

  self._opts = {}
  Object.keys(defaultOptions).forEach(function (key) {
    self._opts[key] = opts[key] !== undefined ? opts[key] : defaultOptions[key]
  })
}

/**
 * Sets the salt used in the hash algorithm
 *
 * @access public
 * @this {PretzelPass}
 * @param {string|Buffer} salt The salt used in the hash algorithm
 */
PretzelPass.prototype.setSalt = function (salt) {
  var self = this

  self._salt = Buffer.from(salt)
}

/**
 * Generates a password from a master password and domain
 *
 * @access public
 * @return {string} The generated password
 * @this {PretzelPass}
 * @param {string} masterPassword The master password
 * @param {string} domain The domain (or another service identifier) that will use the password
 */
PretzelPass.prototype.generatePassword = function (masterPassword, domain) {
  var self = this

  return self._generatePassword(masterPassword, domain, 0, '')
}

/**
 * Generates a password from the master password and domain and an iteration counter
 *
 * @access private
 * @return {string} The generated password for this iteration
 * @this {PretzelPass}
 * @param {string} masterPassword The master password
 * @param {string} domain The domain (or another service identifier) that will use the password
 * @param {number} iteration A counter that tracks the recursive depth of the algorith,
 * @param {string} password The generated password so far
 */
PretzelPass.prototype._generatePassword = function (masterPassword, domain, iteration, password) {
  var self = this

  // convert strings to buffers
  var masterPasswordBuf = Buffer.from(masterPassword, 'utf8')
  var domainBuf = Buffer.from(domain, 'utf8')
  var iterationBuf = Buffer.from(iteration.toString())

  // concatenate buffers (with salt)
  var inputBuffer = Buffer.concat([masterPasswordBuf, domainBuf, iterationBuf, self._salt])

  // get the hash
  var hash = inputBuffer
  for (var i = 0; i < self._opts.rounds; i++) {
    hash = shajs(self._opts.algorithm).update(hash).digest('hex')
  }

  // generate the constraints queue
  var constraints = Object.keys(self._opts.minCharacters).map(function (key) {
    return {
      type: key,
      number: self._opts.minCharacters[key]
    }
  }).filter(function (constraint) {
    return constraint.number > 0
  })

  // translate hash into a password with the given constraints
  password = password + hash.match(/.{1,2}/g).map(function (hex) {
    if (constraints[0]) {
      var char = unicode.fromHexCode(hex, constraints[0].type)
      if (--constraints[0].number <= 0) constraints.shift()
      return char
    } else {
      return unicode.fromHexCode(hex, 'alphaNum') // double entropy/length by mapping to alphaNum
    }
  }).join('')

  // extend password if needed (length > 32)
  if (password.length < self._opts.length) {
    password = self._generatePassword(masterPassword, domain, iteration + 1, password)
  }

  // shorten password
  password = password.slice(0, self._opts.length)

  return password
}

module.exports = PretzelPass

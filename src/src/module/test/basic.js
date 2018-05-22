var test = require('tape')
var PretzelPass = require('./../index')

test('passwords are the same', function (t) {
  var p = new PretzelPass()
  var p2 = new PretzelPass()
  
  var pass1 = p.generatePassword('abc123', 'http://google.com')
  var pass2 = p.generatePassword('abc123', 'http://google.com')
  var pass3 = p2.generatePassword('abc123', 'http://google.com')
  
  t.equals(pass1, pass2, 'password should be the same')
  t.equals(pass2, pass3, 'password should be the same')
  console.log(pass1, pass2, pass3)
  t.end()
})

test('passwords are different', function (t) {
  var p = new PretzelPass()
  
  var pass1a = p.generatePassword('abc123', 'http://google.com')
  var pass1b = p.generatePassword('abc12', 'http://google.com')
  
  var pass2a = p.generatePassword('abc124', 'http://google.com')
  var pass2b = p.generatePassword('abc124', 'http://googl.com')
  
  t.notEquals(pass1a, pass1b, 'password should not be the same with different master key')
  t.notEquals(pass2a, pass2b, 'password should not be the same with different domain')
  console.log(pass1a, pass1b, pass2a, pass2b)
  t.end()
})

test('test long password', function (t) {
  var p = new PretzelPass()
  
  p.setOptions({
    length: 1000,
  })
  
  var pass1 = p.generatePassword('master', 'https://reddit.com')

  t.equals(1000, pass1.length, 'password should have correct length')
  t.end()
})

test('constraints', function (t) {
  var p = new PretzelPass()
  
  p.setOptions({
    length: 20,
    minCharacters: {
      special: 2,
      number: 2,
      letter: 2,
      alphaNum: 2,
      lowerCase: 2,
      upperCase: 2
    },
    algorithm: 'sha256',
    rounds: 1
  })
  
  var pass1 = p.generatePassword('master', 'https://reddit.com')

  t.equals(20, pass1.length, 'password should have correct length')
  t.equals('.:49unIyozAQS2xwsww9', pass1, 'password should generate with constraints')
  t.end()
})
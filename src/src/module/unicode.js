var unicode = {}

// various character sets
var unicodeRanges = {
  special: ' !"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~',
  number: '0123456789',
  letter: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  alphaNum: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  lowerCase: 'abcdefghijklmnopqrstuvwxyz',
  upperCase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
}

// 2-digit hex number to unicode character
unicode.fromHexCode = function (code, type) {
  code = parseInt(code, 16) // convert to decimal

  // shift into range
  return unicodeRanges[type][code % (unicodeRanges[type].length)]
}

module.exports = unicode

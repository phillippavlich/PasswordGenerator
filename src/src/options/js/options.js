/* globals chrome, window, document, PretzelPass */

var p = new PretzelPass()

var passLength = document.getElementById('passLength')
var upperCase = document.getElementById('upperCase')
var lowerCase = document.getElementById('lowerCase')
var numbers = document.getElementById('numbers')
var symbols = document.getElementById('symbols')
var demo = document.getElementById('demo')
var domainEl = document.getElementById('domain')
var saltUpload = document.getElementById('saltUpload')
var saltDownload = document.getElementById('saltDownload')

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

// tab change detection
var domain = ''
function tabChanged (tab) {
  chrome.tabs.getSelected(null, function (tab) {
    domain = new window.URL(tab.url).hostname
    domainEl.innerHTML = domain
    start()
  })
}
tabChanged()

chrome.tabs.onUpdated.addListener(tabChanged.bind(this))
chrome.tabs.onCreated.addListener(tabChanged.bind(this))

// get or generate salt
var salt = JSON.parse(window.localStorage.getItem('salt') || 'null')
if (!salt) {
  var random = Array.from(window.crypto.getRandomValues(new Uint8Array(256))) // 2048 bits!
  updateSalt(random)
} else {
  updateSalt(salt)
}

// salt upload
saltUpload.addEventListener('change', e => {
  var file = e.target.files[0]

  var reader = new window.FileReader()
  reader.addEventListener('loadend', e => {
    updateSalt(Array.from(new Uint8Array(reader.result))) // convert to array
  })
  reader.readAsArrayBuffer(file)
})

// download salt
saltDownload.addEventListener('click', e => {
  var blob = new window.Blob([new Uint8Array(salt)], {
    type: 'application/octet-stream'
  })

  chrome.downloads.download({
    url: window.URL.createObjectURL(blob),
    filename: 'my.salt'
  })
})

// updates the salt
function updateSalt (newSalt) {
  salt = newSalt
  p.setSalt(salt)
  window.localStorage.setItem('salt', JSON.stringify(salt))
  generate()
}

// fires after domain detected
function start () {
  var key = 'options' + domain
  var oldOpts = window.localStorage.getItem(key)

    // create options object for domain if undefined
  if (!oldOpts) {
    window.localStorage.setItem(key, JSON.stringify(defaultOptions))
    oldOpts = defaultOptions
  } else {
    oldOpts = JSON.parse(oldOpts)
  }

    // default values
  passLength.value = oldOpts.length
  upperCase.value = oldOpts.minCharacters.upperCase
  lowerCase.value = oldOpts.minCharacters.lowerCase
  numbers.value = oldOpts.minCharacters.number
  symbols.value = oldOpts.minCharacters.special

    // event listeners
  var els = [passLength, upperCase, lowerCase, numbers, symbols]
  els.forEach(element => {
    element.addEventListener('keyup', generate)
    element.addEventListener('click', generate)
  })

  generate()
}

// fires on any change, or first load
function generate () {
    // create new options object
  var opts = {
    length: parseInt(passLength.value),
    minCharacters: {
      special: parseInt(symbols.value),
      number: parseInt(numbers.value),
      letter: 0,
      alphaNum: 0, // todo
      lowerCase: parseInt(lowerCase.value),
      upperCase: parseInt(upperCase.value)
    }
  }
  
  if (opts.length < 0) {
      opts.length = 0
      passLength.value = 0
  }
  
  if (opts.minCharacters.upperCase < 0) {
      opts.minCharacters.upperCase = 0
      upperCase.value = 0
  }      
  if (opts.minCharacters.lowerCase < 0) {
      opts.minCharacters.lowerCase = 0
      lowerCase.value = 0
  }
  if (opts.minCharacters.number < 0) {
      opts.minCharacters.number = 0
      numbers.value = 0
  }
  if (opts.minCharacters.special < 0) {
      opts.minCharacters.special = 0
      symbols.value = 0
  }
  
  if(opts.length < (opts.minCharacters.upperCase + opts.minCharacters.lowerCase + opts.minCharacters.number + opts.minCharacters.special)) {
      opts.length = (opts.minCharacters.upperCase + opts.minCharacters.lowerCase + opts.minCharacters.number + opts.minCharacters.special)
      passLength.value = (opts.minCharacters.upperCase + opts.minCharacters.lowerCase + opts.minCharacters.number + opts.minCharacters.special)
  }
    
  
    
    // forward options to generator
  p.setOptions(opts)

    // save options
  var key = 'options' + domain
  window.localStorage.setItem(key, JSON.stringify(opts))

    // display demo password
  var pass = p.generatePassword('testMasterPassword', domain)
  demo.value = pass
}

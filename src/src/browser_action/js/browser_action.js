/* globals chrome, localStorage, URL, PretzelPass */

/*This JavaScript file is used to deal with all user interactions. 
This includes event listeners for the user interface.
This code also calls on other scripts for password data.   */


(function mainThread() {

  var togglePasswordField = document.getElementById('togglePasswordField')
  var passField = document.getElementById('master')
  var domainField = document.getElementById('domain')
  var domain = 'Domain'

  chrome.tabs.onUpdated.addListener(tabChanged.bind(this))
  chrome.tabs.onCreated.addListener(tabChanged.bind(this))
  
  // Gets or generates a salt for the password
  var salt = JSON.parse(window.localStorage.getItem('salt') || 'null')
  if (!salt) {
    salt = Array.from(window.crypto.getRandomValues(new Uint8Array(256))) // 2048 bits!
    window.localStorage.setItem('salt', JSON.stringify(salt))
  }
  console.log(salt)

  /*Detects the current tab
  Returns the domain of the current tab */
  function tabChanged (tab) {
    chrome.tabs.getSelected(null, function (tab) {
      domain = new URL(tab.url).hostname
      domainField.value = domain
    })
  }
  tabChanged()

  /*Toggles the text type of the input box for the userkey */
  function togglePass () {
    togglePasswordField.addEventListener('click', function () {
      var value = passField.value
      if (passField.type === 'text') {
        passField.type = 'password'
      } else {
        passField.type = 'text'
      }
      passField.value = value
    })
  }
  togglePass()

  /*Allows the user to select the info button.
  This toggles the help information on the main screen.
  It can either hide the information or unhide the information */
  function infoView () {
    var begin = true
    var infoButton = document.getElementById('infobtn')
    var instructions = document.getElementById('how')
    var htmlpage = document.getElementById('page')

    infoButton.addEventListener('click', function () {
      if (begin === true || instructions.style.display === 'none') {
        instructions.style.display = 'inline'
        htmlpage.style.width = '500px'
        htmlpage.style.height = '480px'
        begin = false
      } else {
        instructions.style.display = 'none'
        htmlpage.style.width = '500px'
        htmlpage.style.height = '280px'
      }
    })
  }
  infoView()

  passField.addEventListener('keyup', generate.bind(this))
  domainField.addEventListener('keyup', generate.bind(this))

  /*This function creates a Pretzel Pass object to call on JS methods from the password module 
  It uses local storage to grab the current domain, the salt file, the user key
  The password is outputted and displayed to the main screen */
  function generate () {
    var masterPassword = document.getElementById('master').value
    var output = document.getElementById('output')

    var p = new PretzelPass()
    p.setSalt(salt)
    p.setOptions(JSON.parse(localStorage['options' + domain] || localStorage['options'] || '{}'))

    var generatedPassword = p.generatePassword(masterPassword, domain)

    output.value = generatedPassword
  }
 
})()




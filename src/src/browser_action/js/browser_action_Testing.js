/*This file is used for testing the user interface */

(function(){
  /*This function tests the ability for the user key button to hide and 
  unhide the text for the user key*/
  function testingUserKeyHidden(){
    var togglePasswordField = document.getElementById('togglePasswordField')
    var passField = document.getElementById('master')
    togglePasswordField.addEventListener('click', function () {
        console.log("TestCase 1: ")
        console.log("The user key button has been clicked")
        if (passField.type === 'text') {
          console.log("User Key type was text!")
          console.log("User Key type is now password!")
        } else {
          console.log("User Key type was password!")
          console.log("User Key type is now text!")
        }
      })

  }
  testingUserKeyHidden()


  /*This function tests the info button to verify that it 
  correctly displays the help information*/
  function testingInfoButton(){
    var begin = true
    var infoButton = document.getElementById('infobtn')
    var instructions = document.getElementById('how')
    var htmlpage = document.getElementById('page')

    infoButton.addEventListener('click', function () {
      console.log("TestCase 2: ")
      console.log("The info button has been clicked!")
      /*The other script is run prior to switch the value. Testing must be opposite */
      if (begin === true || instructions.style.display !== 'none') {
        console.log("The help information should now be visible!")
        begin = false
      } else {
        console.log("The help information should no longer visible!")
      }
    })
  }
  testingInfoButton()

  /*This function tests the programs ability to get the correct 
  domain of the current tab upon clicking on the main page */
  function testingTabChanged (tab) {
    var wholePage = document.getElementById('page')
    wholePage.addEventListener('click', function () {
      console.log("TestCase 3: ")
      var domainField = document.getElementById('domain')
      chrome.tabs.getSelected(null, function (tab) {
        domain = new URL(tab.url).hostname
        console.log("This is the value of the actual domain: "+ domain)
      })
      var domainFieldNew = document.getElementById('domain')
      console.log("This is the value of the domain box: "+domainFieldNew.value)
    })   
  }
  testingTabChanged()


  function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }


})()
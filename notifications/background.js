var title = "";
let folders = ["JIRA", "Jenkins", "Processpp16"];
var myMap = new Map();

function getUnreadCount(current, folderName) {
  chrome.tabs.executeScript(current.id, {
    code: 'document.querySelectorAll("[title=' + folderName + '] > span:nth-child(3)>span:first-child")[0].innerText'
  }, function (result) {
    if (result[0] !== null) {
      // console.log(result[0]);
      let msg = result[0].split('\n')[0];
      if (myMap.has(folderName) && myMap.get(folderName) < parseInt(msg)) {
        myMap.set(folderName, parseInt(msg));
        new Notification(`${folderName} has ${msg} unread mails`, {
          icon: '48.png',
          body: 'Time to make the toast.'
        });
      } else {
        myMap.set(folderName, parseInt(msg));
      }
    } else {
      myMap.set(folderName, 0);
      console.log(myMap);
    }
  });

}


function show() {
  chrome.tabs.query({
    pinned: true,
  }, function (tabs) {
    var current = tabs[0];
    title = current.url;
    console.log(folders);
    folders.map(a => getUnreadCount(current, a));
  });

}


// Conditionally initialize the options.
if (!localStorage.isInitialized) {
  localStorage.isActivated = true; // The display activation.
  localStorage.frequency = 1; // The display frequency, in minutes.
  localStorage.isInitialized = true; // The option initialization.
}

// Test for notification support.
if (window.Notification) {
  // While activated, show notifications at the display frequency.
  if (JSON.parse(localStorage.isActivated)) {
    show();
  }

  var interval = 0; // The display interval, in minutes.

  setInterval(function () {
    interval++;

    if (
      JSON.parse(localStorage.isActivated) &&
      localStorage.frequency <= interval
    ) {
      show();
      interval = 0;
    }
  }, 15000);
}
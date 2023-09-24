var title = "";
let folders = [];
var myMap = new Map();
let stopNow = false;
let stop15 = false;
let stop10 = false;
let stop5 = false;
let stopcust = false;

function getUnreadCount(current, folderName) {
  chrome.tabs.executeScript(
    current.id,
    {
      code:
        "document.querySelectorAll(\"[title^='" +
        folderName +
        "'] > span:nth-child(3)>span:first-child>span:first-child\")[0].innerText",
    },
    function (result) {
      if (result[0] !== null) {
        // console.log(result[0]);
        let msg = result[0].split("\n")[0];
        if (myMap.has(folderName) && myMap.get(folderName) < parseInt(msg)) {
          myMap.set(folderName, parseInt(msg));
          new Notification(`${folderName} has ${msg} unread mails`, {
            icon: "toast.png",
            body: "Check your mail.",
          });
        } else {
          myMap.set(folderName, parseInt(msg));
        }
      } else {
        myMap.set(folderName, 0);
        console.log(myMap);
      }
    }
  );
}

function getUpComingMeeting(current) {
  chrome.tabs.executeScript(
    current.id,
    {
      code: "document.querySelector(\"[data-automation-id='UpNext']>span>div>div>div\").innerText",
    },
    function (result) {
      console.log(result[0].includes(" 2 min"));
      if (result != "" && result[0].includes("Now") && !stopNow) {
        new Notification(`Reminder`, {
          icon: "48.png",
          body: `${result[0]}`,
          requireInteraction: true,
        });
        stopNow = true;
        stop15 = false;
        stop10 = false;
        stop5 = false;
        stopcust = false;
      }

      if (
        result != "" &&
        JSON.parse(localStorage.min5) &&
        result[0].includes(" 5 min") &&
        !stop5
      ) {
        new Notification(`Reminder`, {
          icon: "48.png",
          body: `${result[0]}`,
        });
        stopNow = false;

        stop5 = true;
      }

      if (
        result != "" &&
        JSON.parse(localStorage.min10) &&
        result[0].includes(" 10 min") &&
        !stop10
      ) {
        new Notification(`Reminder`, {
          icon: "48.png",
          body: `${result[0]}`,
        });
        stopNow = false;

        stop10 = true;
      }

      if (
        result != "" &&
        JSON.parse(localStorage.min15) &&
        result[0].includes("15 min") &&
        !stop15
      ) {
        new Notification(`Reminder`, {
          icon: "48.png",
          body: `${result[0]}`,
        });
        stopNow = false;

        stop15 = true;
      }

      if (
        result != "" &&
        JSON.parse(localStorage.iscust) &&
        result[0].includes(" " + localStorage.custmin + " min") &&
        !stopcust
      ) {
        new Notification(`Reminder`, {
          icon: "48.png",
          body: `${result[0]}`,
        });
        stopcust = true;
        stopNow = false;
      }
    }
  );
}

function show() {
  chrome.tabs.query(
    {
      url: [
        "https://outlook.office365.com/mail/*",
        "https://outlook.office.com/mail/*",
      ],
    },
    function (tabs) {
      var current = tabs[0];
      if (current == null) {
        return;
      }
      title = current.url;

      chrome.storage.local.get("activatedFolderIds", function (result) {
        folders = [];
        if (result.activatedFolderIds.length > 0) {
          folders = [...result.activatedFolderIds];
          folders.map((a) => getUnreadCount(current, a));
        }
      });

      getUpComingMeeting(current);
    }
  );
}

// Conditionally initialize the options.
if (!localStorage.isInitialized) {
  localStorage.isActivated = true; // The display activation.
  localStorage.isInitialized = true; // The option initialization.
}

// Test for notification support.
if (window.Notification) {
  // While activated, show notifications at the display frequency.
  // if (JSON.parse(localStorage.isActivated)) {
  // show();
  // }

  show();

  //var interval = 0; // The display interval, in minutes.

  setInterval(function () {
    //sinterval++;

    if (JSON.parse(localStorage.isActivated)) {
      show();
      interval = 0;
    }
  }, 15000);
}

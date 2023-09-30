import { getOutlookTab } from "./chromeStorageUtil.js";
import { getStorageValue } from "./chromeStorageUtil.js";
var title = "";
let folders = [];
var myMap = new Map();
let stopNow = false;
let stop15 = false;
let stop10 = false;
let stop5 = false;
let stopcust = false;
let globalFolder = "";
const NOTIFICATION_ID = "mail_notify";
const ACTIVE_FOLDER_IDS = "activatedFolderIds";
export let current;

async function getUnreadCount(current, folderName) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: current.id },
      func: getFolderCount(),
      args: [folderName],
      world: "MAIN",
    });
    function getFolderCount() {
      return (name) => {
        const element = document.querySelector(
          `[title^='${name}'] > span:nth-child(3)>span:first-child>span:first-child`
        );
        return element ? element.innerText : "";
      };
    }
    const msg = result[0]?.result?.split("\n")[0] || "0";
    const msgInt = parseInt(msg);

    if (myMap.has(folderName) && myMap.get(folderName) < msgInt) {
      myMap.set(folderName, msgInt);
      notify(
        `${folderName} has ${msg} unread mails`,
        "Check your mail.",
        "toast.png"
      );
    } else {
      myMap.set(folderName, msgInt);
    }
  } catch (error) {
    console.error(error);
  }
}

async function getUpComingMeeting(current) {
  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: current.id },
      func: () => {
        const element = document.querySelector(
          "[data-automation-id='UpNext']>span>div>div>div"
        );
        return element ? element.innerText : "";
      },
    });

    const resultText = result[0]?.result || "";

    if (resultText.includes("Now") && !stopNow) {
      notify("Reminder", resultText, "reminder.png", true);
      stopNow = true;
      stop15 = false;
      stop10 = false;
      stop5 = false;
      stopcust = false;
    }

    const min5 = await getStorageValue("min5");
    if (min5 && resultText.includes(" 5 min") && !stop5) {
      notify("Reminder", resultText, "reminder.png");
      stopNow = false;
      stop5 = true;
    }

    const min10 = await getStorageValue("min10");
    if (min10 && resultText.includes(" 10 min") && !stop10) {
      notify("Reminder", resultText, "reminder.png");
      stopNow = false;
      stop10 = true;
    }

    const min15 = await getStorageValue("min15");
    if (min15 && resultText.includes("15 min") && !stop15) {
      notify("Reminder", resultText[0], "reminder.png");
      stopNow = false;
      stop15 = true;
    }

    const custMin = await getStorageValue("custmin");
    const isCust = await getStorageValue("iscust");
    if (isCust && resultText.includes(` ${custMin} min`) && !stopcust) {
      notify("Reminder", resultText, "reminder.png");
      stopcust = true;
      stopNow = false;
    }
  } catch (error) {
    console.error(error);
  }
}

async function show() {
  try {
    [current] = await getOutlookTab();

    if (!current) return;

    const result = await getStorageValue(ACTIVE_FOLDER_IDS);

    folders = result || [];

    for (const folder of folders) {
      globalFolder = folder;
      getUnreadCount(current, folder);
    }

    getUpComingMeeting(current);
  } catch (error) {
    console.error(error);
  }
}

// Move foucus to the mail tab and window
chrome.notifications.onClicked.addListener(function (notifId) {
  const updateProperties = { active: true };
  const windowProperties = {
    focused: true,
  };
  chrome.windows.update(current.windowId, windowProperties);
  chrome.tabs.update(current.id, updateProperties, (tab) => {});
  chrome.scripting.executeScript({
    target: { tabId: current.id },
    func: (name) => {
      const element = document.querySelector(
        `[title^='${name}'] > span:nth-child(3)>span:first-child>span:first-child`
      );
      element ? element.click() : "";
    },
    args: [globalFolder],
  });
});

show();

setInterval(show, 15000);

function notify(title, body, icon, interaction) {
  chrome.notifications.create(NOTIFICATION_ID, {
    title: title,
    message: body,
    iconUrl: icon,
    type: "basic",
    requireInteraction: interaction,
  });
}

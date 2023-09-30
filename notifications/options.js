// import {
//   getOutlookTab,
//   getStorageValue,
//   setStorageValue,
// } from "./chromeStorageUtil.js";

function ghost(isDeactivated) {
  const options = document.getElementById("options");
  options.style.color = isDeactivated ? "graytext" : "black";
  const folderDiv = document.getElementById("folderDiv");
  const saveBtn = document.getElementById("save");
  const folderNames = document.getElementsByClassName("folderNames");

  folderDiv.disabled = isDeactivated;
  saveBtn.disabled = isDeactivated;

  for (let folderName of folderNames) {
    folderName.disabled = true;
  }
}

async function init() {
  const options = document.getElementById("options");
  options.isActivated.checked = await getStorageValue("isActivated");

  if (!options.isActivated.checked) {
    ghost(true);
  }

  options.isActivated.addEventListener("change", async function () {
    await setStorageValue("isActivated", options.isActivated.checked);
    ghost(!options.isActivated.checked);
  });

  await getAllFolder();
}

async function getAllFolder() {
  let min15 = document.getElementById("min15");
  let min10 = document.getElementById("min10");
  let min5 = document.getElementById("min5");
  let iscust = document.getElementById("iscust");
  let custmin = document.getElementById("custmin");
  if (JSON.parse(await getStorageValue("min15"))) {
    min15.checked = true;
  }
  if (JSON.parse(await getStorageValue("min10"))) {
    min10.checked = true;
  }
  if (JSON.parse(await getStorageValue("min5"))) {
    min5.checked = true;
  }
  if (JSON.parse(await getStorageValue("iscust"))) {
    iscust.checked = true;
  }

  custmin.value = JSON.parse(await getStorageValue("custmin"));

  const [current] = await getOutlookTab();

  if (!current) {
    return;
  }
  const result = await chrome.scripting.executeScript({
    target: { tabId: current.id },
    func: () => {
      var x = document.querySelectorAll(
        "div[role=treeitem] > span:first-of-type"
      );
      var arr = [];
      for (var item of x) {
        arr.push(item.innerText);
      }
      return arr;
    },
  });

  var originalFolderNames = result[0].result;
  var folderNames = [...new Set(originalFolderNames)];
  var list = document.getElementById("folderList");
  let activatedFolders = [];
  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }
  //get list of already activated folders
  chrome.storage.local.get("activatedFolderIds", function (result) {
    console.log(result.activatedFolderIds);
    activatedFolders = result.activatedFolderIds;
    folderNames.map(listOutlookFolder(activatedFolders, list));
  });

  chrome.storage.local.get(
    {
      folderNames: [],
    },
    function (result) {
      folderNames.push({
        folderId: result.folderNames,
      });
      chrome.storage.local.set(
        {
          folderIds: folderNames,
        },
        function () {}
      );
    }
  );
}

function listOutlookFolder(activatedFolders, list) {
  return (folder) => {
    const li = document.createElement("li");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = folder;
    input.className = "folderNames"; // Use className for setting class
    if (activatedFolders?.includes(folder)) {
      // Use optional chaining to avoid errors
      input.checked = true;
    }
    li.appendChild(input);
    li.appendChild(document.createTextNode(folder));
    list.appendChild(li);
  };
}

async function saveActivatedFolderList() {
  let min15 = document.getElementById("min15");
  await setStorageValue("min15", min15.checked);
  let min10 = document.getElementById("min10");
  await setStorageValue("min10", min10.checked);
  let min5 = document.getElementById("min5");
  await setStorageValue("min5", min5.checked);
  let iscust = document.getElementById("iscust");
  await setStorageValue("iscust", iscust.checked);
  let custmin = null;

  custmin = document.getElementById("custmin");
  await setStorageValue("custmin", custmin.value);

  const [current] = await getOutlookTab();

  if (!current) {
    return;
  }

  var x = document.querySelectorAll("input.folderNames[type=checkbox]:checked");
  var activatedFolderNames = [];
  for (var item of x) {
    activatedFolderNames.push(item.getAttribute("name"));
  }
  chrome.storage.local.get(
    {
      activatedFolderNames: [],
    },
    function (result) {
      chrome.storage.local.set(
        {
          activatedFolderIds: activatedFolderNames,
        },
        function () {
          // you can use strings instead of objects
          // if you don't want to define default values
          chrome.storage.local.get("activatedFolderIds", function (result) {
            console.log(result.activatedFolderIds);
          });
        }
      );
    }
  );
}
async function getStorageValue(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

async function setStorageValue(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

async function getOutlookTab() {
  return await chrome.tabs.query({
    url: [
      "https://outlook.office365.com/mail/*",
      "https://outlook.office.com/mail/*",
    ],
  });
}

window.addEventListener("load", init);
document
  .getElementById("save")
  .addEventListener("click", () => saveActivatedFolderList());

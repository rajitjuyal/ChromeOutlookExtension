export async function getStorageValue(key) {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key]);
    });
  });
}

export async function setStorageValue(key, value) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

export async function getOutlookTab() {
  return await chrome.tabs.query({
    url: [
      "https://outlook.office365.com/mail/*",
      "https://outlook.office.com/mail/*",
    ],
  });
}

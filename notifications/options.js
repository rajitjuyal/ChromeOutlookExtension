function ghost(isDeactivated) {
  options.style.color = isDeactivated ? 'graytext' : 'black';
  // The label color.
  options.frequency.disabled = isDeactivated; // The control manipulability.
}

window.addEventListener('load', function () {
  // Initialize the option controls.
  options.isActivated.checked = JSON.parse(localStorage.isActivated);
  // The display activation.
  options.frequency.value = localStorage.frequency;
  // The display frequency, in minutes.

  if (!options.isActivated.checked) {
    ghost(true);
  }

  // Set the display activation and frequency.
  options.isActivated.onchange = function () {
    localStorage.isActivated = options.isActivated.checked;
    ghost(!options.isActivated.checked);
  };

  options.frequency.onchange = function () {
    localStorage.frequency = options.frequency.value;
  };
});


document.getElementById('refersh').addEventListener('click', getAllFolder);

function getAllFolder() {
  chrome.tabs.query({
    pinned: true,
  }, function (tabs) {
    var current = tabs[0];
    console.log(current);
    chrome.tabs.executeScript(current.id, {
      code: `var x= document.querySelectorAll(\"div[role=treeitem]\");
      var arr=[];
      for (var item of x){
        arr.push(item.getAttribute("title"));
      }
      arr
      `
    }, function (result) {
      var folderNames = result[0];
      var list = document.getElementById("folderList");
      folderNames.map(a => {
        let l = document.createElement("li");
        l.appendChild(document.createTextNode(a));
        list.appendChild(l);
      });
      chrome.storage.local.get({
        'folderNames': []
      }, function (result) {
        folderNames.push({
          folderId: folderNames
        });
        chrome.storage.local.set({
          folderIds: folderNames
        }, function () {
          // you can use strings instead of objects
          // if you don't  want to define default values
          chrome.storage.local.get('folderIds', function (result) {
            console.log(result.folderIds);
          });
        });
      });

    });
  });

}
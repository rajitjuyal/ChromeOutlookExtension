function ghost(isDeactivated) {
  options.style.color = isDeactivated ? 'graytext' : 'black';
  // The label color.
  let folderDiv = document.getElementById("folderDiv");
  folderDiv.disabled = isDeactivated; // The control manipulability.
  let saveBtn = document.getElementById("save");
  saveBtn.disabled = isDeactivated; // The control manipulability.

  let folderNames = document.getElementsByClassName("folderNames");
  for (let folderName of folderNames) {
    folderName.disabled = true;
  }

}

window.addEventListener('load', function () {
  // Initialize the option controls.
  options.isActivated.checked = JSON.parse(localStorage.isActivated);
  // The display activation.

  if (!options.isActivated.checked) {
    ghost(true);
  }

  // Set the display activation and frequency.
  options.isActivated.onchange = function () {
    localStorage.isActivated = options.isActivated.checked;
    ghost(!options.isActivated.checked);
  };



  getAllFolder();
});


// document.getElementById('refersh').addEventListener('click', getAllFolder);
document.getElementById('save').addEventListener('click', saveActivatedFolderList);

function getAllFolder() {
  let min15 = document.getElementById("min15");
  let min10 = document.getElementById("min10");
  let min5 = document.getElementById("min5");
  let iscust = document.getElementById("iscust");
  if (JSON.parse(localStorage.min15)) {
    min15.checked = true;
  }
  if (JSON.parse(localStorage.min10)) {
    min10.checked = true;
  }
  if (JSON.parse(localStorage.min5)) {
    min5.checked = true;
  }
  if (JSON.parse(localStorage.iscust)) {
    iscust.checked = true;
  }
  chrome.tabs.query({
    url: ["https://outlook.office365.com/mail/*", "https://outlook.office.com/mail/*"],
  }, function (tabs) {
    var current = tabs[0];
    if (!current) {
      return;
    }
    chrome.tabs.executeScript(current.id, {
      code: `var x= document.querySelectorAll(\"div[role=treeitem]\");
      var arr=[];
      for (var item of x){
    	 if(item.getAttribute("aria-level") != 1) {
    	  arr.push(item.getAttribute("title"));
    	  }
      }
      arr
      `
    }, function (result) {
      var originalFolderNames = result[0];
      var folderNames = [...new Set(originalFolderNames)];
      var list = document.getElementById("folderList");
      let activatedFolders = [];
      while (list.firstChild) {
        list.removeChild(list.firstChild);
      }
      //get list of already activated folders
      chrome.storage.local.get('activatedFolderIds', function (result) {
        console.log(result.activatedFolderIds);
        activatedFolders = result.activatedFolderIds;

        folderNames.map(a => {
          let l = document.createElement("li");
          let input = document.createElement("input");
          input.type = "checkbox";
          input.name = a;
          if (activatedFolders && activatedFolders.includes(a)) {
            input.checked = true;
          }
          input.setAttribute("class", "folderNames");
          l.appendChild(input);
          l.appendChild(document.createTextNode(a));
          list.appendChild(l);
        });

      });


      chrome.storage.local.get({
        'folderNames': []
      }, function (result) {
        folderNames.push({
          folderId: result.folderNames
        });
        chrome.storage.local.set({
          folderIds: folderNames
        }, function () {
          // you can use strings instead of objects
          // if you don't want to define default values
          //          chrome.storage.local.get('folderIds', function (result) {
          //            console.log(result.folderIds);
          //          });
        });
      });

    });
  });

}

function saveActivatedFolderList() {

  let min15 = document.getElementById("min15");
  localStorage.min15 = min15.checked;
  let min10 = document.getElementById("min10");
  localStorage.min10 = min10.checked;
  let min5 = document.getElementById("min5");
  localStorage.min5 = min5.checked;
  let iscust = document.getElementById("iscust");
  localStorage.iscust = iscust.checked;
  let custmin = null;
  if (iscust.checked) {
    custmin = document.getElementById("custmin");
    localStorage.custmin = custmin.value;
  }
  chrome.tabs.query({
    url: ["https://outlook.office365.com/mail/*", "https://outlook.office.com/mail/*"]
  }, function (tabs) {

    var current = tabs[0];
    if (!current) {
      return;
    }

    var x = document.querySelectorAll("input.folderNames[type=checkbox]:checked");
    var activatedFolderNames = [];
    for (var item of x) {
      activatedFolderNames.push(item.getAttribute("name"));
    }
    chrome.storage.local.get({
      'activatedFolderNames': []
    }, function (result) {
      //        	  activatedFolderNames.push({
      //                  activatedFolderIds: result.activatedFolderIds
      //                });
      chrome.storage.local.set({
        activatedFolderIds: activatedFolderNames
      }, function () {
        // you can use strings instead of objects
        // if you don't want to define default values
        chrome.storage.local.get('activatedFolderIds', function (result) {
          console.log(result.activatedFolderIds);
        });
      });
    });
  });
}
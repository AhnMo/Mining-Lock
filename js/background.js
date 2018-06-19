//setting options
chrome.browserAction.onClicked.addListener(onClickListner);
chrome.notifications.onButtonClicked.addListener(onButtenClickedListner);
chrome.runtime.onMessage.addListener(onMessageListener);

let domains = [];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  domains[tabId] = getDomain(tab.url);
});

chrome.tabs.onRemoved.addListener(tabId => {
    delete domains[tabId];
});

// TODO: implementation
function isWhitelistByUser(domain) {
  return false;
}

// TODO: implementation
function getUserBlacklist() {
  return [];
}


function onBeforeRequesHandler(details) {
  chrome.tabs.sendMessage(details.tabId, {message: "AHNMO_DETECTED"}); // XXX: THIS
  if (isWhitelistByUser(domains[details.tabId])) {
    return {cancel: false};
  }
  return {cancel: true};
}

function registerOnBeforeReuqest(data) {
  if (chrome.webRequest.onBeforeRequest.hasListener(onBeforeRequesHandler)) {
		chrome.webRequest.onBeforeRequest.removeListener(onBeforeRequesHandler);
	}
  // if (config.disabled) return;

  var serv_blacklist = data;//data.split('\n');
  var user_blacklist = getUserBlacklist();
  var merged = serv_blacklist.concat(user_blacklist);

  chrome.webRequest.onBeforeRequest.addListener(onBeforeRequesHandler, {
      urls: merged
  }, ['blocking']);
}

function onClickListner(activeTab) {
    chrome.tabs.create({ url: chrome.extension.getURL('../index.html') });
}

function onButtenClickedListner(notificationID, buttonIndex) {
	switch (buttonIndex) {
		case 0:
			sendMessage(parseInt(notificationID), "KILL");
			chrome.notifications.clear(notificationID);
			break;
		case 1:
			chrome.notifications.clear(notificationID);
			break;
		default:
			chrome.notifications.clear(notificationID);
			break;
	}
}

function onMessageListener(request, sender, sendResponse) {
	if(request.message == "MININGBLOCKER_DETECTED") {
    chrome.tabs.sendMessage(sender.tab.id, {message: "AHNMO_DETECTED"}); // XXX: THIS
		showNotification(sender.tab.id.toString());
  }
};

function showNotification(tabID) {
	var opt = {
    	type: 'basic',
		title: 'Mining-Blocker',
 		message: 'Cryptojacking is detected.',
 		priority: 1,
   		buttons: [{ title: 'Kill'}, {title: 'Ignore'}],
   		iconUrl:'image/main_logo.png'
	};
	chrome.notifications.create(tabID, opt, function(id) {});
}

function sendMessage(tabID, text) {
	chrome.tabs.sendMessage(tabID, {message: text});
}

(function() {
  fetch('https://raw.githubusercontent.com/AhnMo/Mining-Lock/master/blacklist.json')
  .then(function(response) {
    console.log(response.ok);
    if (!response.ok) {
      throw new Error('Network error');
    }
    return response.json();
  })
  .then(registerOnBeforeReuqest)
  .catch(function(error) {
    console.log(error.message);

    fetch(chrome.extension.getURL('blacklist.json'))
    .then(function(response) {
      return response.json()
    }).then(registerOnBeforeReuqest)
  });
})();

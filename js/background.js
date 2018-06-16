//setting options
chrome.browserAction.onClicked.addListener(onClickListner);
chrome.notifications.onButtonClicked.addListener(onButtenClickedListner);
chrome.runtime.onMessage.addListener(onMessageListener);

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

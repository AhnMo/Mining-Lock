window.addEventListener("message", onPageMessageListner, false);
chrome.runtime.onMessage.addListener(onBackgroundMessageListener);
injector("js/customworker.js",null);
injector("js/wsHook.js",null);
injector("js/spc.js", null);

function injector() {
	if(arguments.length == 2) {
		var path = arguments[0];
		var cb = arguments[1];

		var script = document.createElement('script');
		
			script.src = chrome.extension.getURL(path);
		script.onload = function() {
			this.remove();
			if(cb !== undefined && typeof cb == 'function') {
				cb();
			}
		};
		
		(document.head||document.documentElement).appendChild(script);
	
	} else if (arguments.length == 1) {
		var text = arguments[0];

		var script = document.createElement('script');
		script.textContent = text;
		(document.head||document.documentElement).appendChild(script);
		
		script.remove();
	};
}

function onPageMessageListner(event) {
    if (event.source != window)
        return;
    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        toExtension(event.data.text);
    }
}

function onBackgroundMessageListener(request, sender, sendResponse) {
	if(sender.id == chrome.runtime.id && request.message == "KILL")
		toPage("KILL");
}

function toPage(text) {
	window.postMessage({ type: "FROM_CONTENT", text: text }, "*");
}

function toExtension(text) {
	var extensionID = chrome.runtime.id;
	chrome.runtime.sendMessage(extensionID, {message:text});
}

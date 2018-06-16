window.addEventListener("message", onPageMessageListner, false);
chrome.runtime.onMessage.addListener(onBackgroundMessageListener);
injector("js/customworker.js",null);
injector("js/wsHook.js",null);
injector("js/spc.js", null);
var detector = new Detector();
detector.domcheck();

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
    if (event.data.from && (event.data.from == "PAGE")) {
    	if(event.data.type)
    		switch(event.data.type) {
        		case "TO_EXTENSION":
        			toExtension(event.data.text);
        			break;
        		case "WORKER_GENERATED":
        			detector.worker_generated(event.data.text);
        			break;
        		case "MESSAGE_DETECTED":
        			detector.judge(event.data.text);
        			break;
        		case "DOM_DETECTED":
        			(detector.__killgranted) ? detector.kill() : detector.askKILL();
        		default:
        			break;
        	}
    }
}

function Detector () {
	this.__workers = 0;
	this.__auth = false;
	this.__authed = false;
	this.__killgranted = false;
	this.__firstblockhash = false;
	this.blacklisted = function() {
		this.__killgranted = true;
	}

	this.domcheck = function() {
		toPage("DOMCHECK");
	}

	this.worker_generated = function(text) {
		this.__workers++;
	}

	this.judge = function(text) {
		if(this.__workers > 0) {
			try {
				var obj = JSON.parse(text);
				if(obj.type) {
					switch(obj.type.toLowerCase()) {
						case "auth":
							if(obj.params.site_key)
								this.__auth = true;
							break;
						case "authed":
							if(this.__auth && obj.params.hasOwnProperty("hashes"))
								this.__authed = true;
							break;
						case "job":
							if(this.__auth && this.__authed) {
								(this.__killgranted) ? this.kill() : this.askKILL();
							}
							break;
					}
				}
			} catch (e) {
				return;
			}
		}

		try {
			var obj = JSON.parse("[" + text.split("[")[1])
			if(obj[0].toLowerCase() == "firstprehash") {
				(this.__killgranted) ? this.kill() : this.askKILL();
			}
		} catch (e) {
			return;
		}
		return;

	}
	
	this.askKILL = function () {
		toExtension("MININGBLOCKER_DETECTED");
	}

	this.kill = function () {
		toPage("KILL");
		this.__workers = 0;
		this.__killgranted = true;
		this.__auth = this.__authed = false;
	}
}

function onBackgroundMessageListener(request, sender, sendResponse) {
	if(sender.id == chrome.runtime.id && request.message == "KILL")
		detector.kill();
}

function toPage(text) {
	window.postMessage({from: "CONTENT", text: text }, "*");
}

function toExtension(text) {
	var extensionID = chrome.runtime.id;
	chrome.runtime.sendMessage(extensionID, {message:text});
}

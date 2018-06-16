window.addEventListener("message", onMessageListener, false);

function onMessageListener(event) {
    if (event.source != window)
        return;
    if (event.data.from && (event.data.from == "CONTENT")) {
        switch(event.data.text) {
            case "KILL":
                __workers.terminate();
                break;
            case "DOMCHECK":
                domChecker();   
                break;
            default:
                console.log(event.data.text);
                break;
        }
    }
}

function sendMessage(type, text) {
    window.postMessage({from: "PAGE", type: type, text: text }, "*");
}

function domChecker() {
    for(name in this) {
        var obj = this[name];
        if( obj && typeof obj !== 'undefined'
            && typeof obj.isRunning === 'function'
            && typeof obj.stop === 'function'
            && (typeof obj._siteKey === 'string' || typeof obj._newSitekey === 'string')
            && typeof obj._verifyThread === 'object') {
            sendMessage("DOM_DETECTED", "");
        }
    }
}
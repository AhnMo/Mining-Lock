window.addEventListener("message", onMessageListener, false);

function onMessageListener(event) {
    if (event.source != window)
        return;
    if (event.data.type && (event.data.type == "FROM_CONTENT")) {
        switch(event.data.text) {
            case "KILL":
                __workers.terminate();
                break;
            default:
                console.log(event.data.text);
                break;
        }
    }
}

function sendMessage(text) {
    window.postMessage({ type: "FROM_PAGE", text: text }, "*");
}

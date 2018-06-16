var __workers = [];
__workers.list = [];
__workers.terminate = function() {
	__workers.list.forEach(function (value) {
		if(typeof value == "object" && value.isRunning == true)
			value.terminate();
	});
};
__workers.getNumber = function() {
	return this.list.length;
}

var __WORKER = Worker;

Worker = function(args) {
	var tempWK = new __WORKER(args);
	tempWK.__argument = args;
	tempWK.isRunning = true;
	__workers.list.push(tempWK);
	sendMessage("WORKER_GENERATED", args);
	tempWK.__terminate = tempWK.terminate;
	tempWK.terminate = function() {
		this.isRunning = false;
		tempWK.__terminate.apply(this, arguments);
	}
	return tempWK;
}
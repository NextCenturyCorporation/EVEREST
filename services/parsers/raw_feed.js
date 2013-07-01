var logger = null;

this.load = function(log) {
	logger = log;
}


this.parse = function(id) {
	logger.debug("Call to parse raw feed with id: " + id);
}
function SimpleLogger(options) {
	this.enableDebug = options && !!options.enableDebug;
	this.enableInfo = this.enableDebug || options && !!options.enableInfo;
}

SimpleLogger.prototype = {

	error: function() {
		console.error.apply(global, ["ERROR"].concat(Array.prototype.slice.call(arguments)));
	},

	info: function() {
		if (this.enableInfo)
			console.log.apply(global, ["INFO"].concat(Array.prototype.slice.call(arguments)));
	},

	debug: function() {
		if (this.enableDebug)
			console.log.apply(global, ["DEBUG"].concat(Array.prototype.slice.call(arguments)));
	}
};


module.exports = SimpleLogger;

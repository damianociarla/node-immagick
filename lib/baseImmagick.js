var exec = require('child_process').exec;

module.exports = function () {
	
	this.settings = {
		encoding	: 'utf8',
		timeout		: 0,
		maxBuffer	: 200 * 1024
	};
	
	this.mergeBaseSettings = function (settings) {
		// Change internal settings
		this.settings = this.mergeSettings(this.settings, settings);
	};
	
	this.mergeSettings = function (baseSettings, settings, onlyMatch) {
		// Verify if onlyMatch is undefined
		if (onlyMatch == undefined) onlyMatch = false;
		// Verify typeof the options parameter
		if (typeof settings == 'object') {
			// Retrieve all key
			var keys = Object.keys(settings);
			// Scan all keys
			for (var i = 0; i < keys.length; i++) {
				// Retrieve key name
				var key = keys[i];
				// Verify that value of key is defined and assignament at the default key value
				if (settings[key] !== undefined && settings[key] !== null && (!onlyMatch || (onlyMatch && baseSettings[key] != undefined))) 
					baseSettings[key] = settings[key];
			}
		}
		// Return settings modified
		return baseSettings;
	};
	
	this.exec = function (commands, callback) {
		// Create final command line
		var finalCommand = commands.join(" ");
		// Create the timeoutId for stop the timeout at the end the process
		var timeoutID = null;
		// Exec the command
		var process = exec(finalCommand, this.settings, function (error, stdout, stderr) {
			// Clear timeout if 'timeoutID' are setted
			if (timeoutID !== null) clearTimeout(timeoutID);
			// Call the callback function
			callback(error, stdout, stderr);
		});
		// Verify if the timeout are setting
		if (this.settings.timeout > 0) {
			// Set the timeout
			timeoutID = setTimeout(function () {
				process.kill();
			}, 100);		
		}
	}
}
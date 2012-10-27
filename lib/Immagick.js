var identifyParser	= require('imagemagick-identify-parser');
var _baseImagick	= require('./baseImagick');
var _function		= require('./function');
var _script			= require('./script');
var _instafilter	= require('./instafilter');

var Imagick = function (imagePath/*, options, callback*/) {
	
	var baseImagick = new _baseImagick();
	
	this.identify = function (callback) {
		// Instance basic command to get info image
		var commands = ["identify", "-verbose"];
		// Add image path
		commands.push(imagePath);
		// Exec the command
		baseImagick.exec(commands, function (error, stdout, stderr) {
			var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,"") : null;
			var infoImage = error ? null : identifyParser(stdout);
			if (typeof callback == 'function') callback(errorCode, infoImage);
		});
	};
	
	// Verify if isset options settings
	if (typeof arguments[1] == 'object') baseImagick.mergeBaseSettings(arguments[1]);
	// Retrieve a possible callback function
	var callback = arguments[arguments.length - 1];
	// Verify if the callback variable is a function
	if (typeof callback == 'function') this.identify(callback);
	
	this.func			= new _function(imagePath, this, baseImagick);
	this.script			= new _script(imagePath, this, baseImagick);
	this.instafilter	= new _instafilter(imagePath, this, baseImagick);
}

module.exports = Imagick;
var _identifyParser	= require('./identifyParser');
var _baseImmagick	= require('./baseImmagick');
var _function		= require('./function');
var _script			= require('./script');
var _instafilter	= require('./instafilter');

var Immagick = function (imagePath/*, options, callback*/) {
	
	var baseImmagick = new _baseImmagick();
	
	this.identify = function (callback) {
		// Verify if exists callback
		if (typeof callback != 'function') return;
		// Instance basic command to get info image
		var commands = ["identify", "-verbose", imagePath];
		// Exec the command
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,"") : null;
			var infoImage = error ? null : _identifyParser(stdout);
			callback(errorCode, infoImage);
		});
	};
	
	this.readExif = function (callback) {
		// Verify if exists callback
		if (typeof callback != 'function') return;
		// Call identify function
		this.identify(function (error, info) {
			callback(error, info ? info.Properties.exif : null);			
		});
	};
	
	// Verify if isset options settings
	if (typeof arguments[1] == 'object') baseImmagick.mergeBaseSettings(arguments[1]);
	// Retrieve a possible callback function
	var callback = arguments[arguments.length - 1];
	// Verify if the callback variable is a function
	if (typeof callback == 'function') this.identify(callback);
	
	this.func			= new _function(imagePath, this, baseImmagick);
	this.script			= new _script(imagePath, this, baseImmagick);
	this.instafilter	= new _instafilter(imagePath, this, baseImmagick);
}

module.exports = Immagick;
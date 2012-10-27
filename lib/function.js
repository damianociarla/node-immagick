var path = require('path');

module.exports = function (sourceImagePath, Immagick, baseImmagick) {
	
	var _baseSettings = {
		quality : 75,
		format : 'jpg'
	};
	
	var _parseArguments = function (argumentsFunction, settings) {
		this.settings = baseImmagick.mergeSettings(_baseSettings, settings, true);
		this.destionationImagePath = null;
		this.callback = null;

		var __constructor = function (self) {
			// Scan arguments list
			for (var i in argumentsFunction) {
				// Retrieve the argument
				var argument = argumentsFunction[i];
				// Compare the typeof the argument
				switch (typeof argument) {
					case 'string'	: self.destionationImagePath = argument; break;
					case 'object'	: self.settings = baseImmagick.mergeSettings(self.settings, argument, true); break;
					case 'function'	: self.callback = argument; break;
				}
			}
			// If destionationImagePath is null then destionationImagePath is equal to sourceImagePath
			if (self.destionationImagePath === null) self.destionationImagePath = sourceImagePath;
			// Retrieve the folder path
			var dirpath = path.dirname(self.destionationImagePath);
			// Create the filename with the format into settings value
			var filename = path.basename(self.destionationImagePath, path.extname(self.destionationImagePath)) + '.' + self.settings.format;
			// Recreate destionationImagePath
			self.destionationImagePath = path.join(dirpath, filename);
		}(this);
	};
	
	var _callBaseImmagickExec = function (commands, options) {
		// Execution the commands
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
			if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
		});		
	}
	
	var _resize = function (listArguments, additionalParameter) {
		// Parse arguments
		var options = new _parseArguments(listArguments, { width : null, height : null });
		// Verify if width or height are setting
		if (options.settings.width !== null || options.settings.height !== null) {
			// Create the coordinate for the crop
			var dimension = (options.settings.width !== null ? options.settings.width : '') + 'x' + (options.settings.height !== null ? options.settings.height : '') + additionalParameter;
			// Instance command to crop the image
			var commands = [
				'convert'	, sourceImagePath, 
				'-resize'	, dimension,
				'-format'	, options.settings.format, 
				'-quality'	, options.settings.quality, 
				options.destionationImagePath
			];
			// Execution the commands
			_callBaseImmagickExec(commands, options);
		} else {
			// Return error
			var errorCode = 'Width or height must be set';
			if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
		}		
	}
	
	/**
	 * Resize will fit the image into the requested size. 
	 */
	this.resizeImage = function (/*destinationPath, settings, callback*/) {
		// Call common function
		_resize(arguments, '');
	}
	
	/**
	 * Force resize to ignore the aspect ratio and distort the image. Generate an image exactly the size specified
	 */
	this.resizeImageIgnoreAspectRatio = function (/*destinationPath, settings, callback*/) {
		// Call common function
		_resize(arguments, '\\!');
	}
	
	/**
	 * Restrict image so that it will only shrink images to fit into the size given. Never enlarge
	 */
	this.resizeImageIntoSize = function (/*destinationPath, settings, callback*/) {
		// Call common function
		_resize(arguments, '\\>');
	}
	
	/**
	 * Resize to scale the image by the amount specified
	 */
	this.resizePercentageImage = function (/*destinationPath, settings, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, { amount : null });
		// Verify if width or height are setting
		if (options.settings.amount !== null) {
			// Create the coordinate for the crop
			var dimension = options.settings.amount + '%';
			// Instance command to crop the image
			var commands = [
				'convert'	, sourceImagePath, 
				'-resize'	, dimension,
				'-format'	, options.settings.format, 
				'-quality'	, options.settings.quality, 
				options.destionationImagePath
			];
			// Execution the commands
			_callBaseImmagickExec(commands, options);
		} else {
			// Return error
			var errorCode = 'Amount value must be setting';
			if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
		}
	}
	
	/**
	 * Extracts a region of the image
	 */
	this.cropImage = function (/*destinationPath, settings, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, { width : 100, height : 100, x : 0, y : 0 });
		// Verify if coordinates are setting
		if (options.settings.width !== null && options.settings.height !== null && options.settings.x !== null && options.settings.y !== null) {
			// Create the coordinate for the crop
			var coordinates = options.settings.width + 'x' + options.settings.height + (options.settings.x < 0 ? options.settings.x : '+' + options.settings.x) + (options.settings.y < 0 ? options.settings.y : '+' + options.settings.y);
			// Instance command to crop the image
			var commands = [
				'convert'	, sourceImagePath, 
				'-crop'		, coordinates, 
				'-format'	, options.settings.format, 
				'-quality'	, options.settings.quality, 
				options.destionationImagePath
			];
			// Execution the commands
			_callBaseImmagickExec(commands, options);
		} else {
			// Return error
			var errorCode = 'Width, height, x and y must be setting';
			if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
		}
	}
	
	/**
	 * Creates a fixed size thumbnail by first scaling the image up or down and cropping a specified area from the center.
	 */
	this.cropThumbnailImage = function (/*destinationPath, settings, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, { square : 100 });
		// Verify if square is setting
		if (options.settings.square !== null) {
			// Create the coordinate for the crop
			var dimension = options.settings.square + 'x' + options.settings.square;
			// Instance command to crop the image
			var commands = [
				'convert'		, sourceImagePath, 
				'-thumbnail'	, dimension + '^', 
				'-format'		, options.settings.format, 
				'-gravity'		, 'center', 
				'-extent'		, dimension, 
				options.destionationImagePath
			];
			// Execution the commands
			_callBaseImmagickExec(commands, options);
		} else {
			// Return error
			var errorCode = 'Square must be setting';
			if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
		}
	}
	
	/**
	 * Creates a fixed size thumbnail by first scaling the image up or down and cropping a specified area from the center.
	 */
	this.cropThumbnailFitImage = function (/*destinationPath, settings, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, { square : 100, background : null, format : 'png' });
		// Verify if square is setting
		if (options.settings.square !== null) {
			// Create the coordinate for the crop
			var dimension = options.settings.square + 'x' + options.settings.square;
			// Instance command to crop the image
			var commands = [
				'convert'		, sourceImagePath, 
				'-thumbnail'	, dimension, 
				'-background'	, options.settings.background === null ? 'none' : "'" + options.settings.background + "'", 
				'-format'		, options.settings.format, 
				'-gravity'		, 'center', 
				'-extent'		, dimension, 
				options.destionationImagePath
			];
			// Execution the commands
			_callBaseImmagickExec(commands, options);
		} else {
			// Return error
			var errorCode = 'Square must be setting';
			if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
		}
	}
}
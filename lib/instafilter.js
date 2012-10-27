var path = require('path');
var when = require('when');

module.exports = function (sourceImagePath, Immagick, baseImmagick) {
	
	var _baseSettings = {
		quality : 75,
		format : 'jpg'
	};
	
	var _parseArguments = function (argumentsFunction, settings) {
		this.settings = baseImmagick.mergeSettings(_baseSettings, settings);
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
					case 'object'	: self.settings = baseImmagick.mergeSettings(self.settings, argument); break;
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
	
	var _border = function (customSettings) {
		// Create a deferred object
		var deferred = when.defer();
		// Base options
		var settings = baseImmagick.mergeSettings({ 
			sourceImagePath : sourceImagePath, 
			destionationImagePath : sourceImagePath, 
			color : 'black', 
			width : 20 
		}, customSettings);
		// Instance command to crop the image
		var commands = [
			'convert', settings.sourceImagePath, 
			'-bordercolor', "'" + settings.color + "'",
			'-border', settings.width + 'x' + settings.width, 
			settings.destionationImagePath
		];
		// Execution the commands
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			// Verify if exists one error
			if (!error) {
				deferred.resolve(stdout);				
			} else {
				deferred.reject(stderr);
			}
		});
		// Return promise
		return deferred.promise;
	}
	
	var _frame = function (customSettings) {
		// Create a deferred object
		var deferred = when.defer();
		// Base options
		var settings = baseImmagick.mergeSettings({ 
			sourceImagePath : sourceImagePath, 
			destionationImagePath : sourceImagePath, 
			frame : '',
			width : null,
			height : null
		}, customSettings);
		// Instance command to crop the image
		var commands = [
			'convert', settings.sourceImagePath, 
			'\\(', 
			path.normalize(path.join(__dirname, '..', 'frame', settings.frame))
			'-resize', settings.width + 'x' + settings.height + '!',
			'-unsharp', '1.5×1.0+1.5+0.02',
			'\\)', 
			'-flatten',
			settings.destionationImagePath
		];
		// Execution the commands
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			// Verify if exists one error
			if (!error) {
				deferred.resolve(stdout);				
			} else {
				deferred.reject(stderr);
			}
		});
		// Return promise
		return deferred.promise;
	}
	
	var _colortone = function (customSettings) {
		// Create a deferred object
		var deferred = when.defer();
		// Base options
		var settings = baseImmagick.mergeSettings({ 
			sourceImagePath : sourceImagePath, 
			destionationImagePath : sourceImagePath, 
			color : null, 
			level : null, 
			negate : false 
		}, customSettings);
		// Instance command to crop the image
		var commands = [
			'convert', settings.sourceImagePath, 
			'\\(', 
				[
					'-clone', '0',
					'-fill', settings.color === null ? '' : "'" + settings.color + "'",
					'-colorize', '100%'
				].join(' '), 
			'\\)',
			'\\(', 
				[
					'-clone', '0',
					'-colorspace', 'gray',
					settings.negate ? '-negate' : ''
				].join(' '), 
			'\\)',
			'-compose', 'blend',
			'-define', 'compose:args=' + settings.level + ',' + (100 - settings.level),
			'-composite', 
			settings.destionationImagePath
		];
		// Execution the commands
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			// Verify if exists one error
			if (!error) {
				deferred.resolve(stdout);				
			} else {
				deferred.reject(stderr);
			}
		});
		// Return promise
		return deferred.promise;
	}
	
	var _vignette = function (customSettings) {
		// Create a deferred object
		var deferred = when.defer();
		// Base options
		var settings = baseImmagick.mergeSettings({ 
			sourceImagePath : sourceImagePath, 
			destionationImagePath : sourceImagePath, 
			crop_factor : 1.5, 
			width : null, 
			height : null, 
			color_1 : 'none', 
			color_2 : 'black' 
		}, customSettings);
		// Create a new dimension by 'crop_factor'
		var newSize = (settings.width * settings.crop_factor) + 'x' + (settings.height * settings.crop_factor);
		// Instance command to crop the image
		var commands = [
			'convert', '\\(', settings.sourceImagePath, '\\)',
			'\\(', 
			'-size', newSize,
			'radial-gradient:' + settings.color_1 + '-' + settings.color_2, 
			'-gravity', 'center',
			'-crop', settings.width + 'x' + settings.height + '+0+0 +repage',
			'\\)', 
			'-compose', 'multiply',
			'-flatten', 
			settings.destionationImagePath
		];
		// Execution the commands
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			// Verify if exists one error
			if (!error) {
				deferred.resolve(stdout);				
			} else {
				deferred.reject(stderr);
			}
		});
		// Return promise
		return deferred.promise;
	}
	
	this.gotham = function (/*destionationImagePath, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, {});
		// Instance the commands for this filter
		var commands = [
			'convert', sourceImagePath,
			'-modulate', '120,10,100', 
			'-fill', "'#222b6d'",
			'-colorize', '20',
			'-gamma', '0.5',
			'-contrast', 
			'-contrast', 
			options.destionationImagePath
		];
		// Execution the commands
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			// Verify if exists an error
			if (error) {
				var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
				if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
			} else {
				// Exec border effect
				when(_border({ 
						sourceImagePath : options.destionationImagePath, 
						destionationImagePath : options.destionationImagePath 
					}), function (stdout) {
						if (typeof options.callback == 'function') options.callback(null, options.destionationImagePath);					
					}, function (stderr) {
						if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);
					}
				);
			}
		});		
	};
	
	this.toaster = function (/*destionationImagePath, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, {});
		// Retrieve info image
		Immagick.identify(function (error, info) {
			// Exec colortone effect
			when(_colortone({ 
					sourceImagePath : sourceImagePath, 
					destionationImagePath : options.destionationImagePath, 
					color : '#330000', 
					level : 100, 
					negate : true 
				}), function (stdout) {
					// Instance the commands for this filter
					var commands = [
						'convert', options.destionationImagePath,
						'-modulate', '150,80,100', 
						'-gamma', '1.2',
						'-contrast', 
						'-contrast', 
						options.destionationImagePath
					];
					// Execution the commands
					baseImmagick.exec(commands, function (error, stdout, stderr) {
						// Verify if exists an error
						if (error) {
							var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
							if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
						} else {
							// Execution the commands
							when(_vignette({
									sourceImagePath : options.destionationImagePath, 
									destionationImagePath : options.destionationImagePath, 
									width : info.width,
									height : info.height,
									color_1 : 'none',
									color_2 : 'LavenderBlush3'
								}), function (stdout) {
									// Execution the commands
									when(_vignette({
											sourceImagePath : options.destionationImagePath, 
											destionationImagePath : options.destionationImagePath, 
											width : info.width,
											height : info.height,
											color_1 : '#ff9966',
											color_2 : 'none'
										}), function (stdout) {
											if (typeof options.callback == 'function') options.callback(null, options.destionationImagePath);
										}, function (stderr) {
											if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);								
										}
									);
								}, function (stderr) {
									if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);								
								}
							);
						}
					});
				}, function (stderr) {
					if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);
				}
			);
		});
	};
	
	this.nashville = function (/*destionationImagePath, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, {});
		// Retrieve info image
		Immagick.identify(function (error, info) {
			// Exec colortone effect
			when(_colortone({ 
					sourceImagePath : sourceImagePath, 
					destionationImagePath : options.destionationImagePath, 
					color : '#330000', 
					level : 100, 
					negate : true 
				}), function (stdout) {
					// Exec colortone effect
					when(_colortone({ 
							sourceImagePath : options.destionationImagePath, 
							destionationImagePath : options.destionationImagePath, 
							color : '#f7daae', 
							level : 100, 
							negate : false 
						}), function (stdout) {
							// Instance the commands for this filter
							var commands = [
								'convert', options.destionationImagePath,
								'-contrast',
								'-modulate', '100,150,100',
								'-auto-gamma', 
								options.destionationImagePath
							];
							// Execution the commands
							baseImmagick.exec(commands, function (error, stdout, stderr) {
								// Verify if exists an error
								if (error) {
									var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
									if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
								} else {
									// Execution the commands
									when(_frame({
											sourceImagePath : options.destionationImagePath, 
											destionationImagePath : options.destionationImagePath, 
											width : info.width,
											height : info.height,
											frame : 'nashville'
										}), function (stdout) {
											if (typeof options.callback == 'function') options.callback(null, options.destionationImagePath);
										}, function (stderr) {
											if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);								
										}
									);
								}
							});
						}, function (stderr) {
							if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);
						}
					);
				}, function (stderr) {
					if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);
				}
			);
		});
	}
	
	this.lomo = function (/*destionationImagePath, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, {});
		// Retrieve info image
		Immagick.identify(function (error, info) {
			// Instance the commands for this filter
			var commands = [
				'convert', sourceImagePath,
				'-channel', 'R',
				'-level', '33%',
				'-channel', 'G',
				'-level', '33%',
				options.destionationImagePath
			];
			// Execution the commands
			baseImmagick.exec(commands, function (error, stdout, stderr) {
				// Verify if exists an error
				if (error) {
					var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
					if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
				} else {
					// Execution the commands
					when(_vignette({
							sourceImagePath : options.destionationImagePath, 
							destionationImagePath : options.destionationImagePath, 
							width : info.width,
							height : info.height
						}), function (stdout) {
							if (typeof options.callback == 'function') options.callback(null, options.destionationImagePath);
						}, function (stderr) {
							if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);								
						}
					);
				}
			});
		});
	}
	
	this.kelvin = function (/*destionationImagePath, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, {});
		// Retrieve info image
		Immagick.identify(function (error, info) {
			// Instance the commands for this filter
			var commands = [
				'convert', 
				'\\(', 
				sourceImagePath,
				'-auto-gamma',
				'-modulate', '120,50,100',
				'\\)',
				'\\(', 
				'-size', info.width + 'x' + info.height,
				'-fill', 'rgba\\(255,153,0,0.5\\)',
				'-draw', '\'rectangle 0,0 ' + info.width + ',' + info.height + '\'',
				'\\)',
				'-compose', 'multiply',
				options.destionationImagePath
			];
			// Execution the commands
			baseImmagick.exec(commands, function (error, stdout, stderr) {
				// Verify if exists an error
				if (error) {
					var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
					if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
				} else {
					// Execution the commands
					when(_frame({
							sourceImagePath : options.destionationImagePath, 
							destionationImagePath : options.destionationImagePath, 
							width : info.width,
							height : info.height,
							frame : 'kelvin'
						}), function (stdout) {
							if (typeof options.callback == 'function') options.callback(null, options.destionationImagePath);
						}, function (stderr) {
							if (typeof options.callback == 'function') options.callback(stderr.replace(/(\r\n|\n|\r)/gm,''), options.destionationImagePath);								
						}
					);
				}
			});
		});
	}
	
	this.tiltShift = function (/*destionationImagePath, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, {});
		// Instance the commands for this filter
		var commands = [
			'convert', 
			'\\(', 
			sourceImagePath,
			'-gamma', '0.75',
			'-modulate', '100,130',
			'-contrast',
			'\\)',
			'\\(', 
			'+clone',
			'-sparse-color', 'Barycentric \'0,0 black 0,%h white\'',
			'-function', 'polynomial 4,-4,1',
			'-level', '0,50%',
			'\\)',
			'-compose', 'blur',
			'-set', 'option:compose:args 5', 
			'-composite',
			options.destionationImagePath
		];
		// Execution the commands
		baseImmagick.exec(commands, function (error, stdout, stderr) {
			// Verify if exists an error
			if (error) {
				var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
				if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
			} else {
				if (typeof options.callback == 'function') options.callback(null, options.destionationImagePath);
			}
		});		
	}
}
var fs		= require('fs');
var path	= require('path');
var when	= require('when');

module.exports = function (sourceImagePath, Immagick, baseImmagick) {
	
	var _parseArguments = function (argumentsFunction, settings) {
		this.settings = settings;
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
		}(this);
	};
	
	var _createCommandsFromSettings = function (commands, settings) {
		// Scan the settings
		for (var option in settings) {
			// Verify if value is not null
			if (settings[option] !== null) {
				if (settings[option] !== false)
					commands.push('-' + option.substr(0,1));
				if (settings[option] !== true && settings[option] !== false)
					commands.push(settings[option]);
			}
		}
	}
	
	var _execScript = function (scriptName, args, baseSettings) {
		// Parse arguments
		var options = new _parseArguments(args, baseSettings);
		// Instance the commands for this filter
		var commands = [path.normalize(path.join(__dirname, '..', 'script', scriptName))];
		// Create commands
		_createCommandsFromSettings(commands, options.settings);
		// Add path
		commands.push(sourceImagePath);
		commands.push(options.destionationImagePath);
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
	
	/**
	 * Automatically adjusts the white balance of an image
	 * 
	 * ARGUMENTS:
	 * 
	 * method		defines how the white balance adjustment will be handled. Method 1 uses a multiplicative adjustment using -recolor (-color-matrix), where the matrix values are the ratios of 100% to the channel averages in percent graylevel. Method 2 uses an additive adjustment using -evaluate add, where the additive amount is the percent difference of the channel averages from 100%. Method 1 is generally superior. Method 2 often shifts the overall color oddly. The default is method=1.
	 * percent		is the percentage of pixels closest in color to white that is used to compute the average graylevel of each RGB channel in the image. Values are floats between 0 and 100. Default=1
	 */
	this.autowhite = function (/*destionationImagePath, settings, callback*/) {
		_execScript('autowhite', arguments, { method : 1, percent : 1 });
	}
	
	/**
	 * Applies a bevel effect to border of an image
	 * 
	 * ARGUMENTS:
	 * 
	 * size			is the dimensions of the border region in pixels. The same value is used in both dimensions. Values are integers greater than 0. The default is 10% of the min(width,height) of the image.
	 * method		is the bevel method. Choices are: outer, which makes a raised effect; inner, which makes a depressed effect; and split, which is part raised and part depressed. The amount of each is controlled by the percent argument. The default is outer.
	 * percent		is the percent split between outer and inner bevels. Values are integers such that 0<=percent<=100. A value of 100 is full outer bevel. A value of 0 is full inner bevel. The default is 50 and only applies when the method=split.
	 * contrast		percent for innerbevel or outerbevel. Values are integers between 0 and 100. The default=50.
	 * bcolor		is the bevel colorization color. Any valid opaque IM color is allowed. The default is no additional colorization.
	 * amount		of colorization. Values are integers between 0 and 100. The default=25.
	 * type			of compose. Choices are: hardlight, linearlight and vividlight. The default=hardlight
	 */
	this.bevelborder = function (/*destionationImagePath, settings, callback*/) {
		_execScript('bevelborder', arguments, { size : 10, method : 'outer', percent : 50, contrast : 50, bcolor : null, amount : 25, type : 'hardlight' });
	}
	
	/**
	 * Creates various dispersion-like effects in the border of an image
	 * 
	 * ARGUMENTS:
	 * 
	 * size			is the size or dimension of the border region. It will be the same size all around the image. Values are integer greater than 0. The default is 5.
	 * density		is the frequency of detail in the border. Values are floats greater than or equal to 1. The default=5.
	 * curviness	is the curviness in the border features. Larger values create more curviness. Values are floats greater than or equal to 0. The default=5.
	 * granularity	is the base grain size or pixelization size used to create the detail in the border. Values are integers greater than 0. The default is 1.
	 * bgcolor		is the background color to use in the border. Any valid IM color may be used. The default is white.
	 * pad			is the pad size of constant color around the perimeter of the border. Values are integers greater or equal to 0. The default=2.
	 * reseed		is forced seed value to use for randomization. This permits the pattern to be repeated. The default is to change the seed value randomly each time the script is run, thus causing somewhat different patterns each time the script is run.
	 */
	this.bordereffects = function (/*destionationImagePath, settings, callback*/) {
		_execScript('bordereffects', arguments, { size : 5, density : 5, curviness : 5, granularity : 1, bgcolor : 'white', pad : 2, reseed : null });
	}
	
	/**
	 * To create a cartoon-like appearance to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * method		is the color reduction method. The choices are 1 or 2. Method 1 uses the IM -colors function channel-by-channel. Method 2 computes a -fx formula and is applied via -clut. The default=1
	 * numcolors	is the desired number of reduced colors. Values are integers>0. The default=10.
	 * imagefilter	is the size of a median filter that will be applied to the image before reducing colors. Values are integers>=0. The default=2.
	 * edgefilter	is the size of a median filter that will be applied to a grayscale version of the image before extracting edges. Values are integers>=0. The default=2.
	 * pctedges		is the percentage of the edges from the gradient edge extraction from the grayscale image to overlay on the image. Values are 0<=integer<=100. The default=75.
	 * smooth		is the amount of (-blur) smoothing to apply to the color reduced image before the edges are overlayed. Values are floats>=0. The default=1.
	 */
	this.cartoon = function (/*destionationImagePath, settings, callback*/) {
		_execScript('cartoon', arguments, { method : 1, numcolors : 10, imagefilter : 2, edgefilter : 2, pctedges : 75, smooth : 1 });
	}
	
	/**
	 * Applies a laplacian filter to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * filter		is the form of the filter. Three different 3x3 filters, one 5x5 filter and one 7x7 filters are provided in order of the increasing edge strength they produce. Values for filter are 1 to 5. The default is filter=1.
	 * thresh		is the thresholding percentage used to create a binary Laplacian edge image. Values range from 0 to 100. A higher value will result in fewer edges in the resulting image.
	 * mix			is the percentage mixing factor used to blend the Laplacian with the original image. A value of mix=0, results in the original image. A value of mix=100 results in a pure Laplacian filtered image.
	 */
	this.laplacian = function (/*destionationImagePath, settings, callback*/) {
		_execScript('laplacian', arguments, { filter : 1, thresh : null, mix : 50 });
	}
	
	/**
	 * Applies a Roy Lichtenstein newspaper cartoon effect to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * poster		is the number of posterize levels. Values are integers>=0. The default=7.
	 * blur1		is the main blurring amount. Values are floats>=0. The default=3.
	 * sigmoidal	is the amount of (inverse) sigmoidal contrast. Values are floats>=0. The default=2.
	 * dither		is the kind of ordered dither to use. Any valid IM ordered dither is allowed. The default=o8x8. A suggested alternate is h6x6a. If dither=none, the dithering will be disabled.
	 * Blur2		is the minor (softening) blurring amount. Values are floats>=0. The default=1.
	 * edge			is the amount of edge enhancement. Values are integers>=0. The default=2.
	 * gain			is the amount of edge gain (intensity). Values are floats>=0. The default=5.
	 * Erode		is the amount of erosion of the edges to thicken them. Values are integers>=0; default=1.
	 * Sat			is the color saturation amount. Values are integers>=0. The default=175. (100 is no change)
	 */
	this.lichtenstein = function (/*destionationImagePath, settings, callback*/) {
		_execScript('lichtenstein', arguments, { poster : 7, blur1 : 3, sigmoidal : 2, dither : 'o8x8', Blur2 : 1, edge : 2, gain : 5, Erode : 1, Sat : 175 });
	}
	
	/**
	 * Applies various mottle effects to an image.
	 * 
	 * ARGUMENTS:
	 * 
	 * type			of mottle effect. Choices are: displace or (d), modulate (or m) and blend (or b). The modulate and blend options are better suited for binary images. The default is displace.
	 * amount		of displacement in pixels. Values are integers>=0. The default=5. Modulate and blend are not sensitive to this parameter.
	 * granularity	is the size of the mottled areas. Values are floats>=0. The default=5.
	 * color		is the mixing color for the type=blend effect. Any valid IM color is allowed. See http://imagemagick.org/script/color.php The default=white. When region=background, this produces a "cloud-like" color effect on a color image. When region=foreground, this produces a mottled color tinting effect to a color image.
	 * region		is the location where the type=blend effect coloration is applied. Values are either foreground (f) or background (b). The default=foreground.
	 * newseed		is the forced seed value to use for randomization. This permits the pattern to be repeated. Values are integers>0. The default is to change the seed value randomly each time the script is run, thus causing somewhat different patterns each time the script is run.
	 * shimmer		Apply a color shimmer effect with type=modulate.
	 */
	this.mottle = function (/*destionationImagePath, settings, callback*/) {
		_execScript('mottle', arguments, { type : null, amount : 5, granularity : 5, color : 'black', region : 'foreground', newseed : null, shimmer : null });
	}
	
	/**
	 * Applies a pagecurl effect to the lower right corner of an image
	 * 
	 * ARGUMENTS:
	 * 
	 * amount		of pagecurl expressed as percent of image width. Values are integers>=5. The default=50
	 * mode			shading on the curl. Choices are: plain (or p), grad (or g) for gradient, or doublegrad (or d) for double gradient. Default=doublegrad.
	 * color		is the color to apply to curl. Any valid IM color is allowed. The default=white.
	 * bgcolor		is the color to apply to curled away part of the image. Any valid IM color is allowed. The default=none for transparent. If a background file is provided, bgcolor must be none.
	 * ellipticity	is the amount of curl flattening from a circle to an ellipse. Values are in range 0<=float<1. The default=0 for circle. Recommended value other 0 is 0.5 for ellipse shape.
	 * xcoord		is the X coordinate for the apex of the curl. Values are 0<integers<width. The default is the right edge of the image.
	 * ycoord		is the Y coordinate for the apex of the curl. Values are integers. The default is the upper edge of the image.
	 * gcontrast	is the contrast adjustment for mode=grad. Values are in range 0<=integer<=100. This increases contrast only. The default=15
	 * dcontrast	is the contrast adjustment for mode=doublegrad. Values are in range -100<=integer<=100. Positive values increase contrast. Negative values decrease contrast. The default=0
	 */
	this.pagecurl = function (/*destionationImagePath, settings, callback*/) {
		_execScript('pagecurl', arguments, { amount : 50, mode : 'grad', color : 'white', bgcolor : 'none', ellipticity : 0, xcoord : null, ycoord : null, gcontrast : 15, dcontrast : 0 });
	}
	
	/**
	 * To apply various circular ripple effects to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * type			of circular ripple/wave effect. Choices are: displace or (d), modulate (or m) and blend (or b). The displace option produces water-like ripples. The modulate and blend options are better at producing wavy patterns. The default is displace.
	 * amplitude	or height of ripple. Values are integers>=0. The default=20. Types of modulate and blend are not sensitive to this parameter.
	 * width		is the width or wavelength of a single ripple. Values are integers>0. The default=25.
	 * offset		or extra spacing between ripples; integer>=0; default=0
	 * rmin			is the spacing from the center to the first ripple. Values are integers>=0. The default=25.
	 * center		=cx,cy are the comma separated coordinates in the image from where the circular ripples eminate. Values are integers>=0. The default is the center of the image.
	 * power		is the exponent that controls the tapering of the ripples/waves. Values are floats>=0. Power=0 is no taper. Power=1 is linear taper. The default=1
	 * shadeval		=AZIMUTHxELEVATION are the optional x separated shading angles of azimulth (around) and elevation (up) for the lighting effect. Values are integers, 0<=azimuth<=360 degree and 0<=elevation<=90 degrees. See -shade for more details.
	 */
	this.ripples = function (/*destionationImagePath, settings, callback*/) {
		_execScript('ripples', arguments, { type : 'displace', amplitude : 20, width : 25, offset : 0, rmin : 25, center : null, power : 1, shadeval : null });
	}
	
	/**
	 * To apply a sketch effect to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * kind			of grayscale conversion. Choices are gray(g) or desat(d). The default=desat.
	 * edge			coarseness. Values are integers>0. The default=4.
	 * con			change. Values are integers>=0. The default=125. Note that con=125 for kind=desat is similar to con=0 for kind=gray.
	 * sat			change. Values are integers>=0. The default=100.
	 * grayscale	only
	 */
	this.sketch = function (/*destionationImagePath, settings, callback*/) {
		_execScript('sketch', arguments, { kind : 'desat', edge : 4, con : 125, sat : 100, grayscale : null });
	}
	
	/**
	 * To create a texture pattern and optionally apply it to the background of an input image
	 * 
	 * ARGUMENTS:
	 * 
	 * dimensions	of texture image to create if no input image is provided. Dimensions are specified as integers WIDTHxHEIGHT. The default=128x128.
	 * newseed		is the seed value to use for the random noise generator. Values are integers>0. The default=1.
	 * threshold	is the white-threshold percent to apply to the random noise. Values are in the range from 0 to 100. The default=2.
	 * blur			is the sigma of 1D Gaussian blur used to create the cross-hatch pattern from the random noise. It is applied both vertically and horizontally. Values are floats>=0. The default=9.
	 * widen		is the sigma of 2D Gaussian blur used to create a widening effect on the pattern. Values are floats>=0; The default=0.
	 * spread		is the amount of the spread effect to apply to the pattern. More spread will dissolve the cross-hatch and create more of a random noise pattern. Values are floats>=0. The default=0.
	 * gnoise		is the amplitude of additive Gaussian noise added to the final effect. Values are floats>=0. The default=5.
	 * format		is the format of the texture patten. Choices are: plain (p) or bump (b). The default=bump.
	 * mix			is mixing percentage of the texture with the infile. Values are in the range from 0 to 100. The default=25. Mix is ignored, if an infile is not provided.
	 * contrast		is the percent contrast increase of the image prior to mixing. Values are floats>=0. The default=0. Contrast is ignored, if an infile is not provided.
	 */
	this.texturize = function (/*destionationImagePath, settings, callback*/) {
		_execScript('texturize', arguments, { dimensions : '128x128', newseed : 1, threshold : 2, blur : 9, widen : 0, spread : 0, gnoise : 5, format : 'bump', mix : 25, contrast : 0 });
	}
	
	/**
	 * To apply a color tint to the mid-range of a grayscale image
	 * 
	 * ARGUMENTS:
	 * 
	 * mcolor		is the color to use in the mid grayscale range. The default=gray50. Any valid IM color is allowed. See http://imagemagick.org/script/color.php For tinting, a good choice of colors may be specified as hsl with saturation about 25% and lightness about 50% and your choice of hue in range 0 to 360 degrees. For reference, see http://homepages.cwi.nl/~steven/css/hsl-examples.html
	 * contrast		is the percent change in color contrast. Values are integers such that -100<=contrast<=100. The default=0.
	 * offset		is the percent shift of the colors in the lut. Values are integers such that -100<=offset<=100. Positive values shift the colors towards the brighter end of the grayscale and negative values shift the colors towards the darker end of the grayscale. The default=0.
	 * type			of smoothing/interpolation of the colors to fill out the look up table. The choices are: cubic, gaussian, quadratic and triangle. The default=quadratic.
	 */
	this.tintilize = function (/*destionationImagePath, settings, callback*/) {
		_execScript('tintilize', arguments, { mcolor : null, contrast : null, offset : null, type : null });
	}
	
	/**
	 * Simulates pictures taken by lomographic or holga type toy cameras
	 * 
	 * ARGUMENTS:
	 * 
	 * grayscale	First convert image to grayscale.
	 * inner		vignette radius as percent of image dimension. The default=0 means the vignette starts near the image center.
	 * outer		vignette radius as percent of image dimension. The default=150, which is about the image corners.
	 * dark			the graylevel of the darkest part of the vignette in the range 0 to 100, where 0 is black and 100 is white. The default=0
	 * feather		is the amount of feathering or smoothing of the transition around the inner radius. Values are floats>0. The default=0
	 * bri			is the percent change in brightness. Values are integers. The default=0 or no change.
	 * sat			is the percent change in saturation. Values are integers. The default=0 or no change.
	 * hue			is the percent change in brightness. Values are integers. The default=0 or no change.
	 * contr		is the percent change in contrast. Values are integers. The default=0 or no change.
	 * tint			is the overal tinting color. Any valid opaque IM color is allowed. The default=no tinting.
	 * amount		is the overal tinting amount. Values are integers in the range 0 to 100. The default=0 meaning no tinting.
	 * sharp		is the amount of sharpening to apply in the inner region. Values are floats>0. The default=0
	 * iblur		is the amount of blurring to apply in the inner region. Values are floats>0. The default=0
	 * oblur		is the amount of blurring to apply in the outer region. Values are floats>0. The default=0
	 * barrel		is the amount of barrel/pincussion distortion to apply. Values are floats. Positive values produce barrel distortion. Negative values produce pincussion distortion. Typical values are in the range -5 to +5. The default=0 meaning no distortion.
	 * double		is the doubling distortion spacing in the X and Y directions. Values are comma separate integer pairs with + or - signs. There must be no spaces and the signs are required. The default=+0,+0 means no doubling. Nominal values are about 3. The values are used by the -roll function to simulate chromatic abberation for grayscale images.
	 */
	this.toycamera = function (/*destionationImagePath, settings, callback*/) {
		_execScript('toycamera', arguments, { grayscale : null, inner : 0, outer : 150, dark : 0, feather : 0, bri : 0, sat : 0, hue : 0, contr : 0, tint : null, amount : 0, Sharp : 0, Iblur : 0, Oblur : 0, Barrel : 0, 'Double' : '+0,+0' });
	}
	
	/**
	 * To trim the background from any number of specified sides of an image
	 * 
	 * ARGUMENTS:
	 * 
	 * sides		is a comma delimited list of the sides to be trimmed enclosed in quotes. Any number of sides from one to four may be specified. The list can include any combination of: north, east, south, west or just "all". The default=north.
	 * fuzzamt		is the fuzz amount specified as a float percent greater than zero (without the % sign). The default is zero which indicates that border is a uniform color. Larger values are needed when the border is not a uniform color.
	 * bcolor		is the background color for the area to trim. Any valid IM color may be specified. The default will be determined automatically from the average color of all specified sides. There is no guarantee that this will be accurate. So if it does not work, then you will need to supply the border color.
	 * gcolor		is the guard color used to preserve the side that are not to be trimmed. Any valid IM color may be specified that is further from the background color than the fuzzval. The default will be determined automatically as either the complement of the background color, black or white whichever is furthest from the background color. There is no guarantee that this will be accurate. So if it does not work, then you will need to supply the guard color
	 */
	this.trimmer = function (/*destionationImagePath, settings, callback*/) {
		_execScript('trimmer', arguments, { sides : 'all', fuzzamt : null, bcolor : null, gcolor : null });
	}
	
	/**
	 * Applies a vignette effect to a picture
	 * 
	 * ARGUMENTS:
	 * 
	 * inner		vignette radius as percent of image dimension. The default=0 means the vignette starts near the image center.
	 * outer		vignette radius as percent of image dimension. The default=150, which is about the image corners.
	 * feather		is the amount of feathering or smoothing of the transition around the inner radius. Values are floats>0. The default=0
	 * color		is the vignette color. Any valid opaque IM color is allowed. The default=black.
	 * amount		is the overal coloring amount. Values are integers in the range 0 to 100. A value of zero means no vignette. The default=100 means full vignette color.
	 */
	this.vignette = function (/*destionationImagePath, settings, callback*/) {
		_execScript('vignette', arguments, { inner : 50, outer : 125, feather : null, color : 'black', amount : 100 });
	}
	
	/**
	 * Applies a woodcut effect to an image
	 * 
	 * ARGUMENTS
	 * 
	 * kind			of woodcut. Choices are: burn (b) or carve (c). The default=burn.
	 * presharp		is the pre-sharpening amount. Values are floats>=0. The default=12.
	 * edge			is the amount of edge enhancement. Values are floats>=0. The default=3.
	 * dither		percent strength. Values are integers betwee 0 and 100. The default=50.
	 * Postsharp	is the post-sharpening amount. Values are floats>=0. The default=0.
	 * azimuth		is the angle in degrees in the x-y plane measured counterclockwise from EAST to the light source used for the carve effect. Values are integers in the range 0 to 360. The default=135 (NorthWest).
	 * intensity	of the carve effect. Values are floats>=0. The default=1.
	 * mix			percent between processed image and woodfile. Values are integers between 0 and 100. The default=40.
	 * colors		are the colors used for additional colorizing of the processed image. Values are a comma separated pair of colors for foreground and background. The default="black,white".
	 * Sat			is the saturation gain to apply to the woodfile. Values are integers>=0. The default=125; (100 is no change).
	 * Hue			adjustment vallue for background woodfile. Values are integers>=0. The default=100 (no change)
	 */
	this.woodcut = function (/*destionationImagePath, settings, callback*/) {
		// Parse arguments
		var options = new _parseArguments(arguments, { kind : 'burn', presharp : 12, edge : 3, dither : 50, Postsharp : 0, azimuth : 135, intensity : 1, mix : 40, colors : null, Sat : 125, Hue : 100});
		// Retrieve info image
		Immagick.identify(function (error, info) {
			var textureName = new Date().getTime();
			var texturePath = path.normalize(path.join(__dirname, '..', 'tmp', textureName + '.jpg'));
			// Create wood texture
			var commands = [
				path.normalize(path.join(__dirname, '..', 'script', 'woodgrain')),
				'-d', info.width + 'x' + info.height,
				'-m', 'peachpuff',
				'-g', 'darkorange4',
				texturePath
			];
			// Execution the commands
			baseImmagick.exec(commands, function (error, stdout, stderr) {
				// Verify if exists an error
				if (!error) {
					// Instance the commands for this filter
					var commands = [path.normalize(path.join(__dirname, '..', 'script', 'woodcut'))];
					// Create commands
					_createCommandsFromSettings(commands, options.settings);
					// Add path
					commands.push(sourceImagePath);
					commands.push(texturePath);
					commands.push(options.destionationImagePath);
					// Execution the commands
					baseImmagick.exec(commands, function (error, stdout, stderr) {
						// Remove texture
						fs.unlink(texturePath);
						// Verify if exists an error
						if (error) {
							var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
							if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
						} else {
							if (typeof options.callback == 'function') options.callback(null, options.destionationImagePath);
						}
					});
				} else {
					var errorCode = error ? stderr.replace(/(\r\n|\n|\r)/gm,'') : null;
					if (typeof options.callback == 'function') options.callback(errorCode, options.destionationImagePath);
				}
			});
		});
	}
}
var fs		= require('fs');
var path	= require('path');
var when	= require('when');

module.exports = function (sourceImagePath, Imagick, baseImagick) {
	
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
					case 'object'	: self.settings = baseImagick.mergeSettings(self.settings, argument); break;
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
		var commands = [__dirname + '/script/' + scriptName];
		// Create commands
		_createCommandsFromSettings(commands, options.settings);
		// Add path
		commands.push(sourceImagePath);
		commands.push(options.destionationImagePath);
		// Execution the commands
		baseImagick.exec(commands, function (error, stdout, stderr) {
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
	 * Automatically tone balances an image
	 * 
	 * ARGUMENTS:
	 * 
	 * brightness	disable auto brightness/contrast
	 * gray			disable auto gray balance
	 * white		disable auto white balance
	 * Gamma		disable auto gamma correction
	 * noise		disable auto noise removal
	 * sharpening	disable auto sharpening
	 * progress		enable progress monitoring
	 * Resize		is the limit on the output image size. Values are integer>0. This will only resize if the larger dimension of the image exceeds this value. The default is no limit (i.e. no resize).
	 * Percent		is the percent threshold for detecting gray/white in the image for auto gray and auto white balance. Values are 0<floats<100. The default=1.
	 * Midrange		value for auto gamma correction. Values are 0<floats<1. The default=0.425.
	 * Noise		removal factor. Values are integers>0. The default is automatically computed. The nominal range is about 1 to 4 depending upon image size. Larger values are used for larger images.
	 * Sharp		is the sharpening amount. Values are floats>=0. The default is automatically computed. The nominal range is about 1 to 4. Larger values are used for larger images.
	 */
	this.autotone = function (/*destionationImagePath, settings, callback*/) {
		_execScript('autotone', arguments, { brightness : null, gray : null, white : null, Gamma : null, noise : null, sharpening : null, progress : null, Resize : null, Percent : 1, Midrange : 0.425, Noise : null, Sharp : null });
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
		_execScript('bevelborder', arguments, { size : 10, method : 'outher', percent : 50, contrast : 50, bcolor : null, amount : 25, type : 'hardlight' });
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
	 * Modifies an image so that it appears to be viewed through textured and/or tiled glass
	 * 
	 * ARGUMENTS:
	 * 
	 * effect		applies either a displacement or dispersion effect to the image. Choices are: disperse, displace or none. The default is disperse.
	 * amount		of dispersion or displacement in pixels. Values are integers>=0. A value of zero will be the same as effect=none. The default=3.
	 * density		is the density or frequency of the dispersion effect. Values are integers>=0. The default=3.
	 * granularity	is the size of the dispersion or displacement areas. Values are integers>=0. The default=3.
	 * kind			of grid desired. Choices are: simple or broken. Simple means continuous lines. Broken means the grid lines will be broken so the cells are somewhat separated and offset slightly. The default is simple.
	 * type			of grid desired. Choices are: single, double or bipolar. Single is a white grid on a black or gray background depending upon whether mode is set to overlay or displace, respectively. Double has the white grid lines doubled with an optional spacing between. Bipolar has double grid lines with an optional spacing between but one set is white and the other is black and they are both on a gray background as bipolar can only be used with mode=displace. The default is single.
	 * mode			of applying the grid to the image. Choices are: displace (which can be use for all types), overlay (which is valid only for single or double grid types) and grid (which indicates to output only the grid and ignore the image). Using mode=displace will cause the texture of the grid to come from the image offset by a displacement of 1/4 of the grid cell size. If the grid is single or double, the offset will come from the right or down from the grid by 1/4 of the cell size (due to the grid being white). If the grid is bipolar, then the offset will be 1/4 of the cell size from that edge of the grid towards the interior of the cell (due to the grid being composed of both black and white parts). That is, the white grid will get its texture from the right or down by 1/4 of the cell size and the black grid will get its texture from the left or up by 1/4 of the cell size. Using mode=overlay will simply mix the specified color with the image where the grid exists. The default is displace.
	 * weight		is the line weight for the grid lines. Values are integers>=0. If zero is selected, then the grid will not be applied. The default=1.
	 * spacing		is the spacing between either the double or bipolar grid lines. Values are integers>=0. If zero is selected, there will be no space between the double or bipolar grid. Thus a spacing of zero for double grid lines is equivalent to twice the weight for a single grid lines. The default=0.
	 * ripple		indicates have the grid lines ripple or wiggle rather than being straight lines. Values are integers>=0. The default=0 which indicates no ripple.
	 * bluramt		is the amount of blurring to apply to the grid lines. This is only relevant to mode=overlay. Values are integers>=0. The default=0.
	 * cellsize		is a comma separate pair of integers that represent the dimensions of the grid cells. If only one value is supplied, then it will be used for both dimensions. The cell size values must be larger than (2*weight+spacing) and cannot be zero. The default=30
	 * ocolor		is the mixing color for the grid with the image when mode=overlay. Any valid IM color is allowed. The default=white. See http://imagemagick.org/script/color.php
	 * intermix		is the mixing percent of the overlay color of the grid with the image background. Values are integers between 0 and 100. The default=100 indicates that the grid will be full overlay color and will not be mixed with the underlying image.
	 * newseed		is the forced seed value to use for randomization in the image effect and in the ripple. This permits the pattern to be repeated. The default is to change the seed value randomly each time the script is run, thus causing somewhat different patterns each time the script is run.
	 */
	this.glasseffects = function (/*destionationImagePath, settings, callback*/) {
		_execScript('glasseffects', arguments, { effect : 'disperse', amount : 3, density : 3, granularity : 3, kind : 'simple', type : 'single', mode : 'displace', weight : 1, spacing : 0, ripple : 0, bluramt : 30, cellsize : 'white', ocolor : null, intermix : 100, newseed : null });
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
		_execScript('laplacian', arguments, { filter : null, thresh : null, mix : null });
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
		_execScript('lichtenstein', arguments, { poster : null, blur1 : null, sigmoidal : null, dither : null, Blur2 : null, edge : null, gain : null, Erode : null, Sat : null });
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
		_execScript('mottle', arguments, { type : null, amount : null, granularity : null, color : null, region : null, newseed : null, shimmer : null });
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
		_execScript('pagecurl', arguments, { amount : null, mode : null, color : null, bgcolor : null, ellipticity : null, xcoord : null, ycoord : null, gcontrast : null, dcontrast : null });
	}
	
	/**
	 * Applies a pagepeel effect to the lower right corner of an image.
	 * 
	 * ARGUMENTS:
	 * 
	 * amount		of pagepeel expressed as percent of image diagonal. Values are in range integer>=1. Recommend at least 5. The default=30
	 * pcolor		is the color to apply to peeled region. Any valid IM color is allowed. The default=white.
	 * bgcolor		is the color to apply to peeled away part of the image. Any valid IM color is allowed. The default=none for transparent. If a background file is provided, bgcolor must be none.
	 * shortening	is the percent of peeled over amount relative to peeled away amount. Values are integers in the range 0 to 100. The default=90
	 * curvature	is proportional to the ratio of depth/half-width of the curve. Values are integers in the range 0 to 100. The default=30.
	 * mode			of curvature. The choices are: parabola (or p) or arc (or a). The arc is slightly faster. The default=parabola
	 * Shadow		size. Values are integers>=0. The default=0
	 * Darklevel	of shading. Values are integers between 0 and 100. Smaller numbers are darker. The default=25
	 * Brighten		percent of light area of shading. Values are integers between 0 and 100. The default=10
	 * Contrast		reduction of shading. Values are integers between 0 and 100. Smaller values reduce contrast more. The default=50
	 * Intermediate mask IMAGES. The images will be named: pagepeel_corner_mask.png, pagepeel_gradient_mask.png and if shadow != 0, then also pagepeel_shadow_mask.png This allows the same masks to be used for multiple images
	 */
	this.pagepeel = function (/*destionationImagePath, settings, callback*/) {
		_execScript('pagepeel', arguments, { amount : null, pcolor : null, bgcolor : null, shortening : null, curvature : null, mode : null, Shadow : null, Darklevel : null, Brighten : null, Contrast : null, Intermediate : null });
	}
	
	/**
	 * Remaps the colors in an image using a 3D color distance metric relative to a color table map image
	 * 
	 * ARGUMENTS:
	 * 
	 * numcolors	is the desired number of colors. If the input image has more than 256 unique colors, then the image will use -colors numcolors to reduce the number of colors. Values are 0
	 * metric		is the colorspace distance metric. The choices are: RGB or RGBL (luminance weighted RGB). The default=RGB
	 * show			SHOW/display textual data to the terminal
	 */
	this.remap = function (/*destionationImagePath, settings, callback*/) {
		_execScript('remap', arguments, { numcolors : null, metric : null, show : null });
	}
	
	/**
	 * To apply various circular ripple effects to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * type			of circular ripple/wave effect. Choices are: displace or (d), modulate (or m) and blend (or b). The displace option produces water-like ripples. The modulate and blend options are better at producing wavy patterns. The default is displace.
	 * amplitude	or height of ripple. Values are integers>=0. The default=20. Types of modulate and blend are not sensitive to this parameter.
	 * width		is the width or wavelength of a single ripple. Values are integers>0. The default=25.
	 * rmin			is the spacing from the center to the first ripple. Values are integers>=0. The default=25.
	 * center		=cx,cy are the comma separated coordinates in the image from where the circular ripples eminate. Values are integers>=0. The default is the center of the image.
	 * power		is the exponent that controls the tapering of the ripples/waves. Values are floats>=0. Power=0 is no taper. Power=1 is linear taper. The default=1
	 * shadeval		=AZIMUTHxELEVATION are the optional x separated shading angles of azimulth (around) and elevation (up) for the lighting effect. Values are integers, 0<=azimuth<=360 degree and 0<=elevation<=90 degrees. See -shade for more details.
	 */
	this.ripples = function (/*destionationImagePath, settings, callback*/) {
		_execScript('ripples', arguments, { type : null, amplitude : null, width : null, rmin : null, center : null, power : null, shadeval : null });
	}
	
	/**
	 * Adaptively sharpens an image or extract edges
	 * 
	 * ARGUMENTS:
	 * 
	 * method		is either 0 or 1. A value of 0 for method indicates edge extraction and value of 1 for method indicates sharpening. The default=1.
	 * factor		is the sharpening/edge extraction gain factor. It is a multiplier to the image's actual standard deviation. The value for factor must be greater than or equal to 0. A value of about 0.5 leaves the image nearly unchanged. A smaller value blurs the image or extract more edges. A larger value sharpens the image or extracts fewer edges. This transition value is not exact and is likely image statistics dependent as the result is a mix of the low pass filtered image (not the original image) and the adaptive high pass filtered image. Factor is floating point number. The default=2.
	 */
	this.sharp = function (/*destionationImagePath, settings, callback*/) {
		_execScript('sharp', arguments, { method : 1, factor : 2 });
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
		_execScript('sketch', arguments, { kind : null, edge : null, con : null, sat : null, grayscale : null });
	}
	
	/**
	 * To apply a softfocus effect to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * mix			is the mix percent between compose softlight and compose over methods. Mix=0 is -compose softlight and mix=100 is -compose over. Values are integers between 0 and 100. The default=50 (equal blend of the two methods).
	 * bluramt1		is the blur amount when using the compose softlight method. Values are floats>=0. The default=4.
	 * Bluramt2		is the blur amount when using the compose over method. Values are floats>=0. The default is automatically computed from the image size.
	 * opacity1		is the opacity amount when using the compose softlight method. Values are integers between 0 and 100. The default=50.
	 * Opacity2		is the opacity amount when using the compose over method. Values are integers between 0 and 100. The default=50.
	 * coords		are the x,y center coordinates for the no blur region when using the compose over method. Values are integers>=0. The default is the image center.
	 * radius		is the percent of the minimum distance between the specified coords and the edges of image. This radius computes the size of the no blur center region when the method is over. Values are integers between 0 and 100. The default=25. When no coords are specified the ramped blur will have an elliptical shape if the image is not square; otherwise, it will be a circle. It will always be a circle, if coords are specified.
	 */
	this.softfocus = function (/*destionationImagePath, settings, callback*/) {
		_execScript('softfocus', arguments, { mix : null, bluramt1 : null, Bluramt2 : null, opacity1 : null, Opacity2 : null, coords : null, radius : null });
	}
	
	/**
	 * Applies a stained glass cell effect to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * kind			of stainedglass cell shape; choices are: square (or s), hexagon (or h), random (or r). The latter is a square with each corner randomly offset. The default=random.
	 * size			of stained glass cells. Values are integers>=0. The default=16.
	 * offset		is the random offset amount for the case of kind=random. Values are integers>=0. The default=6.
	 * ncolors		is the number of desired reduced colors in the output. Values are integers>0. The default is no color reduction. Larger number of colors takes more time to color reduce.
	 * bright		value in percent for the output image. Values are integers>=0. The default=100 means no change in brightness.
	 * ecolor		is the color for the edge or border around each cell. Any valid IM color is allowed. The default=black.
	 * thick		is the thickness for the edge or border around each cell. Values are integers>=0. The default=1. A value of zero means no edge or border will be included.
	 * rseed		is the random number seed value for kind=random. Values are integers>=0. If a seed is provided, then the resulting image will be reproducable. The default is no seed. In that case, each resulting image will be randomly different.
	 */
	this.stainedglass = function (/*destionationImagePath, settings, callback*/) {
		_execScript('stainedglass', arguments, { kind : null, size : null, offset : null, ncolors : null, bright : null, ecolor : null, thick : null, rseed : null });
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
		_execScript('texturize', arguments, { dimensions : null, newseed : null, threshold : null, blur : null, widen : null, spread : null, gnoise : null, format : null, mix : null, contrast : null });
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
		_execScript('toycamera', arguments, { grayscale : null, inner : null, outer : null, dark : null, feather : null, bri : null, sat : null, hue : null, contr : null, tint : null, amount : null, sharp : null, iblur : null, oblur : null, barrel : null, 'double' : null });
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
		_execScript('trimmer', arguments, { sides : null, fuzzamt : null, bcolor : null, gcolor : null });
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
		var options = new _parseArguments(arguments, { kind : null, presharp : null, edge : null, dither : null, Postsharp : null, azimuth : null, intensity : null, mix : null, colors : null, Sat : null, Hue : null});
		// Retrieve info image
		Imagick.identify(function (error, info) {
			var textureName = new Date().getTime();
			var texturePath = __dirname + '/_tmp/' + textureName + '.jpg';
			// Create wood texture
			var commands = [
				__dirname + '/script/woodgrain',
				'-d', info.width + 'x' + info.height,
				'-m', 'peachpuff',
				'-g', 'darkorange4',
				texturePath
			];
			// Execution the commands
			baseImagick.exec(commands, function (error, stdout, stderr) {
				// Verify if exists an error
				if (!error) {
					// Instance the commands for this filter
					var commands = [__dirname + '/script/woodcut'];
					// Create commands
					_createCommandsFromSettings(commands, options.settings);
					// Add path
					commands.push(sourceImagePath);
					commands.push(texturePath);
					commands.push(options.destionationImagePath);
					// Execution the commands
					baseImagick.exec(commands, function (error, stdout, stderr) {
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
	
	/**
	 * Applies a radial or zoom blur to an image
	 * 
	 * ARGUMENTS:
	 * 
	 * amount		is the zoom factor. Values are floats greater than or equal to 1. A value of 1 produces no effect. Larger values increase the radial blur. Typical values are between 1 and 1.5. The default is 1.2. Note that the large the amount, the more iterations it will take.
	 * expands		is the output image size by the amount of the zoom.
	 */
	this.zoomblur = function (/*destionationImagePath, settings, callback*/) {
		_execScript('zoomblur', arguments, { amount : null, expand : null });
	}
}
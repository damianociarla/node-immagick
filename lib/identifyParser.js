module.exports = function (stdout) {
	// Removing spaces
	stdout = stdout.trim();
	// Verifing if stdout is empty
	if (stdout !== '') {
		// Fixed the first line
		var lines = ('  ' + stdout).split("\n");
		// Index reference
		var referenceIndex = 0;
		// Depth reference
		var referenceDepth = 1;
		// Parent reference
		var referenceParent = null;
		// Get line depth
		var getLineDepth = function (string) {
			// Calculating the initial spacing
			var spaces = string.match(/^ +/)[0].length;
			// Calculating the depth
			return (spaces / 2);
		};
		// Transform the string to camel case
		function camelCase(str) {
			return str.replace(/(?:^|\s)\w/g, function(match) {
				return match.toUpperCase();
			});
		}
		// Get value of the key
		var getKey = function (value, isCamelCase) {
			if (isCamelCase) {
				return camelCase(value.replace(/[\W_]/g, ' ').replace(/\s+/g, ' ')).replace(/\s+/g, '');
			} else {
				return value.replace(/[\W_]/g, '').replace(/\s+/g, '');				
			}
		}
		// Get value		
		var getValue = function (value) {
			if (value.match(/^\-?\d+$/)) {
				return parseInt(value, 10);
			} else if (value.match(/^\-?\d+?\.\d+$/)) {
				return parseFloat(value, 10);
			} else if (value.match(/^true$/i)) {
				return true;
			} else if (value.match(/^false$/i)) {
				return false;
			} else if (value.match(/^undefined$/i)) {
				return null;
			}
			return value;
		}
		// Process function
		var process = function () {
			// Final object
			var info = new Object();
			// Scan all lines
			while (referenceIndex < lines.length) {
				// Get line value
				var line = lines[referenceIndex];
				// Get index value
				var index = line.indexOf(':');
				// Verify if the line contain a colon to be processed
				if (index > -1) {
					// Calculate the depth
					var depth = getLineDepth(line);
					// Reset all values
					var obj = null;
					var key = null;
					var val = null;
					// Extracting key-value from the line
					var keyVal = line.split(':');
					// Check if only key-value
					if (keyVal.length == 2) {
						key = getKey(keyVal[0].slice((depth * 2)), false);
						val = getValue(keyVal[1].trim());
						// Chech if value is not empty
						if (val != '') {
							// Verify if depth is egual the reference depth
							if(depth == referenceDepth) {
								// Increment reference index
								referenceIndex++;
								// Check key
								switch (key) {
									case "Geometry" :
										// Extract width and height from geometry
										var parts = val.split('x');
										info.width = parseInt(parts[0], 10);
										info.height = parseInt(parts[1], 10);
										break;
									default:
										// Set key-val
										info[key] = val;
										break;
								}
							} else if (depth < referenceDepth) {
								// Increment reference index
								referenceIndex++;
								// Decrement reference depth
								referenceDepth--;
								// Unset reference parent
								referenceParent = null;
								break;
							}
						} else {
							// Verify if depth is egual the reference depth
							if(depth == referenceDepth) {
								// Increment reference index
								referenceIndex++;
								// Increment reference depth
								referenceDepth++;
								// Set reference parent
								referenceParent = key;
								// Call function to get children values
								info[key] = process();
							} else if (depth < referenceDepth) {
								// Decrement reference depth
								referenceDepth--;
								// Unset reference parent
								referenceParent = null;
								break;
							}
						}
					}
					// Parse properties
					if (keyVal.length > 2) {
						switch (referenceParent) {
							case 'Properties':
								obj = getKey(keyVal[0].slice((depth * 2)), false);
								key = getKey(keyVal[1], true);
								val = getValue(keyVal.slice(2).join('').trim());
								break;
							default:
								key = getKey(keyVal[0].slice((depth * 2)), false);
								val = getValue(keyVal.slice(1).join('').trim());
								break;
						}
						if (obj != null) {
							// Check if obj exists
							if (info[obj] == undefined) info[obj] = new Object();
							// Add value to obj-key
							info[obj][key] = val;
						} else {
							// Add value
							info[key] = val;
						}
						// Increment reference index
						referenceIndex++;
					}
				} else {
					// Increment reference index
					referenceIndex++;
				}
			}
			return info;
		};
		// Running the process and getting the parsed object
		return process();
	}
	
	return null;
}
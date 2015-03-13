var url = require('url');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var useragent = require('useragent');
var svg2png = require('svg2png');

module.exports = function(options) {

	if (!options)
		options = {};

	var fallbackPath = options.fallbackPath;
	var debug = !!options.debug;

	if (debug)
		console.log('Initialising' + fallbackPath);

	if (!fallbackPath)
		fallbackPath = '/svg-fallback';
	else if (fallbackPath.charAt(0) != '/')
		fallbackPath = '/' + fallbackPath;

	var localPath;
	if (module.parent)
		localPath = path.resolve(path.dirname(module.parent.filename));
	else
		localPath = __dirname;

	if (debug) {
		console.log('localPath is: ' + localPath);
		console.log('fallbackPath is: ' + fallbackPath);
	}


	return function(req, res, next) {
		var url_parts = url.parse(req.url, true);
		var pathname = url_parts.pathname;
		var extension = path.extname(pathname);

		var isHandled = false;

		if (extension) {
			if (extension.toLowerCase() == '.svg') {
				var query = url_parts.query || {};
				var agent = useragent.is(req.headers['user-agent']);
				var force = (query.force || '').toLowerCase() === 'true';
				var type = (query.type || '').toLowerCase();
				if (force || type === 'png' || agent.ie && parseFloat(agent.version) <= 8) {
					isHandled = true;

					var newPathname = fallbackPath + pathname + '.png';

					var doConvert = function() {
						if (debug)
							console.log('Converting ' + pathname + ' to ' + newPathname);
						svg2png(localPath + pathname, localPath + newPathname, function (err) {
							if (err) {
								console.log('There was an error converting SVG to PNG');
								console.log(err);
								res.status(500).send({ error: 'There was an error converting SVG to PNG' });
							}
							else {
								if (debug)
									console.log('Conversion successful, sending file content');
								res.sendFile(localPath + newPathname);
							}
						});
					};

					if (debug)
						console.log('Checking if file already exists: ' + localPath + newPathname);
					fs.exists(localPath + newPathname, function(exists) {
						if (exists && !force) {
							if (debug)
								console.log('File exists, sending file content');
							res.sendFile(localPath + newPathname);
						}
						else {
							var dirname = path.dirname(localPath + newPathname);
							if (debug) {
								console.log('File does not exist');
								console.log('Checking if container directory exists: ' + dirname);
							}
							fs.exists(dirname, function(exists) {
								if (!exists) {
									if (debug)
										console.log('Directory does not exist. Creating directory ' + dirname);
									mkdirp(dirname, function (err) {
										if (err) {
											console.log('There was an error creating path ' + dirname);
											console.log(err);
											res.status(500).send({ error: 'There was an error creating local data' });
										}
										else {
											if (debug)
												console.log('Directory created, proceeding with conversion');
											doConvert();
										}
									});
								}
								else {
									if (debug)
										console.log('Directory already exists, proceeding with conversion');
									doConvert();
								}
							});
						}
					});
				}
			}
		}

		if (!isHandled)
			next();
	};
};
var url = require('url');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var useragent = require('useragent');
var svg2png = require('svg2png');

function isSvgSupported(agent) {
	if (!agent.ie && !agent.android)
		return true;
	var version = parseFloat(agent.version);
	return (!agent.ie || version > 8) &&
		(!agent.android || version > 533.1);
}

module.exports = function(options) {

	if (!options)
		options = {};

	var fallbackPath = options.fallbackPath;

	var logger = options.logger;
	if (!logger) {
		var SimpleLogger = require('./simple-logger');
		logger = new SimpleLogger({
			enableDebug: options.debug,
			enableInfo: options.info
		});
	}

	logger.info('Initialising SVG fallback module');

	if (!fallbackPath)
		fallbackPath = '/svg-fallback';
	else if (fallbackPath.charAt(0) != '/')
		fallbackPath = '/' + fallbackPath;

	var localPath;
	if (module.parent)
		localPath = path.resolve(path.dirname(module.parent.filename));
	else
		localPath = __dirname;

	logger.debug('localPath is: ' + localPath);
	logger.debug('fallbackPath is: ' + fallbackPath);


	return function(req, res, next) {
		var url_parts = url.parse(req.url, true);
		var pathname = url_parts.pathname;
		var extension = path.extname(pathname);

		if (!extension || extension.toLowerCase() != '.svg')
			return next();

		var query = url_parts.query || {};
		var agent = useragent.is(req.headers['user-agent']);
		var force = (query.force || '').toLowerCase() === 'true';
		var type = (query.type || '').toLowerCase();

		if (!force && type !== 'png' && isSvgSupported(agent))
			return next();

		var newPathname = fallbackPath + pathname + '.png';

		var doConvert = function() {
			logger.debug('Converting ' + pathname + ' to ' + newPathname);
			svg2png(localPath + pathname, localPath + newPathname, function (err) {
				if (err) {
					logger.error('There was an error converting SVG to PNG');
					logger.error(err);
					return res.status(500).send({ error: 'There was an error converting SVG to PNG' });
				}
				logger.debug('Conversion successful, sending file content');
				res.sendFile(localPath + newPathname);
			});
		};

		logger.debug('Checking if file already exists: ' + localPath + newPathname);
		fs.exists(localPath + newPathname, function(exists) {
			if (exists && !force) {
				logger.debug('File exists, sending file content');
				return res.sendFile(localPath + newPathname);
			}

			var dirname = path.dirname(localPath + newPathname);
			logger.debug('File does not exist');
			logger.debug('Checking if container directory exists: ' + dirname);
			fs.exists(dirname, function(exists) {
				if (!exists) {
					logger.debug('Directory does not exist. Creating directory ' + dirname);
					mkdirp(dirname, function (err) {
						if (err) {
							logger.error('There was an error creating path ' + dirname);
							logger.error(err);
							return res.status(500).send({ error: 'There was an error creating local data' });
						}

						logger.debug('Directory created, proceeding with conversion');
						doConvert();
					});
					return;
				}

				logger.debug('Directory already exists, proceeding with conversion');
				doConvert();
			});
		});
	};
};
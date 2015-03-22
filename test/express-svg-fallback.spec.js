var request = require('supertest');
var express = require('express');
var fs = require('fs');
var assert = require('assert');
var svgFallback = require('../express-svg-fallback');

var app = null;
var log = null;
var fallbackPath = '/fixtures/converted';

function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

describe('', function() {
	this.timeout(20000);

	beforeEach(function() {
		app = express();
		log = [];
		app.use(svgFallback({
			fallbackPath: fallbackPath,
			logger: {
				debug: function() {
					for (var i = 0; i < arguments.length; i++)
						log.push("DEBUG: " + arguments[i]);
				},
				info: function() {
					for (var i = 0; i < arguments.length; i++)
						log.push("INFO: " + arguments[i]);
				},
				error: function() {
					for (var i = 0; i < arguments.length; i++)
						log.push("ERROR: " + arguments[i]);
				}
			}
		}));
		app.use('/fixtures', express.static(__dirname + '/fixtures'));
		deleteFolderRecursive(__dirname + fallbackPath);
	});

	afterEach(function() {
		deleteFolderRecursive(__dirname + fallbackPath);
	});

	describe('default', function() {

		it('should not convert PNG by default', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.expect('Content-Type', 'image/svg+xml')
				.expect(200, done);
		});

		it('should convert PNG when type=png', function(done) {
			request(app)
				.get('/fixtures/example.svg?type=png')
				.expect('Content-Type', 'image/png')
				.expect(200, done);
		});

		it('should convert PNG when force=true', function(done) {
			request(app)
				.get('/fixtures/example.svg?force=true')
				.expect('Content-Type', 'image/png')
				.expect(200, done);
		});

		it('should convert PNG only once', function(done) {

			request(app)
				.get('/fixtures/example.svg?type=png')
				.set('User-Agent', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)')
				.expect('Content-Type', 'image/png')
				.expect(200, function () {
					request(app)
						.get('/fixtures/example.svg?type=png')
						.set('User-Agent', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)')
						.expect('Content-Type', 'image/png')
						.expect(200, function() {
							if (log.indexOf('DEBUG: File exists, sending file content') < 0)
								assert.fail(false, true, 'Expected log to contain entry for existing file');
							done();
						});
			});
		});
	});

	describe('IE', function() {

		it('should convert PNG for IE8', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)')
				.expect('Content-Type', 'image/png')
				.expect(200, done);
		});

		it('should not convert PNG for IE9', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/4.0; GTB7.4; InfoPath.3; SV1; .NET CLR 3.1.76908; WOW64; en-US)')
				.expect('Content-Type', 'image/svg+xml')
				.expect(200, done);
		});
	});

	describe('Android', function() {

		it('should convert PNG for Android 2.3', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (Linux; U; Android 2.3.3; ko-kr; LG-LU3000 Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1')
				.expect('Content-Type', 'image/png')
				.expect(200, done);
		});

		it('should not convert PNG for Android 4', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (Linux; U; Android 4.0.3; de-ch; HTC Sensation Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30')
				.expect('Content-Type', 'image/svg+xml')
				.expect(200, done);
		});
	});

	describe('Chrome', function() {

		it('should not convert PNG', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
				.expect('Content-Type', 'image/svg+xml')
				.expect(200, done);
		});

		it('should convert PNG when type=png', function(done) {
			request(app)
				.get('/fixtures/example.svg?type=png')
				.set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
				.expect('Content-Type', 'image/png')
				.expect(200, done);
		});

		it('should convert PNG when force=true', function(done) {
			request(app)
				.get('/fixtures/example.svg?force=true')
				.set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
				.expect('Content-Type', 'image/png')
				.expect(200, done);
		});

		it('should not convert PNG when force=false', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36')
				.expect('Content-Type', 'image/svg+xml')
				.expect(200, done);
		});
	});
});

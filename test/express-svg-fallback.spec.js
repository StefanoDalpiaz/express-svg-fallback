var request = require('supertest');
var express = require('express');
var fs = require('fs');
var svgFallback = require('../express-svg-fallback');

var app = null;
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
		app.use(svgFallback({
			fallbackPath: fallbackPath
		}));
		app.use('/fixtures', express.static(__dirname + '/fixtures'));
		deleteFolderRecursive(__dirname + fallbackPath);
	});

	afterEach(function() {
		deleteFolderRecursive(__dirname + fallbackPath);
	});

	describe('IE8', function() {

		it('should convert PNG', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)')
				.expect('Content-Type', 'image/png')
				.expect(200, done);
		});

		it('should convert PNG once', function(done) {
			request(app)
				.get('/fixtures/example.svg')
				.set('User-Agent', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)')
				.expect('Content-Type', 'image/png')
				.expect(200, function () {
					request(app)
						.get('/fixtures/example.svg')
						.set('User-Agent', 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; GTB7.4; InfoPath.2; SV1; .NET CLR 3.3.69573; WOW64; en-US)')
						.expect('Content-Type', 'image/png')
						.expect(200, done);
			});
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

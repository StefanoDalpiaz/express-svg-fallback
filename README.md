# express-svg-fallback

`express-svg-fallback` is a middleware for [node.js](https://nodejs.org/) [Express](http://expressjs.com/) that handles requests for SVG files. If the requesting browser does not support SVG, the file is converted to PNG format and the converted content is served.

## Installation

Use Node Package Manager (npm) to download the module and install it in your project:

    npm install express-svg-fallback --save


## Usage

In your Express application, simply require the module and configure Express to use it as middleware. Example:

    var express = require('express');
    var svgFallback = require('express-svg-fallback');
    
    var app = express();
    app.use(svgFallback({
        // options
    }));
    
    app.listen(process.env.PORT || 80);

If you are including middleware for serving static files, `express-svg-fallback` must be used before the other middleware. Example:

    var app = express();
    app.use(svgFallback());
    app.use(express.static('assets'));
    // add other middleware
    
Whenever a request comes from a browser that does not support rendering of SVG files (IE8 or older, Android 2.3 or older), the module handles the request. The files are converted on the fly and then stored to disk. All subsequent requests for the same file will not result in a new conversion, instead, the previously generated PNG file will be served.


## Initialisation options:

 - **fallbackPath** (string): specifies the disk location (relative to the root path of the Express application) where the converted PNG files will be saved. To avoid filename clashes, the directory will contain a subtree that replicates the path of the request. For example, whenever requesting for a file with path `/assets/images/svg/logo.svg`, the converted file will be saved (with default settings) to `/svg-fallback/assets/images/svg/logo.svg.png`. The default value for this setting is `svg-fallback`.

 - **logger** (object): by default, the module will print errors and debug information to the standard output using a normal `console.error` or `console.log`. If your application uses a custom logging library (like [Winston](https://github.com/winstonjs/winston) or [Bunyan](https://github.com/trentm/node-bunyan), or any other similar library, as long as it supports the methods `error`, `info` and `debug`), you can pass the logger object via this property, so that all logging will be performed through it instead of the standard method.

 - **debug** (boolean): when set to `true`, the module will print debug information to the standard output. When set to `false`, it will only print errors. Default value is `false`. *Note:* when passing a custom `logger` object (see definition above), the value for the `debug` property will be ignored, and the log level settings for the specified logger object will be used instead.


## URL query string options

It is possible to let the module serve the converted PNG files even to browsers that natively support rendering of SVG files.

 - To always get the PNG version of a file, add the `?type=png` query string to the URL of the SVG file. For example http://www.example.com/image.svg?type=png will return the PNG version even when called from Chrome or Firefox.

 - To force the conversion of an image (ignoring any previously executed conversion), use the query string `?force=true`.


## Tests

Tests are provided to verify the correct execution of the middleware. To run those tests:

 - from the Console (or Command Prompt in Windows), navigate to the directory where the project has been saved

 - make sure that all the dependencies have been installed, by running `npm install`. This is only required once, and only in cases where the module has been installed using a method different from `npm install express-svg-fallback` - like cloning the GitHub repo or extracting from zip.

 - run `npm test`
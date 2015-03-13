# express-svg-fallback

Middleware for node.js Express that handles requests for SVG files. If the requesting browser does not support SVG, the file is converted to PNG format and the converted content is served.

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
    
    module.exports = app;
    
If you are including middleware for serving static files, `express-svg-fallback` must be used before the other middleware. Example:

    var app = express();
    app.use(svgFallback());
    app.use(express.static('assets'));
    // add other middleware
    
Whenever a request comes from a browser that does not support rendering of SVG files (currently only IE8), the module handles the request. The files are converted on the fly and then stored to disk. All subsequent requests for the same file will not result in a new conversion, instead, the previously generated PNG file will be served.


## Initialisation options:

 - **fallbackPath** (string): specifies the disk location (relative to the root path of the Express application) where the converted PNG files will be saved. To avoid filename clashes, the directory will contain a subtree that replicates the path of the request. For example, whenever requesting for a file with path `/assets/images/svg/logo.svg`, the converted file will be saved (with default settings) to `/svg-fallback/assets/images/svg/logo.svg.png`. The default value for this setting is `svg-fallback`.

 - **debug** (boolean): when set to `true`, the module will print debug information to the standard output. When set to `false`, it will only print errors. Default value is `false`.


## URL query string options

It is possible to let the module do the PNG conversion even when called from modern browsers. To always get the PNG version of a file, add the `?type=png` query string to the URL of the SVG file. For example http://www.example.com/image.svg?type=svg will return the PNG version even when called from Chrome or Firefox.

To force the conversion of an image (ignoring any previously exectued conversion), use the query string `?force=true`.

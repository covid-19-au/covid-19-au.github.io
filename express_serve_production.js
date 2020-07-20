// To run a production build:
//
// * alter the port/host values as needed
// * run "/bin/env sh ./build_production.sh" to build
// * run "node express_serve_production" run the built version

// The main advantage of using this script over another method of serving
// is it allows use of brotli compression, which typically is 20-30%
// smaller than gzip

// To run the dev build, don't use this script - instead run "npm start",
// as it doesn't take anywhere near as long to run each time, and allows for
// reloading/a debug web screen in the browser when there are exceptions

const path = require('path');
const express = require('express');
const expressStaticGzip = require('express-static-gzip');

const port = 3008;
const host = '0.0.0.0';
const app = express();

app.use(expressStaticGzip('./build', {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    setHeaders: function (res, path) {
        res.setHeader("Cache-Control", "public, max-age=31536000");
    }
}));

// Handle requests that don't match the ones above
// e.g. make sure an initial "/state/vic" redirects
// to the node/react main entry page
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(
    port, host,
    () => console.log(`Running covid-19-au on http://${host}:${port}`)
);

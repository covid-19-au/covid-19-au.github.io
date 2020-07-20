const path = require('path');
const express = require("express");
const expressStaticGzip = require("express-static-gzip");

var app = express();

app.use(expressStaticGzip('./build', {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    setHeaders: function (res, path) {
        res.setHeader("Cache-Control", "public, max-age=31536000");
    }
}));

const port = 8888;
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

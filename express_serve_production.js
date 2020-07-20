const path = require('path');
const express = require("express");
const expressStaticGzip = require("express-static-gzip");

const port = 80;
const host = '0.0.0.0';
const app = express();

app.use(expressStaticGzip('./build', {
    enableBrotli: true,
    orderPreference: ['br', 'gz'],
    setHeaders: function (res, path) {
        res.setHeader("Cache-Control", "public, max-age=31536000");
    }
}));

app.listen(
    port, host,
    () => console.log(`Example app listening at http://${host}:${port}`)
);

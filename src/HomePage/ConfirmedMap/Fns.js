/**
This file is licensed under the MIT license

Copyright (c) 2020 David Morrissey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

var fns = {
    /*******************************************************************
     * Array helper functions
     *******************************************************************/

    /**
     * Return the keys in `o`, sorting (case-sensitive)
     *
     * @param o
     * @returns {[]}
     */
    sortedKeys: function(o) {
        //
        var r = [];
        for (var k in o) {
            if (!o.hasOwnProperty(k)) {
                continue;
            }
            r.push(k);
        }
        r.sort();
        return r
    },

    /*******************************************************************
     * String functions
     *******************************************************************/

    /**
     * Convert to Title Case
     *
     * @param str
     * @returns {*}
     */
    toTitleCase: function(str) {
        // From https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    },

    /**
     *
     * @param numSteps
     * @param rgba1
     * @param rgba2
     */
    colorStep: function(numSteps, rgba1, rgba2) {
        for (let i=0; i<numSteps; i++) {

        }
    }
};

export default fns;

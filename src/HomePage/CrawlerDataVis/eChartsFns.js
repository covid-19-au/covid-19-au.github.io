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

const fns = {
    /**
     *
     * @param series
     */
    toPercentiles: function (series) {
        let totalsByXVals = {},
            allNames = new Set();

        // Go thru each item to get totals
        for (let seriesItem of series) {
            for (let [x, y] of seriesItem.data) {
                // x -> date
                // y -> value
                if (!(x in totalsByXVals)) {
                    totalsByXVals[x] = 0;
                }
                totalsByXVals[x] += y;
            }

            // Name -> region name/infection source/age range/...
            allNames.add(seriesItem.name);
        }

        // Sort by oldest first
        for (let seriesItem of series) {
            seriesItem.data.sort((a, b) => {
                return b[0] - a[0]
            });
        }

        // Make into percentiles
        for (let seriesItem of series) {
            for (let x = 0; x < seriesItem.data.length; x++) {
                seriesItem.data[x][1] = (
                    parseFloat((seriesItem.data[x][1] / totalsByXVals[seriesItem.data[x][0]] * 100).toFixed(1))
                );
            }
        }
    },

    getMaximumCombinedValue: function (series) {
        function roundUp(v) {
            v = parseInt(v);
            let isNeg = v < 0;
            if (isNeg) v = -v;

            let r = Math.floor(
                parseInt((parseInt(String(v)[0]) + 1) + String(v).slice(1).split('').map(() => '0').join(''))
            );
            return isNeg ? -r : r
        }

        let r = {};

        for (let seriesItem of series) {
            for (let [x, y] of seriesItem.data) {
                if (!r[x]) {
                    r[x] = 0;
                }
                r[x] += y;
            }
        }

        let max = -99999999999999999;
        for (let k in r) {
            if (r[k] > max) {
                max = r[k];
            }
        }
        return roundUp(max);
    },

    /**
     *
     * @returns {string}
     */
    getBarHandleIcon: function () {
        return (
            'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,' +
            '9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,' +
            '11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
        );
    },

    /**
     *
     * @param params
     * @returns {*}
     */
    percentilesTooltip: function(params) {
        return params.map(param =>
            `<div style="border-bottom: 1px solid ${param.color}; border-left: 8px solid ${param.color}; padding-left: 3px;">` +
                `<span style="padding: 0; display: inline; margin: 0">` +
                    `${param.seriesName}&nbsp;&nbsp;` +
                    `<span style="float: right; padding: 0; display: inline; margin: 0">` +
                        `${param.value[1]}%` +
                    `</span>` +
                `</span>` +
            `</div>`
        ).reverse().join('');
    },

    /**
     *
     * @param params
     * @returns {*}
     */
    otherTooltip: function(params) {
        return params.map(param =>
            `<div style="border: solid ${param.color}; border-width: 0 0 1px 10px; padding-left: 3px;">` +
                `<span style="padding: 0; display: inline; margin: 0">` +
                    `${param.seriesName}&nbsp;&nbsp;` +
                    `<span style="float: right; padding: 0; display: inline; margin: 0">` +
                        `${param.value[1]} ` +
                        `<span style="font-weight: bold; color: ${param.color}; padding: 0; display: inline; margin: 0">` +
                            `▶` +
                        `</span>` +
                    `</span>` +
                `</span>` +
            `</div>`
        ).reverse().join('');
    }
};

export const toPercentiles = fns.toPercentiles;
export const getMaximumCombinedValue = fns.getMaximumCombinedValue;
export const getBarHandleIcon = fns.getBarHandleIcon;
export const percentilesTooltip = fns.percentilesTooltip;
export const otherTooltip = fns.otherTooltip;

export default fns;

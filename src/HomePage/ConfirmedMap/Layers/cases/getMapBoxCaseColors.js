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
import cm from "../../../../ColorManagement/ColorManagement";

/**
 *
 * @param fromColor
 * @param toColor
 * @param caseVals the sorted values of cases to allow for
 *                 median and other quantile calculations
 * @param quantiles [quantile, ...] where quantile is a value
 *                  between 0.0 and 1.0 in ascending order
 * @param minRange Takes preference over quantiles if highest
 *                 value less than this one so that very small
 *                 values don't get emphasized
 * @returns {(string|(string|string[])[]|(string|string[]|number)[]|*)[]}
 */
function getMapBoxCaseColors(
    fromColor, toColor,
    nullColor, maxColor,
    fromNegColor, toNegColor,
    caseVals, quantiles,
    minRange, showForZero
) {
    // Make sure we're using only positive values for relative comparisons
    // to make sure we don't have -1 being as bright as +1000 etc
    caseVals = caseVals.filter(i => i >= 0);

    if (!caseVals.length || minRange > caseVals[caseVals.length-1]) {
        caseVals = [];
        for (let i=0; i<minRange; i++) {
            caseVals.push((i/minRange)*minRange);
        }
    }

    let r = ['case'],
        totalCases = (quantiles.length - 1) || 1;

    // Special case for null values
    r.push(['==', ['get', 'cases'], null]);
    r.push(nullColor.toString());

    if (!showForZero) {
        r.push(['==', ['get', 'cases'], 0]);
        r.push(nullColor.toString());
    }

    // Emphasize the highest case value
    r.push(['==', ['get', 'cases'], caseVals[caseVals.length-1]]);
    r.push(maxColor.toString());

    __extendForColorRange(
        r, quantiles, totalCases, caseVals, toNegColor, fromNegColor, true
    );

    // SPECIAL CASE: Because we're using the quantiles from the positive
    // values for the negative, it's possible to miss -1 (or lower negatives)
    r.push(['<=', ['get', 'cases'], -1]);
    r.push(fromNegColor.toString());

    __extendForColorRange(
        r, quantiles, totalCases, caseVals, fromColor, toColor, false
    );

    r.push(['<', ['get', 'cases'], caseVals[caseVals.length-1]]);
    r.push(toColor.toString());

    // Fallback to this value if nothing else matches
    r.push(nullColor.toString());

    //console.log(JSON.stringify(r));
    return r;
}

/**
 *
 * @param r
 * @param quantiles
 * @param totalCases
 * @param caseVals
 * @param fromColor
 * @param toColor
 * @param negateVals
 * @private
 */
function __extendForColorRange(r, quantiles, totalCases, caseVals, fromColor, toColor, negateVals) {
    let x = 0;

    if (negateVals) {
        caseVals = JSON.parse(JSON.stringify(caseVals));
        caseVals.reverse();
    }

    for (let quantile of quantiles) {
        x++;
        let pc = x / quantiles.length;
        let val = caseVals[Math.round(quantile*(caseVals.length-1))];
        if (negateVals) {
            val = -val;
        }

        if (negateVals) {
            // Special case to make sure 0 isn't displayed as negative
            r.push(['<', ['get', 'cases'], val]);
        } else {
            r.push(['<=', ['get', 'cases'], val]);
        }

        r.push(cm.blendColors(fromColor, toColor, pc).toString());
    }
}

export default getMapBoxCaseColors;

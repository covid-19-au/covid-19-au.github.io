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
    fromColor, toColor, nullColor,
    fromNegColor, toNegColor,
    caseVals, quantiles,
    minRange
) {
    // Make sure we're using only positive values for relative comparisons
    // to make sure we don't have -1 being as bright as +1000 etc
    let newCaseVals = [];
    caseVals.forEach(i => i >= 0 ? newCaseVals.push(i) : '');
    caseVals = newCaseVals;

    if (minRange > caseVals[caseVals.length-1]) {
        caseVals = [];
        for (let i=0; i<minRange; i++) {
            caseVals.push((i/minRange)*minRange);
        }
    }

    let r = ['case'],
        totalCases = (quantiles.length - 1) || 1;

    r.push(['==', ['get', 'cases'], null]);
    r.push(nullColor);

    __extendForColorRange(
        r, quantiles, totalCases, caseVals, fromNegColor, toNegColor, true
    );
    __extendForColorRange(
        r, quantiles, totalCases, caseVals, fromColor, toColor, false
    );

    // Fallback to this value if nothing else matches
    r.push(nullColor);
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
        let pc = x / totalCases;
        let val = caseVals[Math.round(quantile*(caseVals.length-1))];
        if (negateVals) {
            val = -val;
        }

        r.push(['<=', ['get', 'cases'], val]);
        r.push(`rgba(
            ${Math.round(fromColor[0]*(1.0-pc)+toColor[0]*pc)}, 
            ${Math.round(fromColor[1]*(1.0-pc)+toColor[1]*pc)}, 
            ${Math.round(fromColor[2]*(1.0-pc)+toColor[2]*pc)},
            ${fromColor[3]*(1.0-pc)+toColor[3]*pc}
        )`)
    }
}

export default getMapBoxCaseColors;

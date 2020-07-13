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
    caseVals, staticVals, quantiles,
    minRange
) {
    // TODO: Add handling for negative values!!!! =====================================================================

    if (minRange > caseVals[caseVals.length-1]) {
        caseVals = [];
        for (let i=0; i<minRange; i++) {
            caseVals.push((i/minRange)*minRange);
        }
    }

    let r = ['case'],
        totalCases = (staticVals.length + quantiles.length - 1) || 1,
        x = 0;

    r.push(['==', ['get', 'cases'], null]);
    r.push(nullColor);

    for (let staticVal of staticVals) {
        x++;
        let pc = x / totalCases;

        r.push(['<=', ['get', 'cases'], staticVal]);
        r.push(`rgba(
            ${Math.round(fromColor[0]*(1.0-pc)+toColor[0]*pc)}, 
            ${Math.round(fromColor[1]*(1.0-pc)+toColor[1]*pc)}, 
            ${Math.round(fromColor[2]*(1.0-pc)+toColor[2]*pc)},
            ${fromColor[3]*(1.0-pc)+toColor[3]*pc}
        )`)
    }

    for (let quantile of quantiles) {
        x++;
        let pc = x / totalCases;
        let val = caseVals[Math.round(quantile*(caseVals.length-1))];

        r.push(['<=', ['get', 'cases'], val]);
        r.push(`rgba(
            ${Math.round(fromColor[0]*(1.0-pc)+toColor[0]*pc)}, 
            ${Math.round(fromColor[1]*(1.0-pc)+toColor[1]*pc)}, 
            ${Math.round(fromColor[2]*(1.0-pc)+toColor[2]*pc)},
            ${fromColor[3]*(1.0-pc)+toColor[3]*pc}
        )`)
    }

    // Fallback to this value if nothing else matches
    r.push(nullColor);
    console.log(JSON.stringify(r));
    return r;
}

export default getMapBoxCaseColors;

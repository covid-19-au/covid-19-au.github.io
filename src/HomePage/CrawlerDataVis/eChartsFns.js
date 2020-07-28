/**
 *
 * @param series
 */
export function toPercentiles(series) {
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
        seriesItem.data.sort((a, b) => {return b[0] - a[0]});
    }

    // Make into percentiles
    for (let seriesItem of series) {
        for (let x = 0; x < seriesItem.data.length; x++) {
            seriesItem.data[x][1] = (
                seriesItem.data[x][1] / totalsByXVals[seriesItem.data[x][0]] * 100
            );
        }
    }
}

export function getMaximumCombinedValue(series) {
    function roundUp(v) {
        v = parseInt(v);
        let isNeg = v < 0;
        if (isNeg) v = -v;

        let r = Math.floor(
            parseInt((parseInt(String(v)[0])+1) + String(v).slice(1).split('').map(() => '0').join(''))
        );
        return isNeg ? -r : r
    }

    let r = {};

    for (let seriesItem of series) {
        for (let [x, y] of seriesItem.data) {
            if (!r[x]) {
                r[x] = 0;
            } r[x] += y;
        }
    }

    let max = -99999999999999999;
    for (let k in r) {
        if (r[k] > max) {
            max = r[k];
        }
    }
    return roundUp(max);
}

/**
 *
 * @returns {string}
 */
export function getBarHandleIcon() {
    return (
        'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,' +
        '9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,' +
        '11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z'
    );
}

export default {
    toPercentiles,
    getBarHandleIcon,
    getMaximumCombinedValue
};

function getLastDaysRangeOfSample(data, days) {
    if (!data) return null;
    else if (!data[0]) return null;

    let highest;

    for (let iData of data) {
        let x = iData.x;
        if (!highest || x[x.length-1] > highest) {
            highest = x[x.length-1];
        }
    }

    if (highest) {
        return [
            highest.daysSubtracted(days+1),
            highest.daysAdded(1)
        ];
    }
}

export default getLastDaysRangeOfSample;

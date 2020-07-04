function getMapBoxCaseColors(caseVals, colorList) {
    let circleColor;

    if (caseVals[caseVals.length-1] <= 4) {
        circleColor = [
            'step',
            ['get', 'cases'],
                 colorList[0],
            0,   colorList[1],
            1,   colorList[2],
            5,   colorList[3],
            50,  colorList[4],
            100, colorList[5],
            300, colorList[6],
            500, colorList[7]
        ];
    } else {
        let vals = [
            5,
            caseVals[Math.round(caseVals.length*0.25)],
            caseVals[Math.round(caseVals.length*0.5)],
            caseVals[Math.round(caseVals.length*0.75)],
            caseVals[caseVals.length-1]
        ];

        // mapbox needs ints in ascending order,
        // so make sure each is higher than the last
        for (let i=1; i<vals.length; i++) {
            while (vals[i] <= vals[i-1])
                vals[i]++;
        }

        circleColor = [
            'step',
            ['get', 'cases'],
            colorList[0],
            0, colorList[1],
            1, colorList[2],
            5, colorList[3],
            vals[1], colorList[4],
            vals[2], colorList[5],
            vals[3], colorList[6],
            vals[4], colorList[7]
        ];
    }

    return circleColor;
}

export default getMapBoxCaseColors;

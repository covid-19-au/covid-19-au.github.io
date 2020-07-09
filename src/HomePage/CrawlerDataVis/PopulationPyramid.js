// You can reproduce this figure in plotly.js with the following code!

// Learn more about plotly.js here: https://plotly.com/javascript/getting-started

/* Here's an example minimal HTML template
 *
 * <!DOCTYPE html>
 *   <head>
 *     <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
 *   </head>
 *   <body>
 *   <!-- Plotly chart will be drawn inside this div -->
 *   <div id="plotly-div"></div>
 *     <script>
 *     // JAVASCRIPT CODE GOES HERE
 *     </script>
 *   </body>
 * </html>
 */


import React from 'react';
import Plot from 'react-plotly.js';


class PopulationPyramid extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <Plot
                data={this.state.data||[]}
                layout={{
                    xaxis: {
                        title: {
                            text: 'Number'
                        },
                        showgrid: true,
                        gridcolor: '#999',
                    },
                    yaxis: {
                        title: {
                            text: 'Age'
                        },
                        type: 'category'
                    },
                    bargap: 0.1,
                    barmode: 'relative',
                    autosize: true
                }}
                style={{
                    'font-size': '15px'
                }}
            />
        );
    }

    setCasesInst(maleCasesInst, femaleCasesInst, regionType) {
        let maleXVals = [],
            maleYVals = [],
            femaleXVals = [],
            femaleYVals = [];

        for (let ageRange of maleCasesInst.getAgeRanges(regionType)) {
            maleYVals.push(ageRange);
            maleXVals.push(maleCasesInst.getCaseNumber(regionType, ageRange).getValue());
        }

        for (let ageRange of femaleCasesInst.getAgeRanges(regionType)) {
            femaleYVals.push(ageRange);
            femaleXVals.push(femaleCasesInst.getCaseNumber(regionType, ageRange).getValue());
        }

        let maleData = {
            meta: {
                columnNames: {
                    x: 'Men, x',
                    y: 'Men, y; Women, y'
                }
            },
            name: 'Men',
            type: 'bar',
            x: maleXVals,
            y: maleYVals,
            marker: {
                color: 'powderblue'
            },
            text: maleXVals,
            hoverinfo: 'x',
            orientation: 'h'
        };

        let femaleData = {
            meta: {
                columnNames: {
                    x: 'Women, x',
                    y: 'Men, y; Women, y',
                    text: 'text'
                }
            },
            name: 'Women',
            type: 'bar',
            x: femaleXVals.map(i => -i),
            y: femaleYVals,
            marker: {
                color: 'seagreen'
            },
            text: femaleXVals,
            hoverinfo: 'text',
            orientation: 'h'
        };

        let data = [
            maleData,
            femaleData
        ];

        this.setState({
            data: data
        });
    }
}

export default PopulationPyramid;

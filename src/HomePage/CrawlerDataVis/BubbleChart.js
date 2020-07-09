import React from 'react';
import Plot from 'react-plotly.js';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";


class BubbleChart extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <div>
                <Paper>
                    <Tabs
                    value={'active'}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, newValue) => this.FIXME(newValue)}
                    ref={(el) => this.visTabs = el}
                    centered
                    >
                        <Tab label="By Active" value="active" />
                        <Tab label="Alphabetical" value="alpha" />
                    </Tabs>
                </Paper>

                <Plot
                    data={this.state.data||[]}
                    layout={ {
                        //width: '100%',
                        height: 1200,
                        margin: {
                            r: 10,
                            b: 10,
                            t: 30,
                            pad: 0
                        },
                        showlegend: false,
                        hovermode: "closest",
                        autosize: true,
                        xaxis: {
                            side: 'top',
                            showgrid: true,
                            gridcolor: '#ddd'
                        },
                        yaxis: {
                            showgrid: true,
                            gridcolor: '#999',
                            tickangle: 45
                        }
                    } }
                    config = {{
                        displayModeBar: false,
                        responsive: true
                    }}
                    style={{
                        'font-size': '15px'
                    }}
                />
            </div>
        );
    }

    setCasesInst(casesInst, numDays) {
        this.__casesInst = casesInst;

        let data = [];
        var x = -1;

        for (let regionType of casesInst.getRegionChildren()) {
            x++;

            let xVals = [],
                yVals = [];

            for (let timeSeriesItem of casesInst.getCaseNumberTimeSeries(regionType, null)||[]) {
                xVals.push(timeSeriesItem.getDateType());
                yVals.push(timeSeriesItem.getValue());
            }
            if (!yVals.length) {
                continue;
            }

            data.push([
                yVals[yVals.length-1],
                {
                    name: regionType.getLocalized(),
                    mode: 'markers',
                    x: xVals,
                    y: xVals.map((item) => regionType.getLocalized()),
                    text: yVals,
                    hovertemplate: "%{x}: <b>%{text}</b>",
                    marker: {
                        size: yVals.map(i => Math.log(i+2)*5),
                        color: yVals.map(i => Math.log(i+2)*5),
                        symbol: "diamond"
                    }
                }
            ]);
        }
        data.sort((a, b) => a[0] - b[0]);

        this.setState({
            data: data.map(a => a[1])
        });
    }
}

export default BubbleChart;

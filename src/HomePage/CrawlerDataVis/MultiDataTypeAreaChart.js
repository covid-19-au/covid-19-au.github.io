import React from 'react';
import Plot from 'react-plotly.js';
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";


class MultiDataTypeAreaChart extends React.Component {
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
                        <Tab label="Default" value="active" />
                        <Tab label="% Percentiles" value="alpha" />
                    </Tabs>
                </Paper>

                <Plot
                    data={this.state.data||[]}
                    layout={ {
                        //width: '100%',
                        height: 500,
                        margin: {
                            l: 30,
                            r: 10,
                            b: 20,
                            t: 10,
                            pad: 0
                        }
                    } }
                    style={{
                        'font-size': '15px'
                    }}
                />
            </div>
        );
    }

    setCasesInst(casesInsts, regionType) {
        let data = [];

        for (let casesInst of casesInsts) {
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
                    name: casesInst.dataType,
                    //type: 'area',
                    stackgroup: 'one',
                    x: xVals,
                    y: yVals
                }
            ]);
        }
        data.sort((a, b) => a[0] - b[0]);

        this.setState({
            data: data.map(a => a[1])
        });
    }
}

export default MultiDataTypeAreaChart;

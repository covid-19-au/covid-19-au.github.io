import React from 'react';
import Plot from 'react-plotly.js';


class TreeMap extends React.Component {
    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <Plot
                data={[{
                    type: 'treemap',
                    values: this.state.values||[],
                    labels: this.state.labels||[],
                    parents: this.state.parents||[],
                    marker: {colorscale: 'Blues'}
                }]}
                layout={ {
                    //width: '100%',
                    height: 500,
                    margin: {
                        l: 10,
                        r: 10,
                        b: 10,
                        t: 10,
                        pad: 0
                    }
                } }
                style={{
                    'font-size': '15px'
                }}
            />
        );
    }

    setCasesInst(casesInst, numDays) {
        this.__casesInst = casesInst;

        let values = [],
            labels = [],
            parents = [];

        for (let regionType of casesInst.getRegionChildren()) {
            labels.push(regionType.prettified());
            if (numDays) {
                values.push(casesInst.getCaseNumberOverNumDays(regionType, null, numDays).getValue());
            } else {
                values.push(casesInst.getCaseNumber(regionType, null).getValue());
            }
            parents.push("");
        }

        this.setState({
            values: values,
            labels: labels,
            parents: parents
        });
    }
}

export default TreeMap;

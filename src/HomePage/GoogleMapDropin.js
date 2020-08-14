import React from 'react'
import statesSVG from "../statesSVG";


class GoogleMapDropin extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        this.maxVal = this.getMaxVal();
        let [color1, color2, color3, color4] =
            this.props.options.colorAxis.colors;

        return (
            <>
                <div style={{width: "200px", margin: "0 auto"}}>
                    <svg width={200}
                         height={200}
                         preserveAspectRatio="none"
                         viewBox="220 30 330 320"
                         style={{margin: "10px auto"}}>
                        <g>
                            {(() => {
                                let out = [];
                                for (let dataItem of this.props.data.slice(1)) {
                                    let elm = React.cloneElement(statesSVG[dataItem[0].f], {
                                        fill: this.numToColor(dataItem[1])
                                    }, <title>{dataItem[2] || `${dataItem[0].f}\n${this.props.data[0][1]}: ${dataItem[1]}`}</title>);
                                    out.push(elm);
                                }
                                return out;
                            })()}
                        </g>
                    </svg>
                </div>
                <div style={{
                    marginBottom: "15px",
                    marginTop: "10px"
                }}>
                    <div style={{
                        display: "inline-block",
                        paddingRight: "8px",
                        width: "25px",
                        textAlign: "right",
                        verticalAlign: "middle"
                    }}>
                        0
                    </div>
                    <div style={{
                        display: "inline-block",
                        width: "200px",
                        height: "10px",
                        verticalAlign: "middle",
                        background: `linear-gradient(to right, ${color1}, ${color2}, ${color3}, ${color4})`
                    }} />
                    <div style={{
                        display: "inline-block",
                        paddingLeft: "8px",
                        width: "100px",
                        textAlign: "left",
                        verticalAlign: "middle"
                    }}>
                        {this.maxVal}
                    </div>
                </div>
            </>
        )
    }

    getMaxVal() {
        let maxVal = 0;
        for (let dataItem of this.props.data.slice(1)) {
            if (dataItem[1] > maxVal) {
                maxVal = dataItem[1];
            }
        }
        return maxVal;
    }

    numToColor(num) {
        let [color1, color2, color3, color4] =
            this.props.options.colorAxis.colors;

        let quantiles = [
            [this.getColor(color1), 0],
            [this.getColor(color2), this.maxVal*0.33],
            [this.getColor(color3), this.maxVal*0.66],
            [this.getColor(color4), this.maxVal]
        ];

        for (let i=1; i<quantiles.length; i++) {
            let [prevColor, prevValue] = quantiles[i-1],
                [currentColor, currentValue] = quantiles[i];

            if (num <= currentValue) {
                num -= prevValue;
                currentValue -= prevValue;

                let elapsed = num/currentValue;
                return (`rgb(` +
                    `${Math.round(prevColor[0]*(1.0-elapsed)+currentColor[0]*elapsed)},` +
                    `${Math.round(prevColor[1]*(1.0-elapsed)+currentColor[1]*elapsed)},` +
                    `${Math.round(prevColor[2]*(1.0-elapsed)+currentColor[2]*elapsed)}` +
                `)`);
            }
        }
        //console.log(`NO MATCH: ${this.maxVal} ${JSON.stringify(quantiles)} ${num}`)
    }

    getColor(color) {
        let r = parseInt(color.slice(1, 3), 16),
            g = parseInt(color.slice(3, 5), 16),
            b = parseInt(color.slice(5, 7), 16);
        return [r, g, b];
    }
}

export default GoogleMapDropin;
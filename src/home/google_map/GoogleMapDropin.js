import React from 'react'
import statesSVG from "../../states/statesSVG";
import ReactTooltip from "react-tooltip";


class GoogleMapDropin extends React.Component {
    constructor(props) {
        super(props);
        this.statePathElmRefs = {};
    }

    render() {
        this.maxVal = this.getMaxVal();
        let [color1, color2, color3, color4] =
            this.props.options.colorAxis.colors;

        return (
            <>
                <div style={{width: "220px", margin: "0 auto"}}>
                    <svg width={220}
                         height={220}
                         preserveAspectRatio="none"
                         viewBox="220 30 330 320"
                         style={{margin: "10px auto 3px auto"}}>
                        <g>
                            {(() => {
                                let out = [];
                                for (let dataItem of this.props.data.slice(1)) {
                                    let ref = React.createRef();
                                    this.statePathElmRefs[dataItem[0].f] = ref;

                                    let elm = React.cloneElement(statesSVG[dataItem[0].f], {
                                        ref: ref,
                                        fill: this.numToColor(dataItem[1]),
                                        onMouseOver: () => this.onStateMouseOver(ref, dataItem[1]),
                                        onMouseOut: () => this.onStateMouseOut(ref),
                                        "data-tip": "",
                                        "data-for": dataItem[0].f
                                    });

                                    out.push(elm);
                                }
                                return out;
                            })()}
                        </g>
                    </svg>

                    {(() => {
                        let out = [];
                        for (let dataItem of this.props.data.slice(1)) {
                            out.push(
                                <ReactTooltip id={dataItem[0].f}>
                                    { dataItem[2] || <>
                                        <div style={{fontSize: "1.2em", textAlign: "center"}}>{dataItem[0].f}</div>
                                        <div style={{fontSize: "1.2em"}}>{this.props.data[0][1]}: {dataItem[1]}</div>
                                    </> }
                                </ReactTooltip>
                            )
                        }
                        return out;
                    })()}
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
                        background: `linear-gradient(to right, ${color1}, ${color2}, ${color3}, ${color4})`,
                        position: "relative"
                    }}>
                        <div
                            ref={el => {this.triangleIndicator = el}}
                            style={{
                                display: "none",
                                width: 0,
                                height: 0,
                                borderLeft: "10px solid transparent",
                                borderRight: "10px solid transparent",
                                borderTop: "10px solid "+color4,
                                position: "absolute",
                                bottom: "15px",
                                left: "-10px"
                            }}
                        />
                    </div>
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
    componentDidUpdate(prevProps, prevState, snapshot) {
        ReactTooltip.rebuild();
    }

    onStateMouseOver(ref, value) {
        // Make sure the element is displayed first!
        let parentNode = ref.current.parentNode;
        parentNode.removeChild(ref.current);
        parentNode.appendChild(ref.current);

        ref.current.setAttribute("stroke", '#555');
        ref.current.setAttribute("stroke-width", '2px');
        ref.current.setAttribute("stroke-linecap", "round");

        this.triangleIndicator.style.left = Math.round(200*(value/this.maxVal))-10+'px';
        this.triangleIndicator.style.display = 'block';
    }

    onStateMouseOut(ref) {
        ref.current.setAttribute("stroke", '#e5ccd4');
        ref.current.setAttribute("stroke-width", '1px');
        ref.current.setAttribute("stroke-linecap", "butt");

        this.triangleIndicator.style.display = 'none';
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

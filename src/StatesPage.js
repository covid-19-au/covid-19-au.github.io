import React from "react";
import Button from "@material-ui/core/Button";
import statesSVG from "./statesSVG";
import cm from "./ColorManagement/ColorManagement";

let statesOrder = [
    "VIC",
    "NSW",
    "QLD",
    "SA",
    "WA",
    "ACT",
    "TAS",
    "NT"
];

class StatesPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const buttonStyles = {
            margin: "10px",
            backgroundColor: cm.getColorSchemeType() === cm.COLOR_SCHEME_LIGHT ?
                "white" : "black",
            variant: "outlined",
            textTransform: "none",
        };

        return (
            // STUB: Would be nice to have a selection using
            // material UI-themed elements or something here
            <div style={{
                width: '100%',
                maxWidth: '1200px',
                textAlign: "center",
                padding: "50px 0"
            }}>
                <h3 style={{marginBottom: "45px"}}>
                    Select a state or territory to see the statistics page
                </h3>

                {
                    statesOrder.map((stateName) =>
                        <Button href={"/state/"+stateName.toLowerCase()}
                                variant="outlined"
                                style={buttonStyles}>
                            <div>
                                <svg width={200}
                                     height={200}
                                     preserveAspectRatio="none"
                                     viewBox="220 30 330 320">
                                    <g>
                                        {(() => {
                                            let out = [];
                                            for (let key in statesSVG) {
                                                let elm = React.cloneElement(statesSVG[key], {
                                                    fill: "#EEE"
                                                });
                                                out.push(elm);
                                            }
                                            return out;
                                        })()}
                                        {React.cloneElement(statesSVG[stateName], {
                                            fill: cm.getCaseColorPositive(100)
                                        })}
                                    </g>
                                </svg>

                                <div style={{
                                    textAlign: "center",
                                    fontSize: "1.5em"
                                }}>
                                    { stateName }
                                </div>
                            </div>
                        </Button>
                    )
                }
            </div>
        );
    }
}

export default StatesPage;

import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import {Typography} from "@material-ui/core";
import React from "react";


class ByPopulationCheckBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div style={{
                margin: "0",
                textAlign: "right",
                marginBottom: "5px",
                display: this.state.visible ? 'block' : 'none'
            }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.byPopulation}
                            size="small"
                            onChange={() => {
                                this.setState({
                                    byPopulation: !this.state.byPopulation
                                });
                                if (this.props.onChange) {
                                    this.props.onChange(this.state.byPopulation);
                                }
                            }}
                            name="checkedB"
                            color="primary"
                            style={{
                                padding: 0,
                                paddingRight: "2px",
                                margin: 0
                            }}
                        />
                    }
                    label={
                        <Typography style={{
                            fontSize: "0.8em"
                        }}>By Population (Per Million)</Typography>
                    }
                    shrink={true}
                    style={{
                        padding: 0,
                        paddingRight: "2px",
                        margin: 0,
                        color: "grey"
                    }}
                />
            </div>
        );
    }

    setVisible(visible) {
        this.setState({ visible: visible });
    }

    getValue() {
        return this.state.visible ? this.state.byPopulation : false;
    }
}

export default ByPopulationCheckBox;

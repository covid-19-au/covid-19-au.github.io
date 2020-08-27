/**
This file is licensed under the MIT license

Copyright (c) 2020 David Morrissey

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import React from "react";
import getRemoteData from "../../../CrawlerData/RemoteData";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChartLine, faTable } from '@fortawesome/free-solid-svg-icons'



class DataTypeSelect extends React.Component {
    /**
     * A control that allows selecting the datatype and time period
     *
     * @param props
     */
    constructor(props) {
        super(props);

        let getRemoteDataLater = async () => {
            this.setState({
                remoteData: await getRemoteData()
            });
        };
        getRemoteDataLater();

        this.state = {
            timePeriod: props.timePeriod||null,
            dataType: props.dataType||'status_active',
            displayMode: 'caseNums',
            enabled: true
        };

        this.markersBGGroup = React.createRef();
        this.markersSelect = React.createRef();
        this.markersButtonGroup = React.createRef();
        this.schemaTypeCont = React.createRef();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        if (!this.state.remoteData) {
            return null;
        }

        const padding = '10px 6px';

        const activeStyles = {
            color: 'black',
            borderColor: '#8ccfff',
            paddingLeft: padding,
            paddingRight: padding,
            //padding: "0px 5px",
            zIndex: 10,
            outline: "none",
            textTransform: "none",
            flexGrow: 1,
        };
        const inactiveStyles = {
            color: 'grey',
            borderColor: '#e3f3ff',
            paddingLeft: padding,
            paddingRight: padding,
            //padding: "0px 5px",
            outline: "none",
            textTransform: "none",
            flexGrow: 1,
        };

        var getSelectOptions = () => {
            // TODO: Filter to
            var out = [];
            for (let [optGroupLabel, options] of this.state.remoteData.getConstantSelect()) {
                out.push(`<optgroup label="${optGroupLabel}">`);
                for (let [optionLabel, optionValue] of options) {
                    if (optionValue === this.state.dataType) {
                        out.push(`<option value="${optionValue}" selected>${optionLabel}</option>`);
                    } else {
                        out.push(`<option value="${optionValue}">${optionLabel}</option>`);
                    }
                }
                out.push(`</optgroup>`);
            }
            return out.join('\n');
        };

        return (
            <div ref={this.schemaTypeCont}
                 style={{ pointerEvents: this.state.enabled ? 'all' : 'none' }}>

                <div ref={this.markersBGGroup}
                    style={{ marginBottom: "8px", marginTop: '3px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px', display: 'none' }}>Markers</div>
                    <select ref={this.markersSelect}
                        style={{ "width": "100%" }}
                        onChange={() => {this._onMarkersChange(this.markersSelect.current.value)}}
                        dangerouslySetInnerHTML={ {__html: getSelectOptions()} } />
                </div>

                <div style={{ display: (
                    this.state.remoteData.getConstants()[this.state.dataType].timeperiods &&
                        this.state.displayMode !== 'trajectory'
                    ) ? 'block' : 'none' }}>

                    <span className="key" style={{ alignSelf: "flex-end", marginBottom: "5px", width: "100%" }}>
                        <ButtonGroup ref={this.markersButtonGroup}
                            size="small"
                            aria-label="small outlined button group"
                            style={{width: "100%"}}>
                            <Button style={this.state.timePeriod == null ? activeStyles : inactiveStyles}
                                onClick={() => this._onTimePeriodChange(null)}>All</Button>
                            <Button style={this.state.timePeriod === 7 ? activeStyles : inactiveStyles}
                                onClick={() => this._onTimePeriodChange(7)}>7 Days</Button>
                            <Button style={this.state.timePeriod === 21 ? activeStyles : inactiveStyles}
                                onClick={() => this._onTimePeriodChange(21)}>21 Days</Button>
                            <Button style={this.state.timePeriod === "graphs" ? activeStyles : inactiveStyles}
                                    onClick={() => this._onTimePeriodChange("graphs")}>
                                <div style={{padding: "0px 6px 0px 6px"}}>
                                    Rate of Change
                                </div>
                            </Button>
                        </ButtonGroup>
                    </span>
                </div>
            </div>
        );
    }

    _onDisplayModeChange(displayMode) {
        this.setState({
            displayMode: displayMode
        });
    }

    /**
     * Called when the datatype <select> is changed
     *
     * @param dataType
     * @private
     */
    _onMarkersChange(dataType) {
        this.setState({
            dataType: dataType
        });
    }

    /**
     * Called when the time period changes
     *
     * @param timePeriod null or an integer
     * @private
     */
    _onTimePeriodChange(timePeriod) {
        this.setState({
            timePeriod: timePeriod
        });
    }

    /**
     * Update state of covid map controls on change
     *
     * @param prevProps
     * @param prevState
     * @param snapshot
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.props.onchange(this.state.dataType, this.state.timePeriod);
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
    }

    /*******************************************************************
     * Enable/disable
     *******************************************************************/

    /**
     * Enable the time period/datatype select controls
     */
    enable() {
        this.setState({
            enabled: true
        });
    }

    /**
     * Disable the time period/datatype select controls
     */
    disable() {
        this.setState({
            enabled: false
        });
    }

    /*******************************************************************
     * Get value
     *******************************************************************/

    getDisplayGraphs() {
        return this.state.timePeriod === 'graphs';
    }

    /**
     *
     * @returns {*}
     */
    getDataType() {
        return this.state.dataType;
    }

    /**
     *
     * @returns {DataTypeSelect._onTimePeriodChange.props}
     */
    getTimePeriod() {
        if ((
                !this.state.remoteData ||
                this.state.remoteData.getConstants()[this.state.dataType].timeperiods // WARNING!!! ===============
            ) && this.state.timePeriod !== 'graphs'
        ) {
            return this.state.timePeriod;
        } else if (this.state.timePeriod === 'graphs') {
            return 7;  // HACK!
        } else {
            return null;
        }
    }
}

export default DataTypeSelect;

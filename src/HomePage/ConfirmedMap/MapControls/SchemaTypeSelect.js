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
import schemaTypes from "../../../data/caseData/schema_types.json"


class SchemaTypeSelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            _timeperiod: null,
            _markers: 'total',
            _enabled: true
        };

        this.markersBGGroup = React.createRef();
        this.markersSelect = React.createRef();
        this.markersButtonGroup = React.createRef();
        this.schemaTypeCont = React.createRef();
    }

    render() {
        const padding = '6px';

        const activeStyles = {
            color: 'black',
            borderColor: '#8ccfff',
            paddingLeft: padding,
            paddingRight: padding,
            //padding: "0px 5px",
            zIndex: 10,
            outline: "none",
            textTransform: "none"
        };
        const inactiveStyles = {
            color: 'grey',
            borderColor: '#e3f3ff',
            paddingLeft: padding,
            paddingRight: padding,
            //padding: "0px 5px",
            outline: "none",
            textTransform: "none"
        };

        var getSelectOptions = () => {
            // TODO: Filter to
            var out = [];
            for (let [optGroupLabel, options] of schemaTypes.constant_select) {
                out.push(`<optgroup label="${optGroupLabel}">`);
                for (let [optionLabel, optionValue] of options) {
                    out.push(`<option value="${optionValue}">${optionLabel}</option>`);
                }
                out.push(`</optgroup>`);
            }
            return out.join('\n');
        };

        return (
            <div ref={this.schemaTypeCont}
                 style={{ pointerEvents: this._enabled ? 'all' : 'none' }}>

                <div ref={this.markersBGGroup}
                    style={{ marginBottom: "8px" }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px' }}>Markers</div>
                    <select ref={this.markersSelect}
                        style={{ "width": "100%" }}>
                        { getSelectOptions() }
                    </select>
                </div>

                <div style={{ display: schemaTypes.constants[this._dataType].timeperiods ? 'block' : 'none' }}>
                    <span className="key" style={{ alignSelf: "flex-end", marginBottom: "5px" }}>
                        <ButtonGroup ref={this.markersButtonGroup}
                            size="small"
                            aria-label="small outlined button group">
                            <Button style={this.state._timeperiod === 'alltime' ? activeStyles : inactiveStyles}
                                onClick={() => this.setTimePeriod(null)}>All</Button>
                            <Button style={this.state._timeperiod === '7days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setTimePeriod(7)}>7 Days</Button>
                            <Button style={this.state._timeperiod === '14days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setTimePeriod(14)}>14 Days</Button>
                            <Button style={this.state._timeperiod === '21days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setTimePeriod(21)}>21 Days</Button>
                        </ButtonGroup>
                    </span>
                </div>
            </div>
        );
    }

    onMarkersChange(dataType) {
        this.setState({
            _dataType: dataType
        });
    }

    onTimePeriodChange(timePeriod) {
        this.setState({
            _timePeriod: timePeriod
        });
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {

    }

    disable() {
        this.setState({
            _enabled: false
        });
    }
    enable() {
        this.setState({
            _enabled: true
        });
    }

    //========================================================//
    //                   Get Select Options                   //
    //========================================================//

    /**
     *
     * @param covidGeoData
     * @param admin0InView
     * @param admin1InView
     * @returns {[]}
     */
    getPossibleMarkersSelectOptions(covidGeoData, admin0InView, admin1InView) {
        /*
        TODO: Get all the possible markers that can be displayed
          considering whether the admin0/admin1
         */
        /*
        var selOptionsOut = [];

        for (var [groupText, groupItems] of this.constantSelect) {
            var groupItemsOut = [];

            for (var [optionText, optionValue] of groupItems) {
                var found = false;
                for (var [regionSchema, regionParent] of regionTypes) {
                    if (this.caseData[regionSchema][regionParent][optionValue]) { // CHECK ME!!! ====================
                        found = true;
                        break;
                    }
                }
                if (found) {
                    groupItemsOut.push([optionText, optionValue]);
                }
            }
            selOptionsOut.push([groupText, groupItemsOut]);
        }
        return selOptionsOut;
        */
    }
}

export default SchemaTypeSelect;

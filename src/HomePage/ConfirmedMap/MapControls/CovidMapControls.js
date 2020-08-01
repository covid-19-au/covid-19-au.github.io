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

import React from "react"
import DataTypeSelect from "./DataTypeSelect";
import UnderlaySelect from "./UnderlaySelect";


class CovidMapControls extends React.Component {
    /**
     * A control that allows selecting the datatype and underlay
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.mapContControls = React.createRef();
        this.state = {};
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div className="map-cont-controls" ref={this.mapContControls}
                 style={{
                     pointerEvents: this.state.disabled ? 'none' : 'all ',
                     fontSize: '1.2em',
                     maxWidth: '14em'
                 }}>
                <div style={{
                    fontWeight: "bold",
                    fontSize: "0.8em",
                    marginLeft: "3px",
                    marginBottom: "-2px"
                }}>
                    Select Indicator <span style={{color: "gray"}}>⇊</span>
                </div>
                <DataTypeSelect ref={(el) => this.__dataTypeSelect = el}
                                onchange={(dataType, timePeriod) => this._onChangeType(dataType, timePeriod)}
                                dataType={this.props.dataType}
                                timePeriod={this.props.timePeriod}/>
                <div style={{display: 'none'}}>
                    <UnderlaySelect ref={(el) => this.__underlaySelect = el}
                                    onchange={(underlayCategory, underlay) => this._onChangeUnderlay(underlayCategory, underlay)}/>
                </div>
            </div>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.props.onchange({
            dataType: this.getDataType(),
            timePeriod: this.getTimePeriod(),
            underlay: this.getUnderlay()
        })
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {}

    /*******************************************************************
     * Events
     *******************************************************************/

    /**
     * Called when the DataTypeSelect changes
     *
     * @param dataType the new datatype
     * @param timePeriod the time period as an integer (or null)
     * @private
     */
    _onChangeType(dataType, timePeriod) {
        return this.componentDidUpdate();

        this.setState({
            dataType: dataType,
            timePeriod: timePeriod
        });
    }

    /**
     * Called when the underlay select changes
     *
     * @param underlayCategory the underlay category
     * @param underlay the underlay
     * @private
     */
    _onChangeUnderlay(underlayCategory, underlay) {
        return this.componentDidUpdate();

        this.setState({
            underlayCategory: underlayCategory,
            underlay: underlay
        });
    }

    /*******************************************************************
     * Get value
     *******************************************************************/

    /**
     *
     * @returns {*}
     */
    getDataType() {
        return this.__dataTypeSelect.getDataType();
    }

    /**
     *
     * @returns {DataTypeSelect._onTimePeriodChange.props}
     */
    getTimePeriod() {
        return this.__dataTypeSelect.getTimePeriod();
    }

    /**
     *
     * @returns {null|UnderlaySelect._onUnderlaySelect.props}
     */
    getUnderlay() {
        return this.__underlaySelect.getUnderlay();
    }

    /*******************************************************************
     * Enable/disable
     *******************************************************************/

    getDisabled() {
        return this.state.disabled;
    }

    /**
     * Enable all covid map controls
     */
    enable() {
        this.mapContControls.current.style.pointerEvents = 'all';
        this.state.disabled = false;

        //this.setState({
        //    disabled: false
        //});
    }

    /**
     * Disable all covid map controls
     */
    disable() {
        this.mapContControls.current.style.pointerEvents = 'none';
        this.state.disabled = true;

        //this.setState({
        //    disabled: true
        //});
    }
}

export default CovidMapControls;

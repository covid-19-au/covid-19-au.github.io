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
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div className="map-cont-controls" ref={this.mapContControls}
                 style={{ pointerEvents: this.disabled ? 'none' : 'all '}}>
                <DataTypeSelect onchange={this._onChangeType} />
                <UnderlaySelect onchange={this._onChangeUnderlay}/>
            </div>
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.props.onchange({
            dataType: this.state.type,
            timePeriod: this.state.timePeriod,
            underlay: this.state.underlay
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
        this.setState({
            underlayCategory: underlayCategory,
            underlay: underlay
        });
    }

    /*******************************************************************
     * Enable/disable
     *******************************************************************/

    /**
     * Enable all covid map controls
     */
    enable() {
        this.setState({
            disabled: false
        });
    }

    /**
     * Disable all covid map controls
     */
    disable() {
        this.setState({
            disabled: true
        });
    }
}

export default CovidMapControls;

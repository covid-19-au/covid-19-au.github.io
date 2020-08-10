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

import React from "react";

import DateType from "../../CrawlerDataTypes/DateType";


class MapTimeSlider extends React.Component {
    /**
     * A time slider which allows selecting
     * how many days before today (or today)
     *
     * @param props possible params:
     *              * numDays -> number of days you can go back by
     */
    constructor(props) {
        super(props);
        this.state = {
            maxDate: DateType.today()
        };
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <form className="map-slider-container"
                  ref={el => this.mapSliderCont = el}
                  style={{display: "flex"}}>
                <label className="map-slider-item"
                       style={{width: "6em", textAlign: "center"}}>Time&nbsp;slider:</label>
                <input className="map-slider-item"
                       ref={el => {this.mapSlider = el}}
                       style={{flexGrow: "1"}}
                       onChange={() => this.__onChange()}
                       type="range" step="1" min="0"
                       max={this.props.numDays||30}
                       defaultValue={this.props.numDays||30} />
                <label className="map-slider-item"
                       ref={el => {this.mapSliderLabel = el}}
                       style={{width: "3em", textAlign: "center"}}>{
                           new Date(this.state.maxDate).getDate()+'/'+
                           (new Date(this.state.maxDate).getMonth()+1)
                       }</label>
            </form>
        )
    }

    /**
     * Event for when the slider changes value
     *
     * @private
     */
    __onChange() {
        let newValue = this.getValue();

        if (!this.state.value || this.state.value.getTime() !== newValue) {
            this.setState({
                maxDate: newValue
            });
        }

        if (this.props.onChange) {
            this.props.onChange(newValue);
        }
    }

    /*******************************************************************
     * Hide/show
     *******************************************************************/

    /**
     * Hide this time slider control
     */
    hide() {
        this.mapSliderCont.style.display = 'none';
    }

    /**
     * Show this time slider control
     */
    show() {
        this.mapSliderCont.style.display = 'flex';
    }

    /*******************************************************************
     * Get value
     *******************************************************************/

    /**
     * Get the current value of the slider as a DateType
     *
     * @returns {DateType}
     */
    getValue() {
        let daysAgo = parseInt(this.mapSlider.max) - parseInt(this.mapSlider.value);
        return DateType.today().daysSubtracted(daysAgo);
    }
}

export default MapTimeSlider;

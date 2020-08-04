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
import mapboxgl from 'mapbox-gl'

import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import CovidMapControl from "./ConfirmedMap/CovidMapControl"
import UpdatedDatesDisplay from "./ConfirmedMap/MapControls/UpdatedDatesDisplay";

//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;


class ConfirmedMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.stateName = props.stateName || 'AU';

        this.stateUpdatedDates = []; // FIXME!!!
        this.accuracyWarning = React.createRef();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        return (
            <div>
                <div style={{position: 'relative'}}>
                    <CovidMapControl ref={el => this.covidMapControl = el}
                                     onGeoDataChanged={this.__onGeoDataChanged.bind(this)}
                                     dataType={this.props.dataType}
                                     timePeriod={this.props.timePeriod}
                                     height={this.props.height || "60vh"}>
                    </CovidMapControl>
                </div>

                <div ref={el => this.explanations = el} style={{
                    width: "100%",
                    pointerEvents: "none",
                    marginTop: '-20px',
                    zIndex: 5000,
                    background: "linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,255,255,0.9) 15%)"
                }}>
                    <span className="due">
                        <ul ref={this.accuracyWarning} style={{margin: '0px', padding: '5px 20px'}}>
                            <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>
                                <span style={{fontWeight: 'bold'}}>🔍&nbsp;Zoom in</span> for regional numbers.
                                Victoria and New South Wales have 📬&nbsp;postcode-level data at higher zoom levels.<br/>
                                * Note: postcode-level data for Victoria has only been provided for July 31st.<br/>
                                <b>🖱️&nbsp;Click</b> or <b>👆&nbsp;tap</b> regions for history over time.
                            </li>

                            <li style={{color: "#555", marginBottom: "2px", paddingBottom: "0px"}}>
                                The <input type="range" style={{width: "35px", height: "1em", pointerEvents: "none"}} /> <b>time slider</b>&nbsp;
                                selects the <i>current day</i>. The <i>n</i> days (7/14/21 days) controls show the <i>current day</i>'s
                                value minus the value <i>n</i> days before the <i>current day</i>. Negative numbers in this mode mean the
                                value is that amount less than it was that many days ago.
                            </li>

                            <li style={{color: '#555'}}>
                                <div style={{color: '#777', fontSize: '0.9em'}}>
                                    Regional data updated: <span ref={
                                        (el) => this.__updatedSpan = el
                                    }><UpdatedDatesDisplay ref={el => {this.__updatedDatesDisplay = el}}/></span>
                                </div>
                            </li>
                        </ul>
                    </span>
                </div>
            </div>
        );
    }

    /**
     *
     * @param geoDataInsts
     * @param caseDataInsts
     * @private
     */
    __onGeoDataChanged(geoDataInsts, caseDataInsts) {

        this.__geoDataInsts = geoDataInsts;
        this.__caseDataInsts = caseDataInsts;

        if (this.__updatedDatesDisplay) {
            this.__updatedDatesDisplay.setValue(geoDataInsts, caseDataInsts);
        }
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        //this.explanations.parentNode.removeChild(this.explanations);
        //this.covidMapControl.addToMapContainer(this.explanations);
        this.__restrictToISO_3166_2(this.stateName);
    }

    componentWillUnmount() {
    }

    /*******************************************************************
     * Events
     *******************************************************************/

    /**
     *
     * @param iso_3166_2
     * @private
     */
    __restrictToISO_3166_2(iso_3166_2) {
        this.setState({
            iso_3166_2_tabs: iso_3166_2
        });
        iso_3166_2 = iso_3166_2 === 'all' ? null : iso_3166_2;
        this.covidMapControl.setBoundsToRegion(iso_3166_2);
    }
}

export default ConfirmedMap;

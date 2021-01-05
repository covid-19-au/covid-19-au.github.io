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

import 'mapbox-gl/dist/mapbox-gl.css'
import '../home/ConfirmedMap.css'
import CovidMapControl from "../common/data_vis/ConfirmedMap/CovidMapControl"
import UpdatedDatesDisplay from "../common/data_vis/ConfirmedMap/MapControls/UpdatedDatesDisplay";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartLine} from "@fortawesome/free-solid-svg-icons";
import {faExclamationCircle} from "@fortawesome/free-solid-svg-icons";


class WorldMap extends React.Component {
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
                                     height={"75vh"}>
                    </CovidMapControl>
                </div>

                <div ref={el => this.explanations = el} style={{
                    width: "100%",
                    //pointerEvents: "none",
                    marginTop: '-20px',
                    zIndex: 5000
                }}>
                    <span className="due">
                        <ul ref={this.accuracyWarning} style={{margin: '0px', padding: '5px 20px'}}>
                            <li style={{marginBottom: '2px', paddingBottom: '0px'}}>
                                <FontAwesomeIcon icon={faExclamationCircle} /> <b>Note:</b> This page has data from
                                the <a href="https://github.com/mcyph/global_subnational_covid_data" style={{color: '#1277d3'}}>global-subnational-covid-data</a> project
                                which may contain errors or inconsistencies.
                            </li>

                            <li style={{marginBottom: '2px', paddingBottom: '0px'}}>
                                <span style={{fontWeight: 'bold'}}>🔍&nbsp;Zoom in</span> for regional numbers.
                                <b>🖱️&nbsp;Click</b> or <b>👆&nbsp;tap</b> regions for history over time.
                            </li>

                            <li style={{marginBottom: "2px", paddingBottom: "0px"}}>
                                The <input type="range" style={{width: "35px", height: "1em", pointerEvents: "none"}} /> <b>time slider</b>&nbsp;
                                selects the <i>current day</i>. The 7/21 days controls show the current day's
                                value minus the value 7 or 21 days before the current day. Negative numbers in this mode mean the
                                value is that amount less than it was that many days ago.<br/>

                                The <FontAwesomeIcon icon={faChartLine} />&nbsp;<b>Rate of Change</b> control
                                graphs the exponential <a href="https://en.wikipedia.org/wiki/Rate_(mathematics)#Of_change">change in growth</a> for
                                each region over 50 days. If the cases plot goes above the dotted line, the number of people infected will keep
                                increasing at an exponential rate. If they're below the dotted line, then things will get under control over
                                time as less people are infected than were in the past.
                            </li>

                            <li>
                                <div style={{fontSize: '0.9em'}}>
                                    World data updated: <span ref={
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

export default WorldMap;

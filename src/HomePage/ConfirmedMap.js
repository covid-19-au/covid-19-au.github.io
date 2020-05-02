import React from "react";
import mapboxgl from 'mapbox-gl';
import confirmedData from "../data/mapdataCon"
import hospitalData from "../data/mapdataHos"

import regionsTimeSeries from "../data/regionsTimeSeriesAutogen.json"
import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import confirmedImg from '../img/icon/confirmed-recent.png'
import confirmedOldImg from '../img/icon/confirmed-old.png'
import hospitalImg from '../img/icon/hospital.png'
import Acknowledgement from "../Acknowledgment"
import absStatsData from "../data/absStats";

import ConfirmedMapFns from "./ConfirmedMapFns"
import TimeSeriesDataSource from "./ConfirmedMapCaseData"
import BigTableOValuesDataSource from "./ConfirmedMapABSData"
import GeoBoundaries from "./ConfirmedMapGeoBoundaries" // FIXME!
import ConfirmedMarker from "./ConfirmedMapConfirmedMarker"
import HospitalMarker from "./ConfirmedMapHospitalMarker"


const absStats = absStatsData['data'];

//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;


class MbMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lng: 133.751567,
            lat: -26.344589,
            zoom: 2,
            showMarker: true,
        };

        this._markers = 'Total';
        this._underlay = null;
        this._firstTime = true;

        this.markersBGGroup = React.createRef();
        this.underlayBGCont = React.createRef();

        this.hospitalMessage = React.createRef();
        this.totalCasesMessage = React.createRef();
        this.cityLevelMessage = React.createRef();
        this.activeCasesMessage = React.createRef();
        this.accuracyWarning = React.createRef();

        this.statesAndTerritories = [
            'act', 'nsw', 'vic', 'tas', 'wa', 'nt', 'qld', 'sa'
        ];
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    _getSelectHTML() {
        function outputSelects(heading) {
            return absStats[heading]['sub_headers'].map((key) => {
                return '<option value="' + key + '">' + key + '</option>'
            }).join('\n')
        }
        return ConfirmedMapFns.sortedKeys(absStats).map((heading) => {
            return (
                '<optgroup label=' + heading + '>' +
                outputSelects(heading) +
                '</optgroup>'
            );
        }).join('\n')
    }

    render() {
        const activeStyles = {
            color: 'black',
            borderColor: '#8ccfff',
            padding: "0px 5px",
            zIndex: 10,
            outline: "none",
            textTransform: "none"
        };
        const inactiveStyles = {
            color: 'grey',
            borderColor: '#e3f3ff',
            padding: "0px 5px",
            outline: "none",
            textTransform: "none"
        };

        return (
            <div className="card" style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ display: "flex" }}
                    aria-label="Hospital and Case Map">Hospital & Case Map<div style={{
                        alignSelf: "flex-end",
                        marginLeft: "auto",
                        fontSize: "60%"
                    }}>
                        <Acknowledgement>
                        </Acknowledgement></div></h2>

                <div ref={this.markersBGGroup}
                    className="key"
                    style={{ marginBottom: "0.8rem" }}>
                    Markers:&nbsp;<select id="markers_select"
                        style={{ "maxWidth": "100%" }}>
                        <optgroup label="Basic Numbers">
                            <option value="total">Total</option>
                            <option value="active">Active</option>
                            <option value="recovered">Recovered</option>
                            <option value="deaths">Deaths</option>
                            <option value="icu">ICU</option>
                            {/*<option value="icu_ventilators">ICU Ventilators</option>*/}
                            <option value="hospitalized">Hospitalized</option>
                        </optgroup>
                        <optgroup label="Test Numbers">
                            <option value="tests_total">Total People Tested</option>
                        </optgroup>
                        <optgroup label="Source of Infection">
                            <option value="overseas">Contracted Overseas</option>
                            <option value="community">Unknown Community Transmission</option>
                            <option value="confirmed">Contracted from Confirmed Case</option>
                            <option value="interstate">Contracted Interstate</option>
                            <option value="under_investigation">Under Investigation</option>
                        </optgroup>
                    </select>
                </div>

                <div ref={this.underlayBGCont}
                    className="key"
                    style={{ marginBottom: "0.8rem" }}>
                    Underlay:&nbsp;<select id="other_stats_select"
                        style={{ "maxWidth": "100%" }}>
                    </select>
                </div>

                <div ref={el => this.mapContainer = el} >
                    {/*{*/}
                    {/*confirmedData.map((item)=>(*/}
                    {/*<div style={activityStyle}>*/}

                    {/*</div>*/}
                    {/*))*/}
                    {/*}*/}
                </div>

                <span className="due">
                    <div ref={this.hospitalMessage}
                        style={{ display: 'none' }}>
                        <span className="key"><img src={hospitalImg} /><p>Hospital or COVID-19 assessment centre</p></span>
                    </div>
                    <div ref={this.totalCasesMessage}>
                        <span className="key"><img src={confirmedOldImg} /><p>Case over {ConfirmedMarker.oldCaseDays} days old</p></span>
                        <span className="key"><img src={confirmedImg} /><p>Recently confirmed case(not all, collecting)</p></span>
                    </div>
                    <div ref={this.cityLevelMessage}>
                        <span className="Key">
                            <p>*City-level data is only present for <strong>ACT</strong>, <strong>NSW</strong>,
                                <strong>VIC</strong>, and <strong>WA</strong>, HHS Data for <strong>QLD</strong>.
                                Other states are being worked on.</p>
                        </span>
                    </div>
                    <div ref={this.activeCasesMessage}
                        style={{ display: 'none' }}>
                        <span className="Key">
                            <p>*Active cases data has currently only been added for Queensland.</p>
                        </span>
                    </div>
                    <div ref={this.accuracyWarning}>
                        <p style={{ color: 'red' }}>*Cases on map are approximate and
                            identify regions only, not specific addresses.</p>
                    </div>
                </span>
            </div>
        );
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        const { lng, lat, zoom } = this.state;

        var bounds = [
            [101.6015625, -49.83798245308484], // Southwest coordinates
            [166.2890625, 0.8788717828324276] // Northeast coordinates
        ];

        const map = this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [lng, lat],
            zoom: zoom,
            maxZoom: 9,
            maxBounds: bounds // Sets bounds as max
        });

        // Set the HTML *once only*!
        document.getElementById('other_stats_select').innerHTML =
            this._getSelectHTML();

        // Disable map rotation
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        // Add geolocate control to the map.
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );

        //Add zoom+fullscreen controls
        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.FullscreenControl());

        // Add markers: confirmed cases/hospitals
        // only for tas/nt at this point
        var confirmedMarkers = this.confirmedMarkers = [];
        confirmedData.forEach((item) => {
            if (!(['VIC', 'NSW', 'QLD', 'WA', 'ACT'].includes(item['state']))) {
                confirmedMarkers.push(
                    new ConfirmedMarker(map, item)
                );
            }
        });
        this.hospitalMarkers = hospitalData.map((item) => {
            return new HospitalMarker(map, item);
        });

        var that = this;
        map.on('load', function () {
            (async () => {
                // Create case data instances
                var caseDataInsts = that.caseDataInsts = {};
                for (let key in regionsTimeSeries) {
                    // key => "statename:schema"
                    var d = caseDataInsts[key] = {};
                    var subheaders = regionsTimeSeries[key]['sub_headers']; // CHECK ME!
                    for (let subKey of subheaders) {
                        caseDataInsts[`${key}|${subKey}`] = new TimeSeriesDataSource(
                            key, subKey, regionsTimeSeries[key],
                            key.split(":")[1],
                            key.split(":")[0]
                        );
                    }
                }

                // Create ABS stat instances
                var absStatsInsts = that.absStatsInsts = {};
                for (var heading in absStats) {
                    var absStatHeading = absStats[heading];
                    for (var i = 0; i < absStatHeading['sub_headers'].length; i++) {
                        var subHeader = absStatHeading['sub_headers'][i];
                        absStatsInsts[subHeader] = new BigTableOValuesDataSource(
                            subHeader, heading, subHeader, absStatHeading
                        );
                    }
                }

                // Create map data instances
                var geoBoundaryInsts = that.geoBoundaryInsts = {};
                for (var key of GeoBoundaries.getAvailableGeoBoundaries()) {
                    geoBoundaryInsts[key] = GeoBoundaries.getGeoBoundary(
                        map, key.split(":")[1], key.split(":")[0]
                    );
                }

                function enableControls() {
                    // Only enable controls once all the data loaded!
                    var initialized = true;
                    for (let key in geoBoundaryInsts) {
                        if (!geoBoundaryInsts[key].initialized) {
                            initialized = false;
                            console.log(key)
                        }
                    }

                    if (initialized) {
                        that.setUnderlay();
                        that.setMarkers();

                        that.markersBGGroup.current.style.pointerEvents = 'auto';
                        that.underlayBGCont.current.style.pointerEvents = 'auto';

                        document.getElementById('other_stats_select').onchange = function () {
                            that.setUnderlay();
                        }
                        document.getElementById('markers_select').onchange = function () {
                            that.setMarkers();
                        }
                    }
                    else {
                        setTimeout(enableControls, 50);
                    }
                }
                setTimeout(enableControls, 50);
            })();
        });
    }

    /*******************************************************************
     * Mode update
     *******************************************************************/

    getCaseDataInst(stateName) {
        var schemas = [
            // In order of preference
            'postcode',
            'lga',
            'hhs',
            'ths',
            'lhd',
            'statewide'
        ];

        for (var schema of schemas) {
            var key = `${stateName}:${schema}|${this._markers}`;

            if (key in this.caseDataInsts) {
                return this.caseDataInsts[key];
            }
        }
        return null;
    }

    getGeoBoundariesInst(stateName, schema) {
        // TODO: allow for loading geojson/pbf on-demand!!
        return this.geoBoundaryInsts[`${stateName}:${schema}`];
    }

    setUnderlay(noSetState) {
        this._resetMode();
        this._underlay = document.getElementById(
            'other_stats_select'
        ).value;
        this._updateMode()
    }

    setMarkers() {
        this._resetMode();
        this._markers = document.getElementById(
            'markers_select'
        ).value;
        this._updateMode()
    }

    _getMessagesForModes() {
        return {
            null: [],
            'Total': [
                this.totalCasesMessage,
                this.cityLevelMessage,
                this.accuracyWarning
            ],
            '7 Days': [
                this.totalCasesMessage,
                this.cityLevelMessage,
                this.accuracyWarning
            ],
            '14 Days': [
                this.totalCasesMessage,
                this.cityLevelMessage,
                this.accuracyWarning
            ],
            'Active': [
                this.activeCasesMessage,
                this.accuracyWarning
            ],
            'Hospitals': [
                this.hospitalMessage
            ]
        };
    }

    _updateMode() {
        let that = this,
            messagesForModes = this._getMessagesForModes(),
            markers = this._markers;

        function enableInsts(dataSource, insts) {
            // Overlay LGA ABS data on LGA stats
            for (var i = 0; i < insts.length; i++) {
                insts[i].addHeatMap(dataSource);
                insts[i].addLinePoly(dataSource);
                insts[i].addFillPoly(
                    that.absStatsInsts[that._selectedUnderlay],
                    dataSource,
                    that._underlay ? 0.5 : 0,
                    !!that._underlay,
                    true
                );
            }
        }
        function enableNonLGAInst(dataSource, otherInst, lgaInst) {
            // Overlay LGA ABS data underneath non-LGA stats
            // (e.g. Queensland HHS/ACT SA3)

            otherInst.addHeatMap(
                dataSource
            );
            otherInst.addLinePoly(
                dataSource,
                'rgba(0, 0, 0, 1.0)'
            );
            otherInst.addFillPoly(
                null,
                dataSource,
                0,
                false,
                true
            );

            if (that._underlay && lgaInst) {
                lgaInst.addLinePoly(
                    that.absStatsInsts[that._underlay],
                    'rgba(0, 0, 0, 0.1)'
                );
                lgaInst.addFillPoly(
                    that.absStatsInsts[that._underlay],
                    null,
                    that._underlay ? 0.5 : 0,
                    !!that._underlay,
                    false//,
                    //fillPoly['fillPolyId']
                );
            }
        }
        function updateMessages() {
            let messages = messagesForModes[that._markers];
            for (var j = 0; j < messages.length; j++) {
                messages[j].current.style.display = 'block';
            }
        }
        //updateMessages();

        this.statesAndTerritories.forEach((stateName) => {
            var absStatDataInst = this.absStatsInsts[this._underlay],
                caseDataInst = this.getCaseDataInst(stateName);

            if (!caseDataInst) {
                return;
            }
            var absGeoBoundariesInst = this.getGeoBoundariesInst(stateName, 'lga'),
                caseGeoBoundariesInst = this.getGeoBoundariesInst(stateName, caseDataInst.schema);

            if (!caseGeoBoundariesInst) {
                return;
            }
            else if (absGeoBoundariesInst === caseGeoBoundariesInst) {
                enableInsts(caseDataInst, [caseGeoBoundariesInst]); // HACK!
            }
            else {
                enableNonLGAInst(caseDataInst, caseGeoBoundariesInst, absGeoBoundariesInst);
            }
        });

        // Make sure the map is fully loaded
        // before allowing a new change in tabs
        this.markersBGGroup.current.style.pointerEvents = 'none';
        this.underlayBGCont.current.style.pointerEvents = 'none';

        function enableControlsWhenMapReady() {
            if (that.map.loaded()) {
                that._enableControlsJob = null;
                that.markersBGGroup.current.style.pointerEvents = 'all';
                that.underlayBGCont.current.style.pointerEvents = 'all';
            }
            else {
                that._enableControlsJob = setTimeout(
                    enableControlsWhenMapReady, 50
                );
            }
        }
        if (this._enableControlsJob != null) {
            clearTimeout(this._enableControlsJob);
        }
        this._enableControlsJob = setTimeout(
            enableControlsWhenMapReady, 50
        );
    }

    _resetMode() {
        if (this._firstTime) {
            // Don't reset before the page has been initially changed!
            this._firstTime = false;
            return;
        }

        let that = this,
            messagesForModes = this._getMessagesForModes(),
            m = this._markers;

        function disableInsts(insts) {
            for (var i = 0; i < insts.length; i++) {
                insts[i].removeHeatMap();
                insts[i].removeLinePoly();
                insts[i].removeFillPoly();
                insts[i].resetPopups();
            }
        }
        function disableNonLGAInst(otherInst, lgaInst) {
            otherInst.removeHeatMap();
            otherInst.removeLinePoly();
            otherInst.removeFillPoly();
            otherInst.resetPopups();

            if (that._selectedUnderlay && lgaInst) {
                lgaInst.removeLinePoly();
                lgaInst.removeFillPoly();
            }
        }
        function clearMessages() {
            for (let key in messagesForModes) {
                let messages = messagesForModes[key];
                for (var j = 0; j < messages.length; j++) {
                    messages[j].current.style.display = 'none';
                }
            }
        }
        //clearMessages();

        this.statesAndTerritories.forEach((stateName) => {
            var absStatDataInst = this.absStatsInsts[this._underlay],
                caseDataInst = this.getCaseDataInst(stateName);

            if (!caseDataInst) {
                return;
            }
            var absGeoBoundariesInst = this.getGeoBoundariesInst(stateName, 'lga'),
                caseGeoBoundariesInst = this.getGeoBoundariesInst(stateName, caseDataInst.schema);

            if (!caseGeoBoundariesInst) {
                return;
            }
            else if (absGeoBoundariesInst === caseGeoBoundariesInst) {
                disableInsts([caseGeoBoundariesInst]); // HACK!
            }
            else {
                disableNonLGAInst(caseGeoBoundariesInst, absGeoBoundariesInst);
            }
        });

    }
}

export default MbMap

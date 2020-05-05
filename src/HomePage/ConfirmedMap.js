import React from "react";
import mapboxgl from 'mapbox-gl';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import confirmedData from "../data/mapdataCon"
import hospitalData from "../data/mapdataHos"

import regionsData from "../data/regionsTimeSeries.json"
import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import confirmedImg from '../img/icon/confirmed-recent.png'
import confirmedOldImg from '../img/icon/confirmed-old.png'
import hospitalImg from '../img/icon/hospital.png'
import Acknowledgement from "../Acknowledgment"
import absStatsData from "../data/absStats";

import ConfirmedMapFns from "./ConfirmedMapFns"
import TimeSeriesDataSource from "./ConfirmedMapCaseData"
import TimeSeriesDataSourceForPeriod from "./ConfirmedMapCaseDataPeriod"
import ConfirmedMapShipsData from "./ConfirmedMapShipsData"
import BigTableOValuesDataSource from "./ConfirmedMapABSData"
import GeoBoundaries from "./ConfirmedMapGeoBoundaries" // FIXME!
import ConfirmedMarker from "./ConfirmedMapConfirmedMarker"
import HospitalMarker from "./ConfirmedMapHospitalMarker"


const absStats = absStatsData['data'];
const regionsTimeSeries = regionsData['time_series_data'],
      regionsDateIDs = regionsData['date_ids'];

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
            _timeperiod: 'alltime',
            _markers: 'total',
            _underlay: null
        };
        this._firstTime = true;

        this.markersBGGroup = React.createRef();
        this.underlayBGCont = React.createRef();
        this.markersButtonGroup = React.createRef();
        this.mapContControls = React.createRef();
        this.markersSelect = React.createRef();
        this.otherStatsSelect = React.createRef();

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
        return (
            '<optgroup label="Quick Selections">' +
                '<option value="">(None)</option>' +
                '<option value="Population density (persons/km2)">Population density (persons/km2)</option>' +
                '<option value="Index of Relative Socio-economic Advantage and Disadvantage (%)">Socioeconomic Advantage and Disadvantage (%)</option>' +
                '<option value="Persons - 65 years and over (%)">65 years and over (%)</option>' +
            '</optgroup>'+

            ConfirmedMapFns.sortedKeys(absStats).map((heading) => {
                return (
                    '<optgroup label=' + heading + '>' +
                        outputSelects(heading) +
                    '</optgroup>'
                );
            }).join('\n')
        );
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this._resetMode(prevState);
        this._updateMode();
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

                <div style={{position: 'relative'}}>
                    <div class="map-cont-controls" ref={this.mapContControls}>

                        <div ref={this.markersBGGroup}
                            style={{ marginBottom: "8px" }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px' }}>Markers</div>
                            <select ref={this.markersSelect}
                                style={{ "width": "100%" }}>
                                <optgroup label="COVID-19 Test Facilities">
                                    <option value="hospitals">Testing Hospitals and Clinics</option>
                                </optgroup>
                                <optgroup label="Basic Numbers">
                                    <option value="total" selected>Total Cases</option>
                                    <option value="status_active">Active Cases</option>
                                    <option value="status_recovered">Recovered Cases</option>
                                    <option value="status_deaths">Deaths</option>
                                    <option value="status_icu">ICU</option>
                                    {/*<option value="status_icu_ventilators">ICU Ventilators</option>*/}
                                    <option value="status_hospitalized">Hospitalized</option>
                                </optgroup>
                                {/*<optgroup label="Test Numbers">
                                    <option value="tests_total">Total People Tested</option>
                                </optgroup>*/}
                                <optgroup label="Source of Infection">
                                    <option value="source_overseas">Contracted Overseas</option>
                                    <option value="source_community">Unknown Community Transmission</option>
                                    <option value="source_confirmed">Contracted from Confirmed Case</option>
                                    <option value="source_interstate">Contracted Interstate</option>
                                    <option value="source_under_investigation">Under Investigation</option>
                                </optgroup>
                                <optgroup label="Cruise Ship Numbers">
                                    <option value="RUBY PRINCESS">Ruby Princess</option>
                                    <option value="OVATION OF THE SEAS">Ovation of the Seas</option>
                                    <option value="GREG MORTIMER">Greg Mortimer</option>
                                    <option value="ARTANIA">Artania</option>
                                    <option value="VOYAGERS OF THE SEA">Voyagers of the sea</option>
                                    <option value="CELEBRITY SOLSTICE">Celebrity Solstice</option>
                                    <option value="COSTA VICTORIA">Costa Victoria</option>
                                    <option value="DIAMOND PRINCESS">Diamond Princess</option>
                                    <option value="COSTA LUMINOSA">Contracted Costa Luminosa</option>
                                    <option value="SUN PRINCESS">Sun Princess</option>
                                    <option value="CELEBRITY APEX">Celebrity Apex</option>
                                    <option value="MSC FANTASIA">MSC Fantasia</option>
                                    <option value="UNKNOWN">Unknown Ship</option>
                                </optgroup>
                            </select>
                        </div>

                        <div>
                            <span className="key" style={{ alignSelf: "flex-end", marginBottom: "5px" }}>
                                <ButtonGroup ref={this.markersButtonGroup}
                                    size="small"
                                    aria-label="small outlined button group">
                                    <Button style={this.state._timeperiod === 'alltime' ? activeStyles : inactiveStyles}
                                        onClick={() => this.setTimePeriod('alltime')}>All</Button>
                                    <Button style={this.state._timeperiod === '7days' ? activeStyles : inactiveStyles}
                                        onClick={() => this.setTimePeriod('7days')}>7 Days</Button>
                                    <Button style={this.state._timeperiod === '14days' ? activeStyles : inactiveStyles}
                                        onClick={() => this.setTimePeriod('14days')}>14 Days</Button>
                                    <Button style={this.state._timeperiod === '21days' ? activeStyles : inactiveStyles}
                                        onClick={() => this.setTimePeriod('21days')}>21 Days</Button>
                                </ButtonGroup>
                            </span>
                        </div>

                        <div ref={this.underlayBGCont}
                            className="key"
                            style={{ marginBottom: "8px" }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px' }}>Underlay</div>
                                <select ref={this.otherStatsSelect}
                                    style={{ "width": "100%" }}>
                                </select>
                        </div>
                    </div>

                    <div ref={el => this.mapContainer = el} >

                    </div>
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
        const lng = this.state['lng'],
              lat = this.state['lat'],
              zoom = this.state['zoom'];
        this._firstTime = true;

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
        this.otherStatsSelect.current.innerHTML =
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

        // Create case data instances
        var caseDataInsts = this.caseDataInsts = {};
        for (let key in regionsTimeSeries) {
            // key => "statename:schema"
            var d = caseDataInsts[key] = {};
            var subheaders = regionsTimeSeries[key]['sub_headers']; // CHECK ME!
            for (let subKey of subheaders) {
                console.log(`${key}|${subKey}|alltime`)

                caseDataInsts[`${key}|${subKey}|alltime`] = new TimeSeriesDataSource(
                    `${key}|${subKey}|alltime`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    key.split(":")[1],
                    key.split(":")[0]
                );
                caseDataInsts[`${key}|${subKey}|7days`] = new TimeSeriesDataSourceForPeriod(
                    `${key}|${subKey}|7days`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    key.split(":")[1],
                    key.split(":")[0],
                    7
                );
                caseDataInsts[`${key}|${subKey}|14days`] = new TimeSeriesDataSourceForPeriod(
                    `${key}|${subKey}|14days`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    key.split(":")[1],
                    key.split(":")[0],
                    14
                );
                caseDataInsts[`${key}|${subKey}|21days`] = new TimeSeriesDataSourceForPeriod(
                    `${key}|${subKey}|21days`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    key.split(":")[1],
                    key.split(":")[0],
                    21
                );
            }
        }

        // Add cruise ship data
        for (let shipName of ConfirmedMapShipsData.getPossibleShips()) {
            for (let stateName of this.statesAndTerritories) {
                var key = `${stateName}:statewide|${shipName}|alltime`;
                caseDataInsts[key] = new ConfirmedMapShipsData.ConfirmedMapShipsData(
                    key, stateName, shipName
                );
                if (!caseDataInsts[key].getCaseNumber()) {
                    // Only add if there's data for this ship+state combination!
                    delete caseDataInsts[key];
                }
            }
        }

        // Create ABS stat instances
        var absStatsInsts = this.absStatsInsts = {};
        for (var heading in absStats) {
            var absStatHeading = absStats[heading];
            for (var i = 0; i < absStatHeading['sub_headers'].length; i++) {
                var subHeader = absStatHeading['sub_headers'][i];
                absStatsInsts[subHeader] = new BigTableOValuesDataSource(
                    subHeader, heading, subHeader, absStatHeading
                );
            }
        }

        this.mapLoaded = false;
        map.on('load', () => {
            if (!this.otherStatsSelect) {
                // Control probably destroyed before loaded!
                return;
            }

            // Create map data instances
            var geoBoundaryInsts = this.geoBoundaryInsts = {};
            for (var key of GeoBoundaries.getAvailableGeoBoundaries()) {
                geoBoundaryInsts[key] = GeoBoundaries.getGeoBoundary(
                    map, key.split(":")[1], key.split(":")[0]
                );
            }

            this.otherStatsSelect.current.onchange = () => {
                this.setUnderlay();
            };
            this.markersSelect.current.onchange = () => {
                this.setMarkers();
            };

            this.mapLoaded = true;
            this._updateMode();
        });
    }

    componentWillUnmount() {
        this.map.remove();
        GeoBoundaries.clearGeoBoundaryCache();
    }

    /*******************************************************************
     * Mode update
     *******************************************************************/

    getCaseDataInst(stateName, state) {
        // stateName -> Australian state name
        // state -> React JS state, to allow for providing
        // the previous state when changing pages
        state = state || this.state;

        var schemas = [
            // In order of preference
            //'postcode',
            'lga',
            'hhs',
            'ths',
            'lhd',
            'sa3',
            'statewide'
        ];

        for (var schema of schemas) {
            var key = `${stateName}:${schema}|${state._markers}|${state._timeperiod}`;
            console.log("TRYING: "+key+" "+(key in this.caseDataInsts));

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

    setUnderlay() {
        this.setState({
            _underlay: this.otherStatsSelect.current.value
        });
    }

    setMarkers() {
        this.setState({
            _markers: this.markersSelect.current.value
        });
    }

    setTimePeriod(timeperiod) {
        this.setState({
            _timeperiod: timeperiod
        });
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
        let messagesForModes = this._getMessagesForModes();

        var enableInsts = (dataSource, insts) => {
            // Overlay LGA ABS data on LGA stats
            for (var i = 0; i < insts.length; i++) {
                //console.log(`Enable lga inst: ${insts[i].schema}:${insts[i].stateName}`);

                insts[i].addHeatMap(dataSource);
                insts[i].addLinePoly(dataSource);
                insts[i].addFillPoly(
                    this.absStatsInsts[this.state._underlay],
                    dataSource,
                    this.state._underlay ? 0.5 : 0,
                    !!this.state._underlay,
                    true
                );
            }
        };
        var enableNonLGAInst = (dataSource, otherInst, lgaInst) => {
            // Overlay LGA ABS data underneath non-LGA stats
            // (e.g. Queensland HHS/ACT SA3)
            //console.log(`Enable non-lga inst: dataSource->${dataSource.schema}:${dataSource.stateName} otherInst->${otherInst.schema}:${otherInst.stateName} ${otherInst} ${lgaInst}`);

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

            if (this.state._underlay && lgaInst) {
                lgaInst.addLinePoly(
                    this.absStatsInsts[this.state._underlay],
                    'rgba(0, 0, 0, 0.1)'
                );
                lgaInst.addFillPoly(
                    this.absStatsInsts[this.state._underlay],
                    null,
                    this.state._underlay ? 0.5 : 0,
                    !!this.state._underlay,
                    false//,
                    //fillPoly['fillPolyId']
                );
            }
        };
        var updateMessages = () => {
            let messages = messagesForModes[this.state._markers];
            for (var j = 0; j < messages.length; j++) {
                messages[j].current.style.display = 'block';
            }
        };
        //updateMessages();

        if (this.state._markers === 'hospitals') {
            this.hospitalMarkers.forEach((marker) => {
                marker.show();
                this.markersButtonGroup.current.parentNode.style.display = 'none';
                this.underlayBGCont.current.style.display = 'none';
            });
            return;
        }
        else if (this.state._markers === 'total') {
            this.confirmedMarkers.forEach((marker) => {
                marker.show();
            });
        }

        this.statesAndTerritories.forEach((stateName) => {
            var absStatDataInst = this.absStatsInsts[this.state._underlay],
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
        this._disableControls();
        var enableControlsWhenMapReady = () => {
            if (this.map.loaded()) {
                this._enableControlsJob = null;
                this._enableControls();
            }
            else {
                this._enableControlsJob = setTimeout(
                    enableControlsWhenMapReady, 50
                );
            }
        };
        if (this._enableControlsJob != null) {
            clearTimeout(this._enableControlsJob);
        }
        this._enableControlsJob = setTimeout(
            enableControlsWhenMapReady, 50
        );
    }

    _disableControls() {
        this.mapContControls.current.style.pointerEvents = 'none';
    }

    _enableControls() {
        this.mapContControls.current.style.pointerEvents = 'all';
    }

    _resetMode(prevState) {
        let messagesForModes = this._getMessagesForModes();

        function disableInsts(insts) {
            for (var i = 0; i < insts.length; i++) {
                //console.log(`Disable lga inst: ${insts[i].schema}:${insts[i].stateName}`);

                insts[i].removeHeatMap();
                insts[i].removeLinePoly();
                insts[i].removeFillPoly();
                insts[i].resetPopups();
            }
        }
        function disableNonLGAInst(otherInst, lgaInst) {
            //console.log(`Disable non-lga inst: ${otherInst.schema}:${otherInst.stateName} ${lgaInst}`);

            otherInst.removeHeatMap();
            otherInst.removeLinePoly();
            otherInst.removeFillPoly();
            otherInst.resetPopups();

            if (prevState._underlay && lgaInst) {
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

        if (prevState._markers === 'hospitals') {
            this.hospitalMarkers.forEach((marker) => {
                marker.hide();
                this.markersButtonGroup.current.parentNode.style.display = 'block';
                this.underlayBGCont.current.style.display = 'block';
            });
            return;
        }
        else if (prevState._markers === 'total') {
            this.confirmedMarkers.forEach((marker) => {
                marker.hide();
            });
        }

        this.statesAndTerritories.forEach((stateName) => {
            var absStatDataInst = this.absStatsInsts[prevState._underlay],
                caseDataInst = this.getCaseDataInst(stateName, prevState);

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

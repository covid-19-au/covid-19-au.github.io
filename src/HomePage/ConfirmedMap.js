import React from "react"
import ReactDOM from "react-dom"
import mapboxgl from 'mapbox-gl'
import ButtonGroup from '@material-ui/core/ButtonGroup'
import Button from '@material-ui/core/Button'
//import Tooltip from '@material-ui/core/Tooltip'
//import ReactCountryFlag from "react-country-flag"

import regionsData from "../data/regionsTimeSeries.json"
import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import Acknowledgement from "../Acknowledgment"
import absStatsData from "../data/absStats";

import ConfirmedMapFns from "./ConfirmedMap/Fns"
import TimeSeriesDataSource from "./ConfirmedMap/DataCases"
import TimeSeriesDataSourceForPeriod from "./ConfirmedMap/DataCasesPeriod"
import ConfirmedMapShipsData from "./ConfirmedMap/DataShips"
import BigTableOValuesDataSource from "./ConfirmedMap/DataABS"
import GeoBoundaries from "./ConfirmedMap/GeoBoundaries" // FIXME!
import DaysSinceMap from "./DaysSinceMap"


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
            _timeperiod: '21days',
            _markers: 'total',
            _underlay: null
        };
        this._firstTime = true;
        this.geoBoundaries = new GeoBoundaries();

        this.markersBGGroup = React.createRef();
        this.underlayBGCont = React.createRef();
        this.markersButtonGroup = React.createRef();
        this.mapContControls = React.createRef();
        this.markersSelect = React.createRef();
        this.otherStatsSelect = React.createRef();

        this.accuracyWarning = React.createRef();

        this.statesAndTerritories = [
            // note if act is last, it will be drawn first!!!
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
        const padding = '6px',
              fbPadding = '2px 3px';

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

        const activeFBStyles = {
            color: 'black',
            borderColor: '#8ccfff',
            padding: fbPadding,
            //padding: "0px 5px",
            zIndex: 10,
            outline: "none",
            textTransform: "none",
            minWidth: 0,
            minHeight: 0
        };
        const inactiveFBStyles = {
            color: 'grey',
            borderColor: '#e3f3ff',
            padding: fbPadding,
            //padding: "0px 5px",
            outline: "none",
            textTransform: "none",
            minWidth: 0,
            minHeight: 0,
            opacity: 0.8,
            filter: "grayscale(50%)"
        };

        var countrySize = '1.32em';

        return (
            <div className="card" style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ display: "flex" }}
                    aria-label="Case Map">Case Map<div style={{
                        alignSelf: "flex-end",
                        marginLeft: "auto",
                        fontSize: "60%"
                    }}>
                        <Acknowledgement>
                        </Acknowledgement>
                        </div></h2>

                <div style={{position: 'relative'}}>
                    <div class="map-cont-controls" ref={this.mapContControls}>

                        <div ref={this.markersBGGroup}
                            style={{ marginBottom: "8px" }}>
                            <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px' }}>Markers</div>
                            <select ref={this.markersSelect}
                                style={{ "width": "100%" }}>
                                <optgroup label="Basic Numbers">
                                    <option value="total" selected>Total Cases</option>
                                    <option value="days_since">Days Since Last Case</option>
                                    <option value="status_active">Active Cases</option>
                                    <option value="status_recovered">Recovered Cases</option>
                                    <option value="status_deaths">Deaths</option>
                                    <option value="status_icu">ICU</option>
                                    {/*<option value="status_icu_ventilators">ICU Ventilators</option>*/}
                                    <option value="status_hospitalized">Hospitalized</option>
                                </optgroup>
                                <optgroup label="Test Numbers">
                                    <option value="tests_total">Total People Tested</option>
                                </optgroup>
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
                    <div ref={el => this.dsMapContainer = el} style={{display: 'none'}}>

                    </div>
                </div>

                <span className="due">
                    <div ref={this.accuracyWarning}>
                        <p style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>* Zoom in to get regional numbers. Click on regions to get a history over time.</p>
                        <p style={{ color: 'red', marginTop: '0px', paddingTop: '0px' }}>* Cases on map are approximate and
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
            //style: 'mapbox://styles/mapbox/satellite-v9',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [lng, lat],
            zoom: zoom,
            maxZoom: 9.5,
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

        // Create case data instances
        var caseDataInsts = this.caseDataInsts = {};
        for (let key in regionsTimeSeries) {
            // key => "statename:schema"
            var d = caseDataInsts[key] = {};
            var subheaders = regionsTimeSeries[key]['sub_headers']; // CHECK ME!
            for (let subKey of subheaders) {
                // console.log(`${key}|${subKey}|alltime`)

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
            for (var key of this.geoBoundaries.getAvailableGeoBoundaries()) {
                geoBoundaryInsts[key] = this.geoBoundaries.getGeoBoundary(
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
        this.geoBoundaries.clearGeoBoundaryCache();
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
            // console.log("TRYING: "+key+" "+(key in this.caseDataInsts));

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
        var val = this.markersSelect.current.value;

        if (val === 'status_active' || (val && val.toUpperCase() === val)) {
            // Ships data doesn't have histories currently,
            // and it doesn't make sense to have
            // e.g. a 7-day difference for active cases
            this.setState({
                _timeperiod: 'alltime',
                _markers: val
            })
        }
        else {
            this.setState({
                _markers: val
            });
        }
    }

    setTimePeriod(timeperiod) {
        this.setState({
            _timeperiod: timeperiod
        });
    }

    _updateMode() {
        if (this.state._markers === 'days_since') {
            if (!this.dsMap) {
                ReactDOM.render(
                    <DaysSinceMap ref={el => this.dsMap = el} />,
                    this.dsMapContainer
                );
            }
            var runUntilLoaded = () => {
                if (!this.dsMap) {
                    setTimeout(runUntilLoaded, 50);
                    return;
                }
                this.mapContainer.style.display = 'none';
                this.dsMapContainer.style.display = 'block';
                this.markersButtonGroup.current.parentNode.style.display = 'none';
                this.underlayBGCont.current.style.display = 'none';
                this.dsMap.map.setZoom(this.map.getZoom());
                this.dsMap.map.setCenter(this.map.getCenter());
                this.dsMap.map.resize();
            };
            runUntilLoaded();
            return;
        }

        // Get the absolute max/min values among all the datasources
        // so that we can scale heatmap values for the entire of the
        // country
        var otherMaxMin = null,
            stateWideMaxMin = null,
            numStateWide = 0;

        this.statesAndTerritories.forEach((stateName) => {
            var caseDataInst = this.getCaseDataInst(stateName);
            if (!caseDataInst) {
                return;
            }
            var iMaxMinValues = caseDataInst.getMaxMinValues();

            if (caseDataInst.schema === 'statewide') {
                if (!stateWideMaxMin) {
                    stateWideMaxMin = iMaxMinValues
                }
                if (iMaxMinValues['max'] > stateWideMaxMin['max']) {
                    stateWideMaxMin['max'] = iMaxMinValues['max'];
                }
                if (iMaxMinValues['min'] < stateWideMaxMin['min']) {
                    stateWideMaxMin['min'] = iMaxMinValues['min'];
                }
                numStateWide += 1;
            }
            else {
                if (!otherMaxMin) {
                    otherMaxMin = iMaxMinValues
                }
                if (iMaxMinValues['max'] > otherMaxMin['max']) {
                    otherMaxMin['max'] = iMaxMinValues['max'];
                }
                if (iMaxMinValues['min'] < otherMaxMin['min']) {
                    otherMaxMin['min'] = iMaxMinValues['min'];
                }
            }
        });

        if (numStateWide === 1) {
            // HACK: Because there's only one state level value,
            // there's likely no common point of comparison,
            // so at least tone it down!
            stateWideMaxMin['max'] *= 4;
        }

        var enableInsts = (dataSource, insts) => {
            // Overlay LGA ABS data on LGA stats
            for (var i = 0; i < insts.length; i++) {
                //console.log(`Enable lga inst: ${insts[i].schema}:${insts[i].stateName}`);

                insts[i].addFillPoly(
                    this.absStatsInsts[this.state._underlay],
                    dataSource,
                    this.state._underlay ? 0.5 : 0,
                    !!this.state._underlay,
                    true
                );
                insts[i].addLinePoly(dataSource);

                insts[i].addHeatMap(
                    dataSource,
                    dataSource.schema === 'statewide' ?
                        stateWideMaxMin : otherMaxMin
                );
            }
        };
        var enableNonLGAInst = (dataSource, otherInst, lgaInst) => {
            // Overlay LGA ABS data underneath non-LGA stats
            // (e.g. Queensland HHS/ACT SA3)
            //console.log(`Enable non-lga inst: dataSource->${dataSource.schema}:${dataSource.stateName} otherInst->${otherInst.schema}:${otherInst.stateName} ${otherInst} ${lgaInst}`);

            otherInst.addFillPoly(
                null,
                dataSource,
                0,
                false,
                true
            );

            if (this.state._underlay && lgaInst) {
                lgaInst.addFillPoly(
                    this.absStatsInsts[this.state._underlay],
                    null,
                    this.state._underlay ? 0.5 : 0,
                    !!this.state._underlay,
                    false//,
                    //fillPoly['fillPolyId']
                );
                lgaInst.addLinePoly(
                    this.absStatsInsts[this.state._underlay],
                    'rgba(0, 0, 0, 0.1)'
                );
            }

            otherInst.addLinePoly(dataSource,'rgba(0, 0, 0, 1.0)');

            otherInst.addHeatMap(
                dataSource,
                dataSource.schema === 'statewide' ?
                    stateWideMaxMin : otherMaxMin
            );
        };

        if (this.state._markers === 'status_active' ||
            (this.state._markers && this.state._markers.toUpperCase() === this.state._markers)) {
            this.markersButtonGroup.current.parentNode.style.display = 'none';
        }
        this.accuracyWarning.current.style.display = 'block';

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
        if (prevState._markers === 'days_since') {
            this.mapContainer.style.display = 'block';
            this.dsMapContainer.style.display = 'none';
            this.markersButtonGroup.current.parentNode.style.display = 'block';
            this.underlayBGCont.current.style.display = 'block';
            this.map.setZoom(this.dsMap.map.getZoom());
            this.map.setCenter(this.dsMap.map.getCenter());
            this.map.resize();
            return;
        }

        function disableInsts(insts) {
            for (var i = 0; i < insts.length; i++) {
                //console.log(`Disable lga inst: ${insts[i].schema}:${insts[i].stateName}`);

                insts[i].removeHeatMap();
                insts[i].removeLinePoly();
                insts[i].removeFillPoly();
            }
        }
        function disableNonLGAInst(otherInst, lgaInst) {
            //console.log(`Disable non-lga inst: ${otherInst.schema}:${otherInst.stateName} ${lgaInst}`);

            otherInst.removeHeatMap();
            otherInst.removeLinePoly();
            otherInst.removeFillPoly();

            if (prevState._underlay && lgaInst) {
                lgaInst.removeLinePoly();
                lgaInst.removeFillPoly();
            }
        }

        if (prevState._markers === 'status_active' ||
            (prevState._markers && prevState._markers.toUpperCase() === prevState._markers)) {
            this.markersButtonGroup.current.parentNode.style.display = 'block';
        }
        //this.accuracyWarning.current.style.display = 'none';

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

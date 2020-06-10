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
import TimeSeriesDataSource from "./CrawlerData/DataCases"
import TimeSeriesDataSourceForPeriod from "./CrawlerData/DataCasesPeriod"
import ConfirmedMapShipsData from "./CrawlerData/DataShips"
import BigTableOValuesDataSource from "./CrawlerData/DataABS"
import GeoBoundaries from "./ConfirmedMap/GeoBoundaries/GeoBoundaries" // FIXME!
import DaysSinceMap from "./DaysSinceMap"


const absStats = absStatsData['data'];
const regionsTimeSeries = regionsData['time_series_data'],
      regionsDateIDs = regionsData['date_ids'],
      regionsUpdatedDates = regionsData['updated_dates'];

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
        this.stateUpdatedDates = [];
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

    componentDidUpdate(prevProps, prevState, snapshot) {
        this._resetMode(prevState);
        this._updateMode();
    }

    render() {
        return (
            <div className="card" style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ display: "flex" }}
                    aria-label="World Casemap">World Casemap<div style={{
                        alignSelf: "flex-end",
                        marginLeft: "auto",
                        fontSize: "60%"
                    }}>
                        <Acknowledgement>
                        </Acknowledgement>
                        </div></h2>

                <div style={{position: 'relative'}}>
                    <div class="map-cont-controls" ref={this.mapContControls}>

                        <SchemaTypeSelect></SchemaTypeSelect>

                        <SchemaTypeUnderlaySelect></SchemaTypeUnderlaySelect>
                    </div>

                    <div ref={el => this.mapContainer = el} >

                    </div>
                    <div ref={el => this.dsMapContainer = el} style={{display: 'none'}}>

                    </div>
                </div>

                <span className="due">
                    <ul ref={this.accuracyWarning} style={{margin: '0px', padding: '0px'}}>
                        <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>Regional Case Map may not be up-to-date. Refer to state totals in Cases by State table for current statistics.</li>
                        <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>Displayed cases identify regions only, not specific addresses.</li>
                        <li style={{color: '#555', marginBottom: '2px', paddingBottom: '0px'}}>Zoom in for regional numbers. Click regions for history over time.</li>
                        <li style={{color: '#555'}}><div style={{color: '#777', fontSize: '0.9em'}}>Regional data updated: {
                            this.stateUpdatedDates.length ? this.stateUpdatedDates.map((item, index) => {
                                return <span style={{margin:0, padding: 0}}>{item[0]}&nbsp;({item[1]}):&nbsp;{item[2]}{index === this.stateUpdatedDates.length-1 ? '' : ';'} </span>
                            }) : 'loading, please wait...'
                        }</div>
                        </li>
                    </ul>
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
            // https://docs.mapbox.com/api/maps/#styles
            //style: 'mapbox://styles/mapbox/bright-v8',
            //style: 'mapbox://styles/mapbox/satellite-streets-v11',
            style: 'mapbox://styles/mapbox/streets-v11',
            //style: 'mapbox://styles/mapbox/light-v10',
            //style: 'mapbox://styles/mapbox/dark-v10',
            //style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [lng, lat],
            zoom: zoom,
            maxZoom: 9.5,
            minZoom: 1,
            //maxBounds: bounds, // Sets bounds as max
            transition: {
                duration: 0,
                delay: 0
            },
            fadeDuration: 0
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
        var stateUpdatedDates = this.stateUpdatedDates = [];
        var addedStateUpdated = {};
        var caseDataInsts = this.caseDataInsts = {};

        for (let key in regionsTimeSeries) {
            // key => "statename:schema"
            var d = caseDataInsts[key] = {};
            var subheaders = regionsTimeSeries[key]['sub_headers']; // CHECK ME!

            for (let subKey of subheaders) {
                // console.log(`${key}|${subKey}|alltime`)
                var inst = caseDataInsts[`${key}|${subKey}|alltime`] = new TimeSeriesDataSource(
                    `${key}|${subKey}|alltime`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    regionsUpdatedDates[key],
                    key.split(":")[1],
                    key.split(":")[0]
                );

                if (
                    (!stateUpdatedDates.length || !(key in addedStateUpdated)) &&
                    key.split(':')[1] !== 'statewide'
                ) {
                    addedStateUpdated[key] = null;
                    stateUpdatedDates.push([
                        key.split(':')[0],
                        key.split(':')[1],
                        inst.getUpdatedDate()
                    ]);
                }

                caseDataInsts[`${key}|${subKey}|7days`] = new TimeSeriesDataSourceForPeriod(
                    `${key}|${subKey}|7days`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    regionsUpdatedDates[key],
                    key.split(":")[1],
                    key.split(":")[0],
                    7
                );
                caseDataInsts[`${key}|${subKey}|14days`] = new TimeSeriesDataSourceForPeriod(
                    `${key}|${subKey}|14days`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    regionsUpdatedDates[key],
                    key.split(":")[1],
                    key.split(":")[0],
                    14
                );
                caseDataInsts[`${key}|${subKey}|21days`] = new TimeSeriesDataSourceForPeriod(
                    `${key}|${subKey}|21days`,
                    subKey,
                    regionsTimeSeries[key],
                    regionsDateIDs,
                    regionsUpdatedDates[key],
                    key.split(":")[1],
                    key.split(":")[0],
                    21
                );
            }
        }
        this.stateUpdatedDates.sort();

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
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.map.remove();
    }

    /*******************************************************************
     * Mode update
     *******************************************************************/

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

        if (val === 'status_active' ||
            val === 'status_icu' ||
            val === 'status_hospitalized' ||
            (val && val.toUpperCase() === val)) {

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
            this.state._markers === 'status_icu' ||
            this.state._markers === 'status_hospitalized' ||
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
        this.mapContainer.style.pointerEvents = 'none';
        this.dsMapContainer.style.pointerEvents = 'none';
    }

    _enableControls() {
        this.mapContControls.current.style.pointerEvents = 'all';
        this.mapContainer.style.pointerEvents = 'all';
        this.dsMapContainer.style.pointerEvents = 'all';
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
            prevState._markers === 'status_icu' ||
            prevState._markers === 'status_hospitalized' ||
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

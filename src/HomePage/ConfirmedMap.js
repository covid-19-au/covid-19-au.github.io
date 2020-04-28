import React from "react";
import mapboxgl from 'mapbox-gl';
import polylabel from 'polylabel';
import CanvasJS from "../assets/canvasjs.min.js";
import confirmedData from "../data/mapdataCon"
import hospitalData from "../data/mapdataHos"
import mapDataArea from "../data/mapdataarea"

// by LGA
import vicLgaData from "../data/geojson/lga_vic.geojson"
import nswLgaData from "../data/geojson/lga_nsw.geojson"
//import ntLgaData from "../data/geojson/lga_nt.geojson"
import qldLgaData from "../data/geojson/lga_qld.geojson"
//import saLgaData from "../data/geojson/lga_sa.geojson"
//import tasLgaData from "../data/geojson/lga_tas.geojson"
import waLgaData from "../data/geojson/lga_wa.geojson"

// by other schema
import actSaData from "../data/geojson/sa3_act.geojson"
import qldHhsData from "../data/geojson/hhs_qld.geojson"

// statewide outlines (when regional data not available)
import actOutlineData from "../data/geojson/boundary_act.geojson"
import vicOutlineData from "../data/geojson/boundary_vic.geojson"
import nswOutlineData from "../data/geojson/boundary_nsw.geojson"
//import qldOutlineData from "../data/geojson/boundary_qld.geojson"
import waOutlineData from "../data/geojson/boundary_wa.geojson"
import saOutlineData from "../data/geojson/boundary_sa.geojson"
import tasOutlineData from "../data/geojson/boundary_tas.geojson"
import ntOutlineData from "../data/geojson/boundary_nt.geojson"

import regionsTimeSeries from "../data/regionsTimeSeriesAutogen.json"
import absStatsData from "../data/absStats"
import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import confirmedImg from '../img/icon/confirmed-recent.png'
import confirmedOldImg from '../img/icon/confirmed-old.png'
import hospitalImg from '../img/icon/hospital.png'
import ReactGA from "react-ga";
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import Acknowledgement from "../Acknowledgment"
//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;

// Threshold for an 'old case', in days
const oldCaseDays = 14;
// Higher values will result in less accurate lines,
// but faster performance. Default is 0.375
const MAPBOX_TOLERANCE = 0.45;


const absStats = absStatsData['data'],
    absStatsStates = absStatsData['states'],
    absStatsLGANames = absStatsData['lga_names'];

// Various utility functions

function sortedKeys(o) {
    // Return the keys in `o`, sorting
    // (case-sensitive)
    var r = [];
    for (var k in o) {
        if (!o.hasOwnProperty(k)) {
            continue;
        }
        r.push(k);
    }
    r.sort();
    return r
}

function getToday() {
    // Get today's date, setting the time to
    // midnight to allow for calculations
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

function parseDate(str) {
    // Convert `str` to a `Date` object
    // dateString must be dd/mm/yyyy format
    var mdy = str.split('/');
    // year, month index, day
    return new Date(mdy[2], mdy[1] - 1, mdy[0]);
}

function dateDiff(first, second) {
    // Get the difference in days between
    // the first and second `Date` instances
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
}

function dateDiffFromToday(dateString) {
    // Get number of days ago from today and
    // `dateString` in dd/mm/yyyy format
    // NOTE: returns a *positive* number if
    // `dateString` is in the past
    var today = getToday();
    var dateUpdatedInst = parseDate(dateString).getTime();
    return dateDiff(dateUpdatedInst, today);
}

function toTitleCase(str) {
    // convert to Title Case
    // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    return str.replace(
        /\w\S*/g,
        function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}


function prepareForComparison(s) {
    // Replace different kinds of successive hyphens
    // and whitespace with only a single hyphen,
    // then lowercase before comparing to make sure
    // e.g. "KALGOORLIE-BOULDER" matches against
    // "Kalgoorlie - Boulder"
    s = s.replace(/(\s*[-‒–—])\s+/g, '-');
    s = s.toLowerCase();
    // Sync me with get_regions_json_data in the web app!!
    s = s.replace('the corporation of the city of ', '')
    s = s.replace('the corporation of the town of ', '')
    s = s.replace('pastoral unincorporated area', 'pua')
    s = s.replace('district council', '')
    s = s.replace('regional council', '')
    s = s.replace(' shire', '')
    s = s.replace(' council', '')
    s = s.replace(' regional', '')
    s = s.replace(' rural', '')
    s = s.replace('the dc of ', '')
    s = s.replace('town of ', '')
    s = s.replace('city of ', '')
    if (s.indexOf('the ') === 0)
        s = s.slice(4);
    return s;
}


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

        this.markersButtonGroup = React.createRef();
        this.underlayButtonGroup = React.createRef();

        this.hospitalMessage = React.createRef();
        this.totalCasesMessage = React.createRef();
        this.cityLevelMessage = React.createRef();
        this.activeCasesMessage = React.createRef();
        this.accuracyWarning = React.createRef();
        //this.otherStatsSelect = React.createRef();
        //this.otherStatsSelectCont = React.createRef();
        this.underlayBGCont = React.createRef();
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
        return sortedKeys(absStats).map((heading) => {
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

                <div>
                    <span className="key" style={{ alignSelf: "flex-end", marginBottom: "0.8rem" }}>
                        Case Markers:&nbsp;<ButtonGroup ref={this.markersButtonGroup}
                            size="small"
                            aria-label="small outlined button group"
                            style={{ pointerEvents: "none" }}>
                            {/*<Button style={this._markers == null ? activeStyles : inactiveStyles}
                                    onClick={() => this.setMarkers(null)}>Off</Button>*/}
                            <Button style={this._markers === 'Total' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('Total')}>Total</Button>
                            <Button style={this._markers === '7 Days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('7 Days')}>7 Days</Button>
                            <Button style={this._markers === '14 Days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('14 Days')}>14 Days</Button>
                            <Button style={this._markers === 'Active' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('Active')}>Active</Button>
                            {/*<Button style={this._markers === 'Tests' ? activeStyles : inactiveStyles}
                                    onClick={() => this.setMarkers('Tests')}>Tests</Button>*/}
                            <Button style={this._markers === 'Hospitals' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('Hospitals')}>COVID-19 Hospitals</Button>
                        </ButtonGroup>
                    </span>
                </div>

                <div>
                    <span className="key" style={{ alignSelf: "flex-end", marginBottom: "0.8rem" }}>
                        :&nbsp;<ButtonGroup
                            size="small"
                            aria-label="small outlined button group"
                            style={{ pointerEvents: "none" }}>
                            {/*<Button style={this._markers == null ? activeStyles : inactiveStyles}
                                    onClick={() => this.setMarkers(null)}>Off</Button>*/}
                            <Button style={this._markers === 'Total' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('Total')}>Total Tests</Button>
                            <Button style={this._markers === '7 Days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('7 Days')}>Tests Per Capita</Button>
                            <Button style={this._markers === '7 Days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('7 Days')}>Tests Positive Rate</Button>
                            <Button style={this._markers === '14 Days' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('14 Days')}>Recovered</Button>
                            <Button style={this._markers === 'Active' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('Active')}>Deaths</Button>
                            <Button style={this._markers === 'Active' ? activeStyles : inactiveStyles}
                                onClick={() => this.setMarkers('Active')}>Active</Button>
                        </ButtonGroup>
                    </span>
                </div>

                {/*<div ref={this.underlayBGCont}>
                    <span className="key" style={{ alignSelf: "flex-end", marginBottom: "0.8rem" }}>
                        Underlay:&nbsp;<ButtonGroup ref={this.underlayButtonGroup}
                            size="small"
                            aria-label="small outlined button group"
                            style={{ pointerEvents: "none" }}>
                            <Button style={this._underlay == null ? activeStyles : inactiveStyles}
                                onClick={() => this.setUnderlay(null)}>Off</Button>
                            <Button style={this._underlay === 'Population Density' ? activeStyles : inactiveStyles}
                                onClick={() => this.setUnderlay('Population Density')}>Population Density</Button>
                            <Button style={this._underlay === 'Socioeconomic Index' ? activeStyles : inactiveStyles}
                                onClick={() => this.setUnderlay('Socioeconomic Index')}>Socioeconomic Index</Button>
                            <Button style={this._underlay === 'Aged 65+' ? activeStyles : inactiveStyles}
                                onClick={() => this.setUnderlay('Aged 65+')}>Aged 65+</Button>
                            <Button style={this._underlay === 'Other Stats' ? activeStyles : inactiveStyles}
                                onClick={() => this.setUnderlay('Other Stats')}>Other Stats</Button>
                        </ButtonGroup>
                    </span>
                </div>*/}

                <div ref={el => this.otherStatsSelectCont = el}
                    className="key"
                    style={{ display: "none", marginBottom: "0.8rem" }}>
                    Other&nbsp;Stat:&nbsp;<select id="other_stats_select"
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
                        <span className="key"><img src={confirmedOldImg} /><p>Case over {oldCaseDays} days old</p></span>
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

        //Add Zoom Controls
        map.addControl(new mapboxgl.NavigationControl());

        //Add Full Screen Controls
        map.addControl(new mapboxgl.FullscreenControl());

        /*
        map.on('move', () => {
            const { lng, lat } = map.getCenter();

            this.setState({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });
         */

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
                // Technically the timeseries data also includes recovered/
                var totalData = new CurrentValuesDataSource(
                    'totalData', mapDataArea
                );
                that.totalData = new TimeSeriesDataSource(
                    'totalData', 'total',
                    regionsTimeSeries, totalData
                );
                that.activeData = new TimeSeriesDataSource(
                    'activeData', 'active',
                    regionsTimeSeries
                );
                that.sevenDaysAgo = new ActiveTimeSeriesDataSource(
                    'sevenDaysAgo', 'total',
                    regionsTimeSeries, 7
                );
                that.fourteenDaysAgo = new ActiveTimeSeriesDataSource(
                    'fourteenDaysAgo', 'total',
                    regionsTimeSeries, 14
                );

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

                // ACT uses SA3 schema, Queensland uses HHS.
                // The others use LGA (Local Government Area)
                that.sa3ACT = new ACTSA3Boundaries(map);
                that.hhsQLD = new QLDHHSGeoBoundaries(map);

                //that.lgaACT = new ACTLGABoundaries(map);    <-- TODO!
                that.lgaNSW = new NSWLGABoundaries(map);
                //that.lgaNT = new NTLGABoundaries(map);
                that.lgaVic = new VicLGABoundaries(map);
                that.lgaQLD = new QLDLGABoundaries(map);
                that.lgaWA = new WALGABoundaries(map);
                //that.lgaSA = new SALGABoundaries(map);
                //that.lgaTas = new TasLGABoundaries(map);

                function enableControls() {
                    var initialized = true;
                    [
                        that.sa3ACT,
                        that.hhsQLD,

                        //that.lgaACT,
                        that.lgaNSW,
                        //that.lgaNT,
                        that.lgaVic,
                        that.lgaQLD,
                        that.lgaWA,
                        //that.lgaSA
                        //that.lgaTas
                    ].forEach(function (inst) {
                        if (!inst.geoJSONData) {
                            initialized = false;
                        }
                    });

                    if (initialized) {
                        // Only enable the controls once all the data has loaded!
                        that.setUnderlay(that._underlay);
                        that.setMarkers(that._markers);

                        that.markersButtonGroup.current.style.pointerEvents = 'auto';
                        that.underlayButtonGroup.current.style.pointerEvents = 'auto';

                        document.getElementById('other_stats_select').onchange = function () {
                            that.setUnderlay(that._underlay);
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

    setUnderlay(underlay, noSetState) {
        this._resetMode();

        if (!noSetState) {
            this._underlay = underlay;
            this.setState({
                _underlay: underlay
            });
        }

        if (underlay == null) {
            this._selectedUnderlay = 'Population density (persons/km2)';  // HACK!!! ===================================
        }
        else if (underlay === 'Population Density') {
            this._selectedUnderlay = 'Population density (persons/km2)';
        }
        else if (underlay === 'Socioeconomic Index') {
            this._selectedUnderlay = 'Index of Relative Socio-economic Advantage and Disadvantage (%)';
        }
        else if (underlay === 'Aged 65+') {
            this._selectedUnderlay = 'Persons - 65 years and over (%)';
        }
        else if (underlay === 'Other Stats') {
            this._selectedUnderlay = document.getElementById('other_stats_select').value;
        }
        else {
            throw "Unknown mode"
        }

        this.otherStatsSelectCont.style.display =
            (
                underlay === 'Other Stats' &&
                this._markers !== 'Hospitals'
            ) ? 'block' : 'none'
            ;

        this._updateMode()
    }

    setMarkers(markers) {
        this._resetMode();
        this._markers = markers;
        this.setState({
            _markers: markers
        });
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
                    dataSource,
                    0,
                    false,
                    true
                );
                insts[i].addFillPoly(
                    that.absStatsInsts[that._selectedUnderlay],
                    that._underlay ? 0.5 : 0,
                    !!that._underlay,
                    false
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
                dataSource,
                0,
                false,
                true
            );

            lgaInst.addLinePoly(
                that.absStatsInsts[that._selectedUnderlay],
                'rgba(0, 0, 0, 0.1)'
            );
            lgaInst.addFillPoly(
                that.absStatsInsts[that._selectedUnderlay],
                that._underlay ? 0.5 : 0,
                !!that._underlay,
                false//,
                //fillPoly['fillPolyId']
            );
        }
        function updateMessages() {
            let messages = messagesForModes[that._markers];
            for (var j = 0; j < messages.length; j++) {
                messages[j].current.style.display = 'block';
            }
        }
        updateMessages();

        // Change to the new markers mode
        if (markers === null) {
        }
        else if (markers === 'Total') {
            enableInsts(this.totalData, [
                this.sa3ACT, this.lgaNSW, this.lgaVic, this.lgaWA//, this.lgaSA
            ]);
            enableNonLGAInst(this.totalData, this.hhsQLD, this.lgaQLD);
            this.confirmedMarkers.forEach(
                (marker) => marker.show()
            );
        }
        else if (markers === '7 Days') {
            // TODO: Show recent confirmed markers!
            enableInsts(this.sevenDaysAgo, [
                this.sa3ACT, this.lgaNSW, this.lgaVic, this.lgaWA//, this.lgaSA
            ]);
            enableNonLGAInst(this.sevenDaysAgo, this.hhsQLD, this.lgaQLD);
        }
        else if (markers === '14 Days') {
            // TODO: Show recent confirmed markers!
            enableInsts(this.fourteenDaysAgo, [
                this.sa3ACT, this.lgaNSW, this.lgaVic, this.lgaWA//, this.lgaSA
            ]);
            enableNonLGAInst(this.fourteenDaysAgo, this.hhsQLD, this.lgaQLD);
        }
        else if (markers === 'Active') {
            enableNonLGAInst(this.activeData, this.hhsQLD, this.lgaQLD);
        }
        else if (markers === 'Tests') {
            this.lgaNSW.addHeatMap(this.testsData);
        }
        else if (markers === 'Hospitals') {
            this.underlayBGCont.current.style.display = 'none';
            this.hospitalMarkers.forEach(
                (marker) => marker.show()
            );
        }
        else {
            throw "Unknown marker";
        }

        this.otherStatsSelectCont.style.display =
            (
                this._underlay === 'Other Stats' &&
                this._markers !== 'Hospitals'
            ) ? 'block' : 'none'
        ;

        // Make sure the map is fully loaded
        // before allowing a new change in tabs
        this.markersButtonGroup.current.style.pointerEvents = 'none';
        this.underlayButtonGroup.current.style.pointerEvents = 'none';
        this.otherStatsSelectCont.style.pointerEvents = 'none';

        function enableControlsWhenMapReady() {
            if (that.map.loaded()) {
                that._enableControlsJob = null;
                that.markersButtonGroup.current.style.pointerEvents = 'all';
                that.underlayButtonGroup.current.style.pointerEvents = 'all';
                that.otherStatsSelectCont.style.pointerEvents = 'all';
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
            lgaInst.removeLinePoly();
            lgaInst.removeFillPoly();
        }
        function clearMessages() {
            for (let key in messagesForModes) {
                let messages = messagesForModes[key];
                for (var j = 0; j < messages.length; j++) {
                    messages[j].current.style.display = 'none';
                }
            }
        }
        clearMessages();

        if (m === null) {
        }
        else if (m === 'Total') {
            disableInsts([
                this.sa3ACT, this.lgaNSW, this.lgaVic, this.lgaWA//, this.lgaSA
            ]);
            disableNonLGAInst(this.hhsQLD, this.lgaQLD);
            this.confirmedMarkers.forEach(
                (marker) => marker.hide()
            );
        }
        else if (m === '7 Days') {
            disableInsts([
                this.sa3ACT, this.lgaNSW, this.lgaVic, this.lgaWA//, this.lgaSA
            ]);
            disableNonLGAInst(this.hhsQLD, this.lgaQLD);
        }
        else if (m === '14 Days') {
            disableInsts([
                this.sa3ACT, this.lgaNSW, this.lgaVic, this.lgaWA//, this.lgaSA
            ]);
            disableNonLGAInst(this.hhsQLD, this.lgaQLD);
        }
        else if (m === 'Active') {
            disableNonLGAInst(this.hhsQLD, this.lgaQLD);
        }
        else if (m === 'Hospitals') {
            this.underlayBGCont.current.style.display = 'block';
            this.hospitalMarkers.forEach(
                (marker) => marker.hide()
            );
        }
    }
}


class DataSourceBase {
    constructor(sourceName) {
        this._sourceName = sourceName;
    }

    getSourceName() {
        return this._sourceName;
    }
}

class TimeSeriesDataSource extends DataSourceBase {
    /*
    A datasource which contains values over time

    In format:

     [[[...FIXME...]]]

     NOTE: state names/city names supplied to this
     class must be lowercased and have ' - ' replaced with '-'.
     This is way too resource-intensive to run otherwise!
    */

    constructor(sourceName, subHeader, mapAreaData, currentValues) {
        super(sourceName);
        this.subHeaderIndex = mapAreaData['sub_headers'].indexOf(subHeader);

        this.subHeader = subHeader;
        //this.currentValues = currentValues; // Can be null  CURRENTLY DISABLED - discuss whether this is really a good idea!!!
        this.data = mapAreaData['data'];
    }

    getCaseInfoForCity(stateName, cityName) {
        // Return only the latest value,
        // delegating to currentValues if possible
        // (currentValues as a CurrentValuesDataSource
        //  instance might contain human-entered values,
        //  which are less likely to contain errors)

        if (this.currentValues) {
            return this.currentValues.getCaseInfoForCity(
                stateName, cityName
            );
        }

        stateName = stateName.toLowerCase();
        cityName = prepareForComparison(cityName);

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iStateName = iData[0],
                iCityName = iData[1],
                iValues = iData[2];

            if (
                iStateName === stateName &&
                iCityName === cityName
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = iValues[j][0],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        return {
                            'numCases': parseInt(iValue),
                            'updatedDate': dateUpdated
                        }
                    }
                }
            }
        }
        return {
            'numCases': 0,
            'updatedDate': dateUpdated
        };
    }

    getCaseInfoTimeSeriesForCity(stateName, cityName) {
        var r = [];

        stateName = stateName.toLowerCase();
        cityName = prepareForComparison(cityName);

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iStateName = iData[0],
                iCityName = iData[1],
                iValues = iData[2];

            if (
                iStateName === stateName &&
                iCityName === cityName
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = iValues[j][0],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    if (iValue != null && iValue !== '') {
                        // May as well use CanvasJS format
                        r.push({
                            x: parseDate(dateUpdated).getTime(),
                            y: parseInt(iValue)
                        });
                    }
                }
            }
        }
        return r;
    }
}

class ActiveTimeSeriesDataSource extends TimeSeriesDataSource {
    // NOTE: This is only for states which don't supply
    // specfic info about which cases are active!!!
    constructor(sourceName, subHeader, mapAreaData, daysAgo) {
        super(sourceName, subHeader, mapAreaData, null);
        this.daysAgo = daysAgo;
    }

    getCaseInfoForCity(stateName, cityName) {
        // Return the latest value - the value 14 days ago,
        // to get a general idea of how many active cases there
        // still are. This isn't going to be very accurate,
        // but better than nothing.
        var oldest = null;
        var latest = super.getCaseInfoForCity(
            stateName, cityName
        );
        if (!latest) {
            return null;
        }

        stateName = stateName.toLowerCase();
        cityName = prepareForComparison(cityName);

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i];
            var iStateName = iData[0],
                iCityName = iData[1],
                iValues = iData[2];

            if (
                iStateName === stateName &&
                iCityName === cityName
            ) {
                for (var j = 0; j < iValues.length; j++) {
                    var dateUpdated = iValues[j][0],
                        iValue = iValues[j][this.subHeaderIndex + 1];

                    oldest = {
                        'numCases': latest['numCases'] - parseInt(iValue),
                        'updatedDate': latest['updatedDate']
                    };

                    if (dateDiffFromToday(dateUpdated) > this.daysAgo) {
                        return oldest;
                    }
                }
            }
        }

        // Can't do much if data doesn't go back
        // that far other than show oldest we can
        return oldest || {
            'numCases': 0,
            'updatedDate': latest['updatedDate']
        };
    }

    getCaseInfoTimeSeriesForCity(stateName, cityName) {
        var r = [];
        var values = super.getCaseInfoTimeSeriesForCity(
            stateName, cityName
        );

        for (var i = 0; i < values.length; i++) {
            var iData = values[i];
            if (dateDiff(new Date(iData.x), getToday()) > this.daysAgo) {
                continue;
            }
            r.push(iData);
        }
        return r;
    }
}


class CurrentValuesDataSource extends DataSourceBase {
    /*
    A datasource which only contains current values

    In format:

     [[[...FIXME...]]]
    */
    constructor(sourceName, mapAreaData) {
        super(sourceName);
        this.mapAreaData = mapAreaData;
    }

    getCaseInfoForCity(stateName, cityName) {
        var numberOfCases = 0,
            updatedDate = '16/4/20';

        stateName = stateName.toLowerCase();
        cityName = prepareForComparison(cityName);

        for (var i = 0; i < this.mapAreaData.length; i++) {
            var areaInfo = this.mapAreaData[i];
            if (stateName === areaInfo['state'].toLowerCase()) {
                if (
                    prepareForComparison(areaInfo['area']) === cityName &&
                    numberOfCases === 0
                ) {
                    numberOfCases = areaInfo['confirmedCases'];
                    updatedDate = areaInfo['lastUpdateDate'];
                }
            }
        }
        return {
            'numCases': parseInt(numberOfCases),
            'updatedDate': updatedDate
        };
    }
}

class BigTableOValuesDataSource extends DataSourceBase {
    /*
    A datasource which contains a subheader list, and
    corresponding data.
    (Note class instances of this only correspond to a single
     header/subheader!)

    Data in format:

     [STATE NAME??,
      LGA name,
      value for header 1/subheader 1,
      value for header 2/subheader 2,
      ...]

    This is useful for Australian Bureau of Statistics stats
    etc, where there are a lot of values in
    categories/subcategories, but we're only interested in
    the most recent ones. Much more space-efficient to do
    this than store in hash tables!

    Essentially this is a JSON equivalent of CSV, the CSV
    file being based on ones downloaded from ABS.
    */
    constructor(sourceName, header, subHeader, mapAreaData) {
        super(sourceName);
        this.header = header;
        this.subHeader = subHeader;
        this.subHeaderIndex = mapAreaData['sub_headers'].indexOf(subHeader);
        var today = getToday();
        this.updatedDate = (
            today.getDay() + '/' +
            today.getMonth() + '/' +
            today.getFullYear()
        );
        this.data = mapAreaData['data'];
    }

    getCaseInfoForCity(stateName, cityName) {
        stateName = stateName.toLowerCase();
        cityName = prepareForComparison(cityName);

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                iStateName = absStatsStates[iData[0]],
                iCityName = absStatsLGANames[iData[1]],
                value = iData[this.subHeaderIndex + 2];

            if (
                iStateName === stateName &&
                iCityName === cityName
            ) {
                return {
                    'numCases': value === '' ? null : value,
                    'updatedDate': this.updatedDate
                };
            }
        }
        //throw "value not found!";
    }

    getMaxMinValues() {
        var min = 99999999999,
            max = -99999999999,
            allVals = [];

        for (var i = 0; i < this.data.length; i++) {
            var iData = this.data[i],
                value = iData[this.subHeaderIndex + 2];

            if (value === '') { // value == null
                continue;
            }
            if (value > max) max = value;
            if (value < min) min = value;
            allVals.push(value);
        }

        allVals.sort();
        return {
            'max': max,
            'min': min,
            'median': allVals[Math.round(allVals.length / 2.0)]
        }
    }
}


class JSONGeoBoundariesBase {
    constructor(map, stateName, uniqueId, data) {
        this.map = map;
        this.stateName = stateName;
        this.uniqueId = uniqueId;
        this.addedSources = {};  // Using as a set

        var that = this;
        this._loadJSON(data).then(
            data => that._onLoadData(data)
        );
    }

    async _loadJSON(Data) {
        let geojsonData = await fetch(`${Data}`)
            .then(response => response.json())
            .then(responseData => {
                return responseData;
            });
        return geojsonData;
    }

    _onLoadData(data) {
        this.geoJSONData = data;
        this.pointGeoJSONData = this._getModifiedGeoJSONWithPolyCentralAreaPoints(
            this.geoJSONData
        );
    }

    /*******************************************************************
     * Unique IDs for sources and layers
     *******************************************************************/

    getHeatMapId() {
        return this.uniqueId+'heatmap';
    }
    getHeatPointId() {
        return this.uniqueId+'heatpoint';
    }
    getFillPolyId() {
        return this.uniqueId+'fillpoly';
    }
    getLinePolyId() {
        return this.uniqueId+'linepoly';
    }

    getHeatmapSourceId(dataSource) {
        // Get a unique ID for sources shared by the
        // auto-generated central points in the
        // middle of the polys for the heat maps
        return this.uniqueId+dataSource.getSourceName()+'heatmapsource';
    }
    getFillSourceId(dataSource) {
        // Get a unique ID for sources shared by fill/line polys
        return this.uniqueId+dataSource.getSourceName()+'fillsource';
    }

    /*******************************************************************
     * Fill poly-related
     *******************************************************************/

    addFillPoly(dataSource,
        opacity,
        addLegend,
        addPopupOnClick,
        addUnderLayerId) {

        // Add the colored fill area
        const map = this.map;
        this._associateSource(dataSource);  // FIXME: This will "freeze" the case source in cache, as popup events use this!! ===================================

        if (opacity == null) {
            opacity = 0.75;
        }

        // Display before the heatmap
        // (if one is displayed)
        var layers = map.getStyle().layers;
        var firstHeatmapId = null;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].type === 'heatmap') {
                firstHeatmapId = layers[i].id;
                break;
            }
        }

        var min, max, median;
        if (this.maxMinStatVal) {
            min = this.maxMinStatVal['min'];
            max = this.maxMinStatVal['max']; // HACK!
            // HACK - weight the median so we don't
            // get the same values more than once!
            median = (this.maxMinStatVal['median'] * 0.7) + ((min + (max - min)) * 0.3);
        }
        else {
            min = 0;
            median = 125;
            max = 250; // HACK!
        }

        var labels = [
            min,
            min + (median - min) * 0.25,
            min + (median - min) * 0.5,
            min + (median - min) * 0.75,
            median,
            median + (max - median) * 0.25,
            median + (max - median) * 0.5,
            median + (max - median) * 0.75,
            max
        ];
        var colors = [
            '#bae1ff',
            '#9ed0fb',
            '#83bff8',
            '#68adf4',
            '#4f9bef',
            '#3689e9',
            '#1e76e3',
            '#0463da',
            '#004fd0'
        ];

        var fillLayer = map.addLayer(
            {
                id: this.getFillPolyId(),
                type: 'fill',
                minzoom: 2,
                source: this.getFillSourceId(dataSource),
                paint: {
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'stat'],
                        labels[0], colors[0],
                        labels[1], colors[1],
                        labels[2], colors[2],
                        labels[3], colors[3],
                        labels[4], colors[4],
                        labels[5], colors[5],
                        labels[6], colors[6],
                        labels[7], colors[7],
                        labels[8], colors[8]
                    ],
                    'fill-opacity': opacity
                },
                filter: ['==', '$type', 'Polygon']
            },
            addUnderLayerId || firstHeatmapId
        );

        // Add legend/popup event as specified
        if (addLegend) {
            this._addLegend(dataSource, labels, colors);
        }

        if (addPopupOnClick) {
            this._addMapPopupEvent(this.getFillPolyId(), dataSource);
        }

        return {
            fillPolyId: this.getFillPolyId(),
            fillLayer: fillLayer
        };
    }

    removeFillPoly() {
        const map = this.map;
        map.removeLayer(this.getFillPolyId());

        if (this.legend) {
            this.legend.parentNode.removeChild(this.legend);
            this.legend = null;
        }
    }

    /*******************************************************************
     * Map legends
     *******************************************************************/

    _addLegend(dataSource, labels, colors) {
        this.removeLegend();

        var legend = this.legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.top = '10px';
        legend.style.left = '10px';
        legend.style.width = '10%';
        legend.style.minWidth = '75px';
        legend.style.background = 'rgba(255,255,255, 0.35)';
        legend.style.padding = '3px';
        legend.style.boxShadow = '0px 1px 5px 0px rgba(0,0,0,0.05)';
        legend.style.borderRadius = "2px";
        this.map.getCanvasContainer().appendChild(legend);

        var allBetween0_10 = true,
            sameConsecutive = false,
            lastNum = null;

        for (let i = 0; i < labels.length; i++) {
            if (!(labels[i] > -10.0 && labels[i] < 10.0)) {
                allBetween0_10 = false;
            }
            if (lastNum === parseInt(labels[i])) {
                sameConsecutive = true;
                break;
            }
            lastNum = parseInt(labels[i]);
        }

        for (let i = 0; i < labels.length; i++) {
            var label = labels[i],
                color = colors[i];

            var item = document.createElement('div');
            var key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;
            key.style.display = 'inline-block';
            key.style.borderRadius = '20%';
            key.style.width = '10px';
            key.style.height = '10px';

            var isPercent =
                dataSource.getSourceName().indexOf('(%)') !== -1;

            var value = document.createElement('span');
            value.innerHTML = (
                ((allBetween0_10 || sameConsecutive) && label <= 15) ? label.toFixed(1) : parseInt(label)
            ) + (
                    isPercent ? '%' : ''
                );
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }
    }

    removeLegend() {
        if (this.legend) {
            this.legend.parentNode.removeChild(this.legend);
            this.legend = null;
        }
    }

    /*******************************************************************
     * Map popups
     *******************************************************************/

    _addMapPopupEvent(useID, dataSource) {
        this.resetPopups();
        const map = this.map;
        var popup;
        var that = this;

        var click = function (e) {
            ReactGA.event({
                category: 'ConfirmMap',
                action: "StateClick",
                label: e.features[0].properties.city
            });

            var cityName = e.features[0].properties.city;
            var caseInfo = dataSource.getCaseInfoForCity(
                that.stateName, cityName
            );

            if (dataSource.getCaseInfoTimeSeriesForCity) {
                var timeSeries = dataSource.getCaseInfoTimeSeriesForCity(
                    that.stateName, cityName
                );

                popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(
                        cityName +
                        '<br/>Cases: ' + caseInfo['numCases'] +
                        '&nbsp;&nbsp;&nbsp;&nbsp;By: ' + caseInfo['updatedDate'] +
                        '<div id="chartContainer" ' +
                        'style="width: 200px; min-height: 60px; height: 13vh;"></div>'
                    )
                    .addTo(map);

                var chart = new CanvasJS.Chart("chartContainer", {
                    animationEnabled: true,
                    animationDuration: 200,
                    theme: "light2",
                    axisX: {
                        valueFormatString: "D/M",
                        gridThickness: 1
                    },
                    data: [{
                        type: "line",
                        dataPoints: timeSeries
                    }]
                });
                chart.render();

                document.getElementById('chartContainer').id = '';
            }
            else {
                popup = new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(
                        e.features[0].properties.city +
                        '<br/>Cases: ' + caseInfo['numCases'] +
                        '<br/>By: ' + caseInfo['updatedDate']
                    )
                    .addTo(map);
            }
        };
        map.on('click', useID, click);

        // Change the cursor to a pointer when
        // the mouse is over the states layer.
        var mouseEnter = function () {
            map.getCanvas().style.cursor = 'pointer';
        };
        map.on('mouseenter', useID, mouseEnter);

        // Change it back to a pointer when it leaves.
        var mouseLeave = function () {
            map.getCanvas().style.cursor = '';
        };
        map.on('mouseleave', useID, mouseLeave);

        this.resetPopupEvent = function () {
            map.off('click', useID, click);
            map.off('mouseenter', useID, mouseEnter);
            map.off('mouseleave', useID, mouseLeave);

            if (popup) {
                popup.remove();
                popup = null;
            }
        }
    }

    resetPopups() {
        if (this.resetPopupEvent) {
            this.resetPopupEvent();
            delete this.resetPopupEvent;
        }
    }

    /*******************************************************************
     * Line polys
     *******************************************************************/

    addLinePoly(dataSource, color) {
        // Add the line outline
        const map = this.map;
        this._associateSource(dataSource);

        var linePolyLayer = map.addLayer({
            id: this.getLinePolyId(),
            minzoom: 2,
            type: 'line',
            source: this.getFillSourceId(dataSource),
            paint: {
                'line-color': color || '#000',
                'line-opacity': 1,
                'line-width': 1,
            },
            filter: ['==', '$type', 'Polygon']
        });

        return {
            linePolyLayer: linePolyLayer
        };
    }

    removeLinePoly() {
        const map = this.map;
        map.removeLayer(this.getLinePolyId());
    }

    /*******************************************************************
     * Heat maps
     *******************************************************************/

    addHeatMap(dataSource) {
        const map = this.map;
        this._associateSource(dataSource);

        var heatMapLayer = map.addLayer(
            {
                'id': this.getHeatMapId(),
                'type': 'heatmap',
                'source': this.getHeatmapSourceId(dataSource),
                'maxzoom': 8,
                'paint': {
                    // Increase the heatmap weight based on frequency and property magnitude
                    'heatmap-weight': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        0, 0,
                        6, 1
                    ],
                    // Increase the heatmap color weight weight by zoom level
                    // heatmap-intensity is a multiplier on top of heatmap-weight
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, 1,
                        9, 3
                    ],
                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                    // Begin color ramp at 0-stop with a 0-transparancy color
                    // to create a blur-like effect.
                    'heatmap-color': [
                        'interpolate',
                        ['linear'],
                        ['heatmap-density'],
                        0, 'rgba(0,0,0,0)',
                        0.2, 'rgba(178,24,43,0.21)',
                        0.4, 'rgba(178,24,43,0.4)',
                        0.6, 'rgba(178,24,43,0.61)',
                        0.8, 'rgba(178,24,43,0.81)',
                        1.0, 'rgb(178,24,43)'
                    ],
                    // Adjust the heatmap radius by zoom level and value
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0, ['^', ['get', 'cases'], 0.6],
                        2, ['^', ['get', 'cases'], 0.6],
                        4, ['^', ['get', 'cases'], 0.6],
                        16, ['^', ['get', 'cases'], 0.6]
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    'heatmap-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6, 1,
                        8, 0
                    ]
                }
            }
        );

        var heatCirclesLayer = map.addLayer(
            {
                'id': this.getHeatPointId(),
                'type': 'circle',
                'source': this.getHeatmapSourceId(dataSource),
                'minzoom': 6,
                'paint': {
                    // Size circle radius by value
                    'circle-radius': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        1, 3,
                        5, 6,
                        10, 8,
                        50, 20,
                        100, 30,
                        300, 40
                    ],
                    // Color circle by value
                    'circle-color': [
                        'interpolate',
                        ['linear'],
                        ['get', 'cases'],
                        0, 'rgba(0,0,0,0.0)',
                        1, 'rgba(178,24,43,0.6)',
                        5, 'rgba(178,24,43,0.6)',
                        10, 'rgba(178,24,43,0.7)',
                        50, 'rgba(178,24,43,0.7)',
                        100, 'rgba(178,24,43,0.8)',
                        300, 'rgba(178,24,43,1.0)'
                    ],
                    // Transition from heatmap to circle layer by zoom level
                    'circle-opacity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        6, 0,
                        8, 1
                    ]
                }
            }
        );

        return {
            heatMapLayer: heatMapLayer,
            heatCirclesLayer: heatCirclesLayer
        };
    }

    removeHeatMap() {
        const map = this.map;
        map.removeLayer(this.getHeatPointId());
        map.removeLayer(this.getHeatMapId());
    }

    /*******************************************************************
     * Data processing
     *******************************************************************/

    _associateSource(dataSource) {
        if (dataSource instanceof BigTableOValuesDataSource) {
            // ABS stats
            this._associateStatSource(dataSource);
        }
        else {
            this._associateCaseNumsDataSource(dataSource);
        }
    }

    _associateCaseNumsDataSource(dataSource) {
        this._assignCaseInfoToGeoJSON(this.pointGeoJSONData, dataSource);
        let oid = this.getHeatmapSourceId(dataSource);
        if (!(oid in this.addedSources)) {
            console.log("ADDING HEATMAP SOURCE:"+oid);
            this.addedSources[oid] = null;
            this.map.addSource(oid, {
                type: 'geojson',
                data: this.pointGeoJSONData,
                tolerance: MAPBOX_TOLERANCE
            });
        }

        this._assignCaseInfoToGeoJSON(this.geoJSONData, dataSource);
        let fid = this.getFillSourceId(dataSource);
        if (!(fid in this.addedSources)) {
            console.log("ADDING FILL SOURCE:"+fid);
            this.addedSources[fid] = null;
            this.map.addSource(fid, {
                type: 'geojson',
                data: this.geoJSONData,
                tolerance: MAPBOX_TOLERANCE
            });
        }
    }

    _getModifiedGeoJSONWithPolyCentralAreaPoints(geoJSONData) {
        // Uses https://github.com/mapbox/polylabel
        // to get the central point of the polygon
        let r = {
            "type": "FeatureCollection",
            "features": [/*...*/]
        };
        var that = this;

        geoJSONData['features'].filter(
            (feature) => !!feature['geometry']
        ).map((feature) => {

            // First, collect as individual polygons,
            // as we can't work with MultiPolygons

            function collectCoordinates(coordinates) {
                r["features"].push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": coordinates
                    },
                    "properties": feature["properties"]
                });
            }

            if (feature['geometry']['type'] === 'MultiPolygon') {
                feature["geometry"]["coordinates"].forEach(
                    (coordinates) => collectCoordinates(coordinates)
                );
            }
            else if (feature['geometry']['type'] === 'Polygon') {
                collectCoordinates(feature["geometry"]["coordinates"]);
            }
            else {
                throw "Unknown geometry type: " +
                feature['geometry']['type'];
            }
        });

        // Ignore small islands etc, only adding a
        // heatmap to the polygons with the largest area

        function filterToOnlyLargestAreas(features) {
            var areaMap = {};

            for (let i = 0; i < features.length; i++) {
                var feature = features[i],
                    properties = feature['properties'];

                // WA data HACK!
                delete properties['lg_ply_pid'];
                delete properties['id'];

                var area = that._getArea(
                    feature['geometry']['coordinates']
                );

                function getUniqueKey(d) {
                    var r = [];
                    for (var k in d) {
                        r.push([k, d[k]])
                    }
                    r.sort();
                    return JSON.stringify(r);
                }

                var uniqueKey = getUniqueKey(properties); // WARNING!!! =============================================

                if (!(uniqueKey in areaMap) || areaMap[uniqueKey][0] < area) {
                    areaMap[uniqueKey] = [area, feature];
                }
            }

            var r = [];
            for (var k in areaMap) {
                // Convert from polygon to a single point
                areaMap[k][1]['geometry']['type'] = 'Point';
                areaMap[k][1]['geometry']['coordinates'] = getPointCoord(
                    areaMap[k][1]['geometry']['coordinates']
                );
                r.push(areaMap[k][1])
            }
            return r;
        }

        function getPointCoord(coordinates) {
            var center = that._findCenter(coordinates),
                pointCoord;

            if (that._canPutInCenter(center, coordinates)) {
                pointCoord = polylabel(
                    coordinates, 10.0
                );
                pointCoord = [
                    (pointCoord[0] + center[0]) / 2.0,
                    (pointCoord[1] + center[1]) / 2.0
                ];
            }
            else {
                pointCoord = polylabel(
                    coordinates, 0.5
                )
            }
            return pointCoord;
        }

        r["features"] = filterToOnlyLargestAreas(
            r["features"]
        );
        return r
    }

    _getArea(coordinates) {
        // Get approximate area of polygons
        var minX = 999999999999,
            minY = 999999999999,
            maxX = -999999999999,
            maxY = -999999999999;

        for (let i = 0; i < coordinates.length; i++) {
            for (let j = 0; j < coordinates[i].length; j++) {
                let x = coordinates[i][j][0],
                    y = coordinates[i][j][1];

                if (x > maxX) maxX = x;
                if (x < minX) minX = x;
                if (y > maxY) maxY = y;
                if (y < minY) minY = y;
            }
        }
        return (
            (maxX - minX) *
            (maxY - minY)
        );
    }

    _findCenter(coordinates) {
        var minX = 999999999999,
            minY = 999999999999,
            maxX = -999999999999,
            maxY = -999999999999;

        for (let i = 0; i < coordinates.length; i++) {
            for (let j = 0; j < coordinates[i].length; j++) {
                let x = coordinates[i][j][0],
                    y = coordinates[i][j][1];

                if (x > maxX) maxX = x;
                if (x < minX) minX = x;
                if (y > maxY) maxY = y;
                if (y < minY) minY = y;
            }
        }

        var centerX = minX + (maxX - minX) / 2.0,
            centerY = minY + (maxY - minY) / 2.0;
        return [centerX, centerY];
    }

    _canPutInCenter(point, vs) {
        // ray-casting algorithm based on
        // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        // (MIT license)

        var x = point[0], y = point[1];

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    _assignCaseInfoToGeoJSON(geoJSONData, dataSource) {
        var caseInfo;
        const state = this.stateName;

        for (var i = 0; i < geoJSONData.features.length; i++) {
            var data = geoJSONData.features[i];
            var cityName = this.getCityNameFromProperty(data);
            if (!cityName) {
                //console.log("NOT CITYNAME:", data)
                continue; // WARNING!!
            }

            caseInfo = dataSource.getCaseInfoForCity(
                state, cityName
            );
            if (!caseInfo) {
                //console.log("NOT CASE INFO:", state, cityName);
                continue; // WARNING!!! ===============================================================================
            }
            data.properties['cases'] = caseInfo['numCases'];

            data.properties['city'] = cityName;
        }
    }

    _associateStatSource(dataSource) {
        if (dataSource.getMaxMinValues) {
            this.maxMinStatVal = dataSource.getMaxMinValues();
        }
        this._assignStatInfoToGeoJSON(this.geoJSONData, dataSource); // RESOURCE VIOLATION WARNING!!! ===========================================

        let uniqueId = this.getFillSourceId(dataSource);
        if (uniqueId in this.addedSources) {
            return;
        }
        this.addedSources[uniqueId] = null;

        this.map.addSource(uniqueId, {
            type: 'geojson',
            data: this.geoJSONData,
            tolerance: MAPBOX_TOLERANCE
        });
    }

    _assignStatInfoToGeoJSON(geoJSONData, dataSource) {
        var statInfo;
        const state = this.stateName;

        for (var i = 0; i < geoJSONData.features.length; i++) {
            var data = geoJSONData.features[i];
            var cityName = this.getCityNameFromProperty(data);
            if (!cityName) {
                //console.log("NOT CITYNAME:", data)
                continue; // WARNING!!
            }
            statInfo = dataSource.getCaseInfoForCity(
                state, cityName
            );
            if (!statInfo) {
                //console.log("NOT STAT INFO:", state, cityName);
                continue; // WARNING!!! ===============================================================================
            }
            data.properties['stat'] = statInfo['numCases'];
            data.properties['statCity'] = cityName;
            data.properties['statDate'] = statInfo['updatedDate'];
        }
    }
}

class ACTSA3Boundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'ACT',
            'sa3_act',
            actSaData
        );
    }
    getCityNameFromProperty(data) {
        return data.properties['name'];
    }
}


class QLDHHSGeoBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'QLD',
            'hhs_qld',
            qldHhsData
        );
    }
    getCityNameFromProperty(data) {
        return data.properties.HHS;
    }
}

class WALGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'WA',
            'lga_wa',
            waLgaData
        );
    }
    getCityNameFromProperty(data) {
        return toTitleCase(data.properties.wa_lga_s_3);   // THIS COULD BE WHY THERE AREN'T MATCHES!!
    }
}

class NSWLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'NSW',
            'lga_nsw',
            nswLgaData
        );
    }
    getCityNameFromProperty(data) {
        return toTitleCase(data.properties.nsw_lga__3);   // THIS COULD BE WHY THERE AREN'T MATCHES!!
    }
}

class VicLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'VIC',
            'lga_vic',
            vicLgaData
        );
    }
    getCityNameFromProperty(data) {
        let city_name = data.properties.vic_lga__2;
        var city = city_name.split(" ");
        var city_type = city.slice(-1)[0];
        city.pop();
        city_name = city.join(' ');
        return toTitleCase(city_name);
    }
}

/*
class NTLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'NT',
            'lga_nt',
            ntLgaData
        );
    }
    getCityNameFromProperty(data) {
        return toTitleCase(data.properties['nt_lga_s_3']);
    }
}
*/

class QLDLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'QLD',
            'lga_qld',
            qldLgaData
        );
    }
    getCityNameFromProperty(data) {
        return data.properties['qld_lga__3'] ? toTitleCase(data.properties['qld_lga__3']) : null; // also has qld_lga__2 -- what is the difference?? ======================
    }
}

/*
class SALGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'SA',
            'lga_sa',
            saLgaData
        );
    }
    getCityNameFromProperty(data) {
        return toTitleCase(data.properties['abbname']);
    }
}
 */

/*
class TasLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(
            map,
            'TAS',
            'lga_tas',
            tasLgaData
        );
    }
    getCityNameFromProperty(data) {
        //console.log(data.properties['tas_lga__3'])
        return toTitleCase(data.properties['tas_lga__3']);
    }
}
 */

class ConfirmedMarker {
    constructor(map, item) {
        this.map = map;
        this.item = item;

        if (item['state'] === 'VIC' && item['area'].length > 0) {
            item['description'] =
                "This case number is just the suburb confirmed " +
                "number, not the case number at this geo point.";
            item['date'] = '26/3/20'
        }

        // create a HTML element for each feature
        var el = this.el = document.createElement('div');

        this._setStyles(el);
        this._addMarker(el);
        this.hide();
    }

    show() {
        if (this._marker)
            return;
        this.el.style.display = 'block';
        this._addMarker(this.el);
    }
    hide() {
        this.el.style.display = 'none';
        if (!this._marker)
            return;
        this._marker.remove();
        delete this._marker;
    }

    _setStyles() {
        const el = this.el;
        el.className = 'marker';
        el.style.height = '20px';
        el.style.width = '20px';
        el.style.backgroundSize = 'cover';
        if (this._isOld(this.item['date'])) {
            el.style.backgroundImage = `url(${confirmedOldImg})`;
        } else {
            el.style.backgroundImage = `url(${confirmedImg})`;
        }
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
    }
    _isOld(date) {
        // Check if a date was more than two weeks ago
        // Working with raw data, so try-catch just in case

        try {
            // 'DD/MM/YY' format
            // Assume entries with incorrect formats are old
            const eventDay = date.split("/");
            if (eventDay.length !== 3 || eventDay === 'N/A') { return true; }

            // Default constructor has current time
            const today = new Date();

            // Day of the event. Transform to YYYY/MM/DD format
            const day = eventDay[0], month = parseInt(eventDay[1]) - 1;
            const year = '20' + eventDay[2];
            let caseDate = new Date(year, month, day);

            // Add two weeks for comparison
            caseDate.setDate(caseDate.getDate() + oldCaseDays);

            // True iff the original date was more than two weeks old
            if (today > caseDate) {
                return true;
            } else {
                return false;
            }
        } catch {
            return true;
        }
    }
    _addMarker() {
        const map = this.map;
        let coor = [
            this.item['coor'][1],
            this.item['coor'][0]
        ];

        // make a marker for each feature and add to the map
        this._marker = new mapboxgl
            .Marker(this.el)
            .setLngLat(coor)
            .setPopup(
                new mapboxgl
                    .Popup({ offset: 25 }) // add popups
                    .setHTML(
                        '<h3 style="margin:0;">' + this.item['name'] + '</h3>' +
                        '<p style="margin:0;">' + this.item['date'] + '</p>' +
                        '<p style="margin:0;">' + this.item['description'] + '</p>'
                    )
            )
            .addTo(map);
    }
}

class HospitalMarker {
    constructor(map, item) {
        this.map = map;
        this.item = item;

        // create a HTML element for each feature
        var el = this.el = document.createElement('div');

        this._setStyles(el);
        this._addMarker(el);
        this.hide();
    }

    show() {
        if (this._marker)
            return;
        this.el.style.display = 'block';
        this._addMarker(this.el);
    }
    hide() {
        this.el.style.display = 'none';
        if (!this._marker)
            return;
        this._marker.remove();
        delete this._marker;
    }

    _setStyles() {
        const el = this.el;
        el.className = 'marker';
        el.style.height = '20px';
        el.style.width = '20px';
        el.style.backgroundSize = 'cover';
        el.style.backgroundImage = `url(${hospitalImg})`;
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
    }
    _addMarker(el) {
        let coor = [
            this.item['coor'][1],
            this.item['coor'][0]
        ];

        // make a marker for each feature and add to the map
        new mapboxgl
            .Marker(el)
            .setLngLat(coor)
            .setPopup(
                new mapboxgl
                    .Popup({ offset: 25 }) // add popups
                    .setHTML(
                        '<h3 style="margin:0;">' + this.item['name'] + '</h3>' +
                        '<p style="margin:0;">Phone: ' + this.item['hospitalPhone'] + '</p>' +
                        '<p style="margin:0;">Addr: ' + this.item['address'] + '</p>'
                    )
            )
            .addTo(this.map);
    }
}

export default MbMap

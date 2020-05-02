import React from "react";
import mapboxgl from 'mapbox-gl';
import confirmedData from "../data/mapdataCon"
import hospitalData from "../data/mapdataHos"
import mapDataArea from "../data/mapdataarea"

import regionsTimeSeries from "../data/regionsTimeSeriesAutogen.json"
import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import confirmedImg from '../img/icon/confirmed-recent.png'
import confirmedOldImg from '../img/icon/confirmed-old.png'
import hospitalImg from '../img/icon/hospital.png'
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Radio from '@material-ui/core/Radio';
import Acknowledgement from "../Acknowledgment"

import { sortedKeys } from "./ConfirmedMapFns"
import { absStats } from "./ConfirmedMapGeoBoundaries"
import { ConfirmedMarker, HospitalMarker } from "./ConfirmedMapMarkers"

//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;

// Threshold for an 'old case', in days
const oldCaseDays = 14;


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

                {/*<div>
                    <span className="key" style={{ alignSelf: "flex-end", marginBottom: "0.8rem" }}>
                        :&nbsp;<ButtonGroup
                            size="small"
                            aria-label="small outlined button group"
                            style={{ pointerEvents: "none" }}>
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
                </div>*/}

                <div ref={this.underlayBGCont}>
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
                </div>

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
            this._selectedUnderlay = null;
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

            if (that._selectedUnderlay) {
                lgaInst.addLinePoly(
                    that.absStatsInsts[that._selectedUnderlay],
                    'rgba(0, 0, 0, 0.1)'
                );
                lgaInst.addFillPoly(
                    that.absStatsInsts[that._selectedUnderlay],
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

            if (that._selectedUnderlay) {
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


export default MbMap

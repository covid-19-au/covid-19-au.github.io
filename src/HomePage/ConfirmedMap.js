import React from "react"
import mapboxgl from 'mapbox-gl'
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import Acknowledgement from "../Acknowledgment"
import CovidMapControl from "./ConfirmedMap/CovidMapControl"
import RegionalCasesTreeMap from "./CrawlerDataVis/RegionalCases/RegionalCasesTreeMap"
import RegionalCasesBarChart from "./CrawlerDataVis/RegionalCases/RegionalCasesBarChart";
import MultiDataTypeBarChart from "./CrawlerDataVis/MultiDataTypeBarChart"
import RegionType from "./CrawlerDataTypes/RegionType";
import BubbleChart from "./CrawlerDataVis/RegionalCases/BubbleChart"
import PopulationPyramid from "./CrawlerDataVis/AgeCharts/PopulationPyramid"

//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;


class ConfirmedMap extends React.Component {
    constructor({ stateName }) {
        super({ stateName });
        this.state = {};
        this.showStateTabs = !stateName;
        this.stateName = stateName || 'AU';

        this.stateUpdatedDates = []; // FIXME!!!
        this.accuracyWarning = React.createRef();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    render() {
        let tabStyle = {
            minWidth: '8%',
            textTransform: 'none',
            padding: '0 2%',
            fontSize: 'calc(11px + 4 * ((100vw - 300px) / (1600 - 300)))',
            color: 'gray'
        };
        let tabActiveStyle = {
            minWidth: '8%',
            textTransform: 'none',
            padding: '0 2%',
            fontSize: 'calc(11px + 4 * ((100vw - 300px) / (1600 - 300)))',
            color: 'black',
            background: 'rgb(232, 244, 253)'
        };

        return (
            <div>
                <Paper>
                    <Tabs
                    value={this.state ? this.state.iso_3166_2_tabs : 'AU'}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, newValue) => this.__restrictToISO_3166_2(newValue)}
                    ref={(el) => this.iso_3166_2_tabs = el}
                    style={{
                        display: this.showStateTabs ? 'block' : 'none'
                    }}>
                        <Tab style={this.state.iso_3166_2_tabs === 'all' ? tabActiveStyle : tabStyle} label="World" value="all" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU' ? tabActiveStyle : tabStyle} label="Australia" value="AU" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU-VIC' ? tabActiveStyle : tabStyle} label="Vic" value="AU-VIC" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU-NSW' ? tabActiveStyle : tabStyle} label="NSW" value="AU-NSW" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU-TAS' ? tabActiveStyle : tabStyle} label="Tas" value="AU-TAS" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU-SA' ? tabActiveStyle : tabStyle} label="SA" value="AU-SA" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU-WA' ? tabActiveStyle : tabStyle} label="WA" value="AU-WA" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU-ACT' ? tabActiveStyle : tabStyle} label="ACT" value="AU-ACT" />
                        <Tab style={this.state.iso_3166_2_tabs === 'AU-NT' ? tabActiveStyle : tabStyle} label="NT" value="AU-NT" />
                    </Tabs>
                </Paper>

                <div style={{position: 'relative'}}>
                    <CovidMapControl ref={el => this.covidMapControl = el} >
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
            </div>
        );
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

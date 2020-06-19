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
import TimeSeriesDataSource from "./CrawlerData/CasesData"
import TimeSeriesDataSourceForPeriod from "./CrawlerData/CasesDataPeriod"
import ConfirmedMapShipsData from "./CrawlerData/DEPRECATED/DataShips"
import BigTableOValuesDataSource from "./CrawlerData/DEPRECATED/DataABS"
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
            zoom: 2
        };
        this._firstTime = true;
        this.stateUpdatedDates = [];
        this.geoBoundaries = new GeoBoundaries();

        this.accuracyWarning = React.createRef();
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
                    <CovidMapBoxControl ref={el => this.covidMapBoxControl = el} >
                    </CovidMapBoxControl>

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

    onCovidMapBoxControlLoad() {
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


        this.markersSelect.current.onchange = () => {
            this.setMarkers();
        };

        this._updateMode();
        this.forceUpdate();
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
    }

    componentWillUnmount() {
    }
}

export default MbMap

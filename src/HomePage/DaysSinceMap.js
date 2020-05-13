import React from "react";
import mapboxgl from 'mapbox-gl';
import regionsData from "../data/regionsTimeSeries.json"
import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import Acknowledgement from "../Acknowledgment"
import TimeSeriesDataSource from "./ConfirmedMap/DataCases"
import GeoBoundaries from "./ConfirmedMap/GeoBoundaries" // FIXME!


const regionsTimeSeries = regionsData['time_series_data'],
      regionsDateIDs = regionsData['date_ids'];


//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;


class DaysSinceMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lng: 133.751567,
            lat: -26.344589,
            zoom: 2,
            showMarker: true
        };
        this.geoBoundaries = new GeoBoundaries();

        this.statesAndTerritories = [
            'act', 'nsw', 'vic', 'tas', 'wa', 'nt', 'qld', 'sa'
        ];
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div className="card" style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h2 style={{ display: "flex" }}
                    aria-label="Days Since Last Case">Days Since Last Case<div style={{
                        alignSelf: "flex-end",
                        marginLeft: "auto",
                        fontSize: "60%"
                    }}>
                        <Acknowledgement>
                        </Acknowledgement></div></h2>

                <div style={{position: 'relative'}}>
                    <div ref={el => this.mapContainer = el} >

                    </div>
                </div>
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

        var bounds = [
            [101.6015625, -49.83798245308484], // Southwest coordinates
            [166.2890625, 0.8788717828324276] // Northeast coordinates
        ];

        const map = this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v9',
            center: [lng, lat],
            zoom: zoom,
            maxZoom: 9.5,
            maxBounds: bounds // Sets bounds as max
        });

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
            if (key === 'tas:lga' || key === 'tas:ths') {
                // HACK: Tas LGA is every week currently, so isn't as useful for day counts
                continue;
            }
            else if (!regionsTimeSeries[key] || regionsTimeSeries[key]['sub_headers'].indexOf('total') === -1) {
                continue;
            }

            caseDataInsts[key] = new TimeSeriesDataSource(
                key, 'total',
                regionsTimeSeries[key],
                regionsDateIDs,
                key.split(":")[1],
                key.split(":")[0]
            );
        }

        map.on('load', () => {
            setTimeout(() => {
                // Create map data instances
                var geoBoundaryInsts = this.geoBoundaryInsts = {};
                for (var key in caseDataInsts) {
                    geoBoundaryInsts[key] = this.geoBoundaries.getGeoBoundary(
                        map, key.split(":")[1], key.split(":")[0]
                    );
                }

                this.statesAndTerritories.forEach((stateName) => {
                    var caseDataInst = this.getCaseDataInst(stateName);
                    if (!caseDataInst) {
                        return;
                    }

                    var caseGeoBoundariesInst = this.getGeoBoundariesInst(stateName, caseDataInst.schema);
                    if (!caseGeoBoundariesInst) {
                        return;
                    }
                    caseGeoBoundariesInst.addLinePoly(caseDataInst);

                    caseGeoBoundariesInst.addDaysSince(caseDataInst);
                    caseGeoBoundariesInst.addFillPoly(
                        null,
                        caseDataInst,
                        0,
                        false,
                        true
                    );
                })
                }, 500)

        });
    }

    componentWillUnmount() {
        this.map.remove();
        this.geoBoundaries.clearGeoBoundaryCache();
    }

    /*******************************************************************
     * Mode update
     *******************************************************************/

    getCaseDataInst(stateName) {
        // stateName -> Australian state name
        // state -> React JS state, to allow for providing
        // the previous state when changing pages

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
            var key = `${stateName}:${schema}`;
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
}

export default DaysSinceMap

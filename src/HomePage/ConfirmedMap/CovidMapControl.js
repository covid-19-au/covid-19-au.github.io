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
import mapboxgl from "mapbox-gl";
import CovidMapControls from "./MapControls/CovidMapControls";
import DataDownloader from "../CrawlerData/DataDownloader";

import DaysSinceLayer from "./Layers/cases/DaysSinceLayer";
import CasesFillPolyLayer from "./Layers/cases/CasesFillPolyLayer";
import UnderlayFillPolyLayer from "./Layers/underlay/UnderlayFillPolyLayer";
import CaseCirclesLayer from "./Layers/cases/CaseCirclesLayer";
import LinePolyLayer from "./Layers/LinePolyLayer";

import MapBoxSource from "./Sources/MapBoxSource";
import ClusteredCaseSources from "./Sources/ClusteredCaseSources";
import GeoData from "../CrawlerData/GeoData"
import CasesData from "../CrawlerData/CasesData"


class CovidMapControl extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);
        this.dataDownloader = new DataDownloader();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div>
                <CovidMapControls ref={el => this.covidMapControls = el}
                                  onchange={this._onControlsChange} />
                <div ref={el => this.mapContainer = el} >
                </div>
            </div>
        )
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        const map = this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            zoom: 1,
            maxZoom: 10,
            minZoom: 0,
            transition: {
                duration: 0,
                delay: 0
            },
            fadeDuration: 0
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

        map.on('load', () => {
            // Create the MapBox sources
            let underlaySource = this.underlaySource = new MapBoxSource(map);
            let casesSource = this.casesSource = new MapBoxSource(map);
            let clusteredCaseSources = this.clusteredCaseSources = new ClusteredCaseSources(map);

            // Add layers for the underlay
            this.underlayFillPoly = new UnderlayFillPolyLayer(
                map, 'underlayFillPoly', underlaySource
            );
            this.underlayLinePoly = new LinePolyLayer(
                map, 'underlayLinePoly', 'rgba(0,0,0,0.3)', 1.0, underlaySource
            );

            // Add layers for cases
            this.daysSinceLayer = new DaysSinceLayer(
                map, 'daysSinceLayer', casesSource
            );
            this.casesFillPolyLayer = new CasesFillPolyLayer(
                map, 'casesFillPolyLayer', casesSource
            );
            this.casesLinePolyLayer = new LinePolyLayer(
                map, 'casesLinePolyLayer', 'gray', 1.0, casesSource
            );
            this.caseCirclesLayer = new CaseCirclesLayer(
                map, 'heatMap', clusteredCaseSources
            );

            // Bind events for loading data
            map.on('moveend', () => {
                this.onMapMoveChange();
            });
            map.on('zoomend', () => {
                this.onMapMoveChange();
            });

            if (this.props.onload) {
                this.props.onload(this, map);
            }
        });

    }

    /*******************************************************************
     * MapBox GL Events
     *******************************************************************/

    /**
     * Download any static/case data based on the
     * countries/regions in view, and hide/show as needed!
     */
    onMapMoveChange() {
        let zoomLevel = this.map.getZoom(),
            lngLatBounds = this.map.getBounds(); // CHECK ME!!
        let schemasForCases = this.dataDownloader.getPossibleSchemasForCases(
            zoomLevel, lngLatBounds
        );
        this._onMapMoveChange(zoomLevel, lngLatBounds, schemasForCases);
    }

    /**
     *
     * @param zoomLevel
     * @param lngLatBounds
     * @param schemasForCases
     * @returns {Promise<void>}
     * @private
     */
    async _onMapMoveChange(zoomLevel, lngLatBounds, schemasForCases) {
        var promises = [];
        let dataType = this.covidMapControls.getDataType();

        for (let key of schemasForCases.keys()) {
            let [parentSchema, parentISO] = key;
            console.log(`${parentSchema}, ${parentISO}`)
            let [priority, regionSchema, iso3166Codes] = schemasForCases.get(key);

            if (iso3166Codes) {
                for (let iso3166 of iso3166Codes) {
                    promises.push([
                        this.dataDownloader.getGeoData(regionSchema, iso3166),
                        this.dataDownloader.getCaseData(dataType, regionSchema, iso3166)
                    ]);
                }
            }
            else {
                promises.push([
                    this.dataDownloader.getGeoData(regionSchema, null),
                    this.dataDownloader.getCaseData(dataType, regionSchema, null)
                ]);
            }
        }

        let points = {
            "type": "FeatureCollection",
            "features": []
        },  polygons = {
            "type": "FeatureCollection",
            "features": []
        };

        let geoDataInsts = this.geoDataInsts = [];
        let caseDataInsts = this.caseDataInsts = [];

        let assign = (geoData, caseData) => {
            let iPoints = geoData.getCentralPoints(),
                iPolygons = geoData.getPolygonOutlines();

            iPoints['features'] = caseData.assignCaseInfoToGeoJSON(iPoints['features'], null);
            iPolygons['features'] = caseData.assignCaseInfoToGeoJSON(iPolygons['features'], null);

            points['features'].push(...iPoints['features']);
            polygons['features'].push(...iPolygons['features']);

            geoDataInsts.push(geoData);
            caseDataInsts.push(caseData);
        };

        for (let [geoDataPromise, caseDataPromise] of promises) {
            let geoData = await geoDataPromise,
                caseData = await caseDataPromise;

            if (geoData instanceof GeoData) {
                assign(geoData, caseData);
            }
            else {
                for (let k in geoData) {
                    console.log(`ASSIGNING: ${k} ${geoData[k] instanceof GeoData} ${caseData[k] instanceof CasesData} ${caseData instanceof CasesData}`);
                    if (!caseData[k]) continue;
                    assign(geoData[k], caseData[k]);
                }
            }
        }

        this.clusteredCaseSources.setData(points);
        this.casesSource.setData(polygons);
        this._updateMode();
    }

    /*******************************************************************
     * Disable controls while loading
     *******************************************************************/

    /**
     * Wait for the map to fully load before enabling the controls
     *
     * @private
     */
    enableControlsWhenMapReady() {
        this.covidMapControls.disable();

        let _enableControlsWhenMapReady = () => {
            if (this.map.loaded()) {
                this._enableControlsJob = null;
                this.covidMapControls.enable();
            }
            else {
                this._enableControlsJob = setTimeout(
                    _enableControlsWhenMapReady, 50
                );
            }
        };

        if (this._enableControlsJob != null) {
            clearTimeout(this._enableControlsJob);
        }
        this._enableControlsJob = setTimeout(
            _enableControlsWhenMapReady, 50
        );
    }

    /*******************************************************************
     * Mode update
     *******************************************************************/

    /**
     *
     * @private
     */
    _onControlsChange() {
        this._updateMode();
    }

    /**
     *
     * @private
     */
    _updateMode() {
        // Get the absolute max/min values among all the datasources
        // so that we can scale heatmap values for the entire of the
        // country
        var otherMaxMin = null;

        this.caseDataInsts.forEach((caseDataInst) => {
            var iMaxMinValues = caseDataInst.getMaxMinValues();

            if (!otherMaxMin) {
                otherMaxMin = iMaxMinValues
            }
            if (iMaxMinValues['max'] > otherMaxMin['max']) {
                otherMaxMin['max'] = iMaxMinValues['max'];
            }
            if (iMaxMinValues['min'] < otherMaxMin['min']) {
                otherMaxMin['min'] = iMaxMinValues['min'];
            }
        });

        this.casesFillPolyLayer.addLayer();
        this.casesLinePolyLayer.addLayer();
        this.caseCirclesLayer.addLayer();
    }
}

export default CovidMapControl;

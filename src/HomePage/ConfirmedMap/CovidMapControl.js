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
                                  onchange={(e) => this._onControlsChange(e)} />
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
            maxZoom: 12,
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
    async onMapMoveChange() {
        if (this.covidMapControls.getDisabled()) {
            return;
        }

        let zoomLevel = this.map.getZoom(),
            lngLatBounds = this.map.getBounds(),
            iso3166WithinView = this.dataDownloader.getISO3166WithinView(lngLatBounds),
            schemasForCases = this.dataDownloader.getPossibleSchemasForCases(
                zoomLevel, iso3166WithinView
            ),
            dataType = this.covidMapControls.getDataType();

        if (this.prevSchemasForCases) {
            let changed = this.dataDownloader.caseDataForZoomAndCoordsChanged(
                zoomLevel,
                this.prevDataType, this.prevSchemasForCases,
                dataType, schemasForCases
            );
            if (!changed) {
                return;
            }
        }

        // Prevent interacting with map while it's not ready
        this.enableControlsWhenMapReady();

        let geoData = await this.dataDownloader.getCaseDataForZoomAndCoords(
            zoomLevel, lngLatBounds, dataType, schemasForCases, iso3166WithinView
        );
        this.clusteredCaseSources.setData(geoData.points);
        this.casesSource.setData(geoData.polygons);
        this.geoDataInsts = geoData.geoDataInsts;
        this.caseDataInsts = geoData.caseDataInsts;

        this.prevSchemasForCases = geoData.schemasForCases;
        this.prevDataType = dataType;

        // Get the absolute max/min values among all the datasources
        // so that we can scale heatmap values for the entire of the
        // country
        /*var otherMaxMin = null;

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
        });*/

        this.casesFillPolyLayer.addLayer();
        this.casesLinePolyLayer.addLayer();
        this.caseCirclesLayer.addLayer(geoData.points.caseVals);
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
        let points = {
            "type": "FeatureCollection",
            "features": []
        },  polygons = {
            "type": "FeatureCollection",
            "features": []
        };

        this.clusteredCaseSources.setData(points);
        this.casesSource.setData(polygons);
        this.onMapMoveChange();
    }
}

export default CovidMapControl;

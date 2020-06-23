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
import "./schema_types";
import mapboxgl from "mapbox-gl";
import CovidMapControls from "./MapControls/CovidMapControls";
import DataDownloader from "../CrawlerData/DataDownloader";

import LayerDaysSince from "./Layers/DaysSinceLayer";
import LayerFillPoly from "./Layers/CasesFillPolyLayer";
import LayerHeatMap from "./Layers/CaseCirclesLayer";
import LayerLinePoly from "./Layers/LinePolyLayer";

import MapBoxSource from "./Sources/MapBoxSource";
import ClusteredCaseSources from "./Sources/ClusteredCaseSources";


class CovidMapControl extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.schemas = FXIME;
        this.dataDownloader = new DataDownloader();

        let casesSource = this.casesSource = new MapBoxSource(

        );
        let clusteredCaseSources = this.clusteredCaseSources = new ClusteredCaseSources(

        );

        this.layerDaysSince = new LayerDaysSince(
            this.map, 'daysSince', casesSource
        );
        /*
        map,
        opacity,
        addLegend,
        addPopupOnClick,
        maxMinStatVal,
        addUnderLayerId,
        uniqueId,
        casesMapBoxSource
         */
        this.underlayFillPoly = new LayerFillPoly(
            this.map, 0.0, true,
            null, 'underlayFillPoly', casesSource
        );
        this.underlayLinePoly = new LayerLinePoly(
            this.map, 'underlayLinePoly', 'rgba(0,0,0,0.3)', casesSource
        );
        this.casesFillPoly = new LayerFillPoly(
            this.map, 0.7, true,
            null, 'casesFillPoly', casesSource
        );
        this.casesLinePoly = new LayerLinePoly(
            this.map, 'casesLinePoly', 'gray', casesSource
        );
        this.casesHeatMap = new LayerHeatMap(
            this.map, 'heatMap', maxMinValues, clusteredCaseSources
        );
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div>
                <CovidMapControls onchange={this.onControlsChange} />

                <div ref={el => this.mapContainer = el} >
                </div>
            </div>
        )
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        const lng = this.state['lng'],
              lat = this.state['lat'],
              zoom = this.state['zoom'];
        this._firstTime = true;

        var australiaBounds = [
            [101.6015625, -49.83798245308484], // Southwest coordinates
            [166.2890625, 0.8788717828324276] // Northeast coordinates
        ];

        const map = this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [lng, lat],
            zoom: zoom,
            maxZoom: 9.5,
            minZoom: 1,
            //maxBounds: australiaBounds, // Sets bounds as max
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

        map.on('load', () => {
            this.props.onload(this, map);
        });
        map.on('moveend', () => {
            this.onMapMoveChange();
        });
        map.on('zoomend', () => {
            this.onMapMoveChange();
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
            lngLatBounds = this.map.getBoundingRect(); // CHECK ME!!
        let schemasForCases = this.dataDownloader.getPossibleSchemasForCases(
            zoomLevel, lngLatBounds
        );


        this._onMapMoveChange(zoomLevel, lngLatBounds, schemasForCases);
    }

    async _onMapMoveChange(zoomLevel, lngLatBounds, schemasForCases) {
        var promises = [];

        for (let [parentSchema, parentISO] of schemasForCases.keys()) {
            let [priority, regionSchema, iso3166Codes] = schemasForCases.get(
                [parentSchema, parentISO]
            );
            if (iso3166Codes) {
                for (let iso3166 of iso3166Codes) {
                    promises.push([
                        this.dataDownloader.getGeoData(regionSchema, iso3166),
                        this.dataDownloader.getCaseData(regionSchema, iso3166)
                    ]);
                }
            }
            else {
                promises.push([
                    this.dataDownloader.getGeoData(regionSchema, null),
                    this.dataDownloader.getCaseData(regionSchema, null)
                ]);
            }
        }

        let points = [],
            polygons = [];

        for (let [geoDataPromise, caseDataPromise] of promises) {
            let geoData = await geoDataPromise,
                caseData = await caseDataPromise;

            let iPoints = geoData.getCentralPoints(),
                iPolygons = geoData.getPolygonOutlines();

            iPoints['features'] = caseData.assignCaseInfoToGeoJSON(iPoints['features'], null);
            iPolygons['features'] = caseData.assignCaseInfoToGeoJSON(iPolygons['features'], null);

            points['features'].push(...iPoints['features']);
            polygons['features'].push(...iPolygons['features']);
        }

        this.clusteredCaseSources.setData(points);
        this.caseSource.setData(polygons);
    }

    /*******************************************************************
     * Enable/Disable Map+Controls
     *******************************************************************/

    /**
     *
     * @private
     */
    disable() {
        this.covidMapControls.disable()
    }

    /**
     *
     * @private
     */
    enable() {
        this.covidMapControls.enable()
    }

    /**
     *
     * @private
     */
    enableControlsWhenMapReady() {
        var _enableControlsWhenMapReady = () => {
            if (this.map.loaded()) {
                this._enableControlsJob = null;
                this.enable();
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
    _updateMode() {
        // Get the absolute max/min values among all the datasources
        // so that we can scale heatmap values for the entire of the
        // country
        var otherMaxMin = null;

        this.statesAndTerritories.forEach((stateName) => {
            var caseDataInst = this.getCaseDataInst(stateName);
            if (!caseDataInst) {
                return;
            }
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
    }

    /**
     *
     * @param prevState
     * @private
     */
    _resetMode(prevState) {

    }
}
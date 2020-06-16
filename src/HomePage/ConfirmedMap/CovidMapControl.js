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


class CovidMapControl extends React.Component {
    /**
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.schemas = FXIME;
        this.admin0Coords = FIXME;
        this.admin1Coords = FIXME;

        this.constantSelect = FIXME;
        this.dataTypes = FIXME;

        this.staticDataListing = FIXME;
        this.caseDataListing = FIXME;

        this.staticData = {};
        this.caseData = {};

        this.displayedSchemaInsts = [];
        this.displayedCaseDataInsts = [];

        this.covidDataDownloader = new DataDownloader();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div>
                <CovidMapControls>

                </CovidMapControls>

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
    }

    /*******************************************************************
     * MapBox GL Events
     *******************************************************************/

    /**
     *
     */
    onMapMoveChange() {
        // TODO: Download any static/case data based on the
        //  countries/regions in view, and hide/show as needed!

        this.schemaTypeSelect.setPossibleOptions(
            this.getPossibleSchemaTypeSelectOptions()
        );
    }

    //========================================================//
    //              Enable/Disable Map+Controls               //
    //========================================================//

    /**
     *
     * @private
     */
    _disableControls() {
        this.mapContainer.style.pointerEvents = 'none';
        this.dsMapContainer.style.pointerEvents = 'none';
    }

    /**
     *
     * @private
     */
    _enableControls() {
        this.mapContainer.style.pointerEvents = 'all';
        this.dsMapContainer.style.pointerEvents = 'all';
    }

    /**
     *
     * @private
     */
    _enableControlsWhenMapReady() {
        var _enableControlsWhenMapReady = () => {
            if (this.map.loaded()) {
                this._enableControlsJob = null;
                this._enableControls();
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

    //========================================================//
    //                     Miscellaneous                      //
    //========================================================//

    /**
     *
     * @param long
     * @param lat
     * @param bounds
     * @returns {*}
     */
    mapContainsCoord(long, lat, bounds) {
        bounds = bounds || this.map.getBounds();
        return bounds.contains([long, lat]);
    }

    /**
     *
     * @param long1
     * @param lat1
     * @param long2
     * @param lat2
     * @param bounds
     * @returns {*}
     */
    mapIntersects(long1, lat1, long2, lat2, bounds) {
        bounds = bounds || this.map.getBounds();

        return (
            bounds.contains([long1, lat1]) ||
            bounds.contains([long1, lat2]) ||
            bounds.contains([long2, lat1]) ||
            bounds.contains([long2, lat2])
        );
    }

    //========================================================//
    //                     Change Schemas                     //
    //========================================================//

    /**
     *
     * @returns {[]}
     */
    getPossibleSchemaTypes() {
        var admin0InView = this.getAdmin0InView(),
            mapZoom = this.map.getZoom(),
            r = [];

        for (var schema in this.schemas) {
            /*
            schemaInfo ->
            {
                "iso_3166": "TH",
                "min_zoom": 8,
                "priority": -1,
                "line_width": 0.5,
                "split_by_parent_region": false
            }
             */
            var schemaInfo = this.schemas[schema];

            if (schemaInfo.min_zoom != null && mapZoom <= schemaInfo.min_zoom) {
                continue;
            }
            else if (schemaInfo.max_zoom != null && mapZoom >= schemaInfo.max_zoom) {
                continue;
            }
            r.push(schema);
        }
        return r;
    }

    /**
     * Find which admin0-level units (i.e. countries) are visible
     *
     * Returns an object of e.g. {'AU': true, 'US': false, ...}
     *
     * @returns {{}}
     */
    getAdmin0InView() {
        /*

         */
        return this.__getCoordsInView(this.admin0Coords);
    }

    /**
     * Find which admin1-level units (i.e. states/territories/provinces) are visible
     *
     * Returns an object of e.g. {'AU-VIC': false, 'AU-WA': true, 'JP-01': false, ...}
     *
     * @returns {{}}
     */
    getAdmin1InView() {
        return this.__getCoordsInView(this.admin1Coords);
    }

    /**
     * Find which admin0-level units (i.e. countries) are visible
     *
     * @param adminCoords
     * @returns {{}}
     * @private
     */
    __getCoordsInView(adminCoords) {
        var bounds = this.map.getBounds(),
            inView = {};

        for (var [adminCode, long1, lat1, long2, lat2] of adminCoords) {
            inView[adminCode] = this.mapIntersects(
                long1, lat1, long2, lat2, bounds
            );
        }
        return inView;
    }

    //========================================================//
    //                     Get DataTypes                      //
    //========================================================//

    /**
     *
     */
    getPossibleDataTypes() {
        for (var dataType in this.dataTypes) {

        }
    }

    /*******************************************************************
     * Mode update
     *******************************************************************/

    /**
     *
     */
    setUnderlay() {
        this.setState({
            _underlay: this.otherStatsSelect.current.value
        });
    }

    /**
     *
     */
    setMarkers() {
        var val = this.markersSelect.current.value;
        this.setState({
            _markers: val
        });
    }

    /**
     *
     * @param timeperiod
     */
    setTimePeriod(timeperiod) {
        this.setState({
            _timeperiod: timeperiod
        });
    }

    /**
     *
     * @private
     */
    _updateMode() {
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

        if (numStateWide === 1) {
            // HACK: Because there's only one state level value,
            // there's likely no common point of comparison,
            // so at least tone it down!
            stateWideMaxMin['max'] *= 4;
        }

        var enableInsts = (dataSource, insts) => {
            // Overlay LGA ABS data on LGA stats
            for (var i = 0; i < insts.length; i++) {
                insts[i].addFillPoly(
                    this.absStatsInsts[this.state._underlay],
                    dataSource,
                    this.state._underlay ? 0.5 : 0,
                    !!this.state._underlay,
                    true
                );
                insts[i].addLinePoly(dataSource);
                insts[i].addHeatMap(dataSource, otherMaxMin);
            }
        };
        var enableNonLGAInst = (dataSource, otherInst, lgaInst) => {
            // Overlay LGA ABS data underneath non-LGA stats
            // (e.g. Queensland HHS/ACT SA3)
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
            otherInst.addHeatMap(dataSource, otherMaxMin);
        };

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
        this._enableControlsWhenMapReady();
    }

    /**
     *
     * @param prevState
     * @private
     */
    _resetMode(prevState) {
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
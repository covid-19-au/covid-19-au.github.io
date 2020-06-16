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


class CovidMapControls extends React.Component {
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

        this.mapContControls = React.createRef();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div className="map-cont-controls" ref={this.mapContControls}>
                <SchemaTypeSelect></SchemaTypeSelect>
                <SchemaTypeUnderlaySelect></SchemaTypeUnderlaySelect>
            </div>
        );
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {

    }

    disable() {
        this.mapContControls.current.style.pointerEvents = 'none';
    }

    enalbe() {
        this.mapContControls.current.style.pointerEvents = 'all';
    }
}

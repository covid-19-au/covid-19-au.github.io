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

import React from "react";
import schemaTypes from "../../../data/caseData/schema_types.json"


class SchemaTypeUnderlaySelect extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            _underlay: null
        };

        this.underlayCategorySelect = React.createRef();
        this.underlayCategoryBGCont = React.createRef();
        this.underlaySelect = React.createRef();
        this.underlayBGCont = React.createRef();
    }

    componentDidMount() {
        this.otherStatsSelect.current.onchange = () => {
            this.setUnderlay();
        };
    }

    render() {
        var getSelectOptions = () => {
            // TODO: Filter to
            var out = [];
            for (let [optGroupLabel, options] of schemaTypes.underlays) {
                out.push(`<optgroup label="${optGroupLabel}">`);
                for (let [optionLabel, optionValue] of options) {
                    // Option value is the underlay filename
                    out.push(`<option value="${optionValue}">${optionLabel}</option>`);
                }
                out.push(`</optgroup>`);
            }
            return out.join('\n');
        };

        return (
            <div>
                <div ref={this.underlayCategoryBGCont} className="key" style={{ marginBottom: "8px" }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px' }}>Underlay</div>
                    <select ref={this.underlayCategorySelect}
                        style={{ "width": "100%" }}>
                        { getSelectOptions() }
                    </select>
                </div>

                <div ref={this.underlayBGCont} className="key" style={{ marginBottom: "8px" }}>
                    <select ref={this.underlaySelect}
                        style={{ "width": "100%" }}>
                    </select>
                </div>
            </div>
        );
    }

    //========================================================//
    //                   Get Select Options                   //
    //========================================================//

    getPossibleUnderlaySelectOptions(covidGeoData, admin0InView, admin1InView) {
        // TODO!
    }
}

export default SchemaTypeUnderlaySelect;

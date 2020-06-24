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


class UnderlaySelect extends React.Component {
    /**
     * A control that allows selecting the underlay (choropleth) data
     *
     * @param props
     */
    constructor(props) {
        super(props);

        this.state = {
            underlay: null
        };

        this.underlayCategorySelect = React.createRef();
        this.underlayCategoryBGCont = React.createRef();
        this.underlaySelect = React.createRef();
        this.underlayBGCont = React.createRef();
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <div>
                <div ref={this.underlayCategoryBGCont} className="key" style={{ marginBottom: "8px" }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8em', marginLeft: '3px' }}>Underlay</div>
                    <select ref={this.underlayCategorySelect}
                        style={{ "width": "100%" }}>
                        { this.__getUnderlayCategoryOptions() }
                    </select>
                </div>

                <div ref={this.underlayBGCont} className="key" style={{
                    marginBottom: "8px",
                    display: this.state.underlayCategory == null ? 'none' : 'block'
                }}>
                    <select ref={this.underlaySelect}
                        style={{ "width": "100%" }}>
                        { this.__getUnderlaySelectOptions() }
                    </select>
                </div>
            </div>
        );
    }

    /**
     * Get <select> options for the underlay categories
     *
     * @returns {string}
     * @private
     */
    __getUnderlayCategoryOptions() {
        // TODO: Filter to only schemas in view!
        let out = [];
        for (let [optGroupLabel, options] of schemaTypes.underlay_categories) {
            out.push(`<optgroup label="${optGroupLabel}">`);
            for (let [optionLabel, optionValue] of options) {
                // Option value is the underlay filename
                if (
                    (optionValue === 'None' && this.state.underlayCategory == null) ||
                    (optionValue === this.state.underlayCategory)
                ) {
                    out.push(`<option value="${optionValue}" selected>${optionLabel}</option>`);
                }
                else {
                    out.push(`<option value="${optionValue}">${optionLabel}</option>`);
                }
            }
            out.push(`</optgroup>`);
        }
        return out.join('\n');
    }

    /**
     * Get <select> options for the underlays
     *
     * @returns {string}
     * @private
     */
    __getUnderlaySelectOptions() {
        if (!this.state.underlayCategory) {
            // No category selected - return nothing
            return '';
        }

        let out = [];
        for (let [optGroupLabel, options] of schemaTypes.underlays[this.state.underlayCategory]) {
            out.push(`<optgroup label="${optGroupLabel}">`);
            for (let [optionLabel, optionValue] of options) {
                // Option value is the underlay filename
                if (optionValue === this.state.underlay) {
                    out.push(`<option value="${optionValue}" selected>${optionLabel}</option>`);
                }
                else {
                    out.push(`<option value="${optionValue}">${optionLabel}</option>`);
                }
            }
            out.push(`</optgroup>`);
        }
        return out.join('\n');
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        this.underlayCategorySelect.current.onchange = () => {
            this._onUnderlayCategorySelect(this.underlayCategorySelect.current.value);
        };
        this.underlaySelect.current.onchange = () => {
            this._onUnderlaySelect(this.underlaySelect.current.value);
        };
    }

    /*******************************************************************
     * <select> events
     *******************************************************************/

    /**
     * Update state of covid map controls on change
     *
     * @param prevProps
     * @param prevState
     * @param snapshot
     */
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.props.onchange(
            this.state.underlayCategory,
            this.state.underlay
        );
    }

    /**
     * Underlay category changed event
     *
     * @param underlayCategory
     * @private
     */
    _onUnderlayCategorySelect(underlayCategory) {
        this.setState({
            underlayCategory:
                underlayCategory === 'None' ? null : underlayCategory
        });
    }

    /**
     * Underlay changed event
     *
     * @param underlay
     * @private
     */
    _onUnderlaySelect(underlay) {
        this.setState({
            underlay: underlay
        });
    }
}

export default UnderlaySelect;

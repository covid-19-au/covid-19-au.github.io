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

class HoverStateHelper {
    constructor(map) {
        this.map = map;
        this.sourceIds = [];
    }

    associateLayerId(layerId) {
        this.map.on("mousemove", layerId, (e) => {
            this.__onMouseEnterFeature(e)
        });
        this.map.on("mouseleave", layerId, (e) => {
            this.__onMouseLeaveFeature(e)
        });
    }

    associateSourceId(sourceId) {
        this.sourceIds.push(sourceId);
    }

    __onMouseEnterFeature(e) {
        if (e.features.length > 0 && e.features[0].id !== this.__highlightedId) {
            if (this.__highlightedId) {
                for (let sourceId of this.sourceIds) {
                    this.map.removeFeatureState({
                        source: sourceId,
                        id: this.__highlightedId
                    });
                }
            }

            this.__highlightedId = e.features[0].id;

            for (let sourceId of this.sourceIds) {
                this.map.setFeatureState({
                    source: sourceId,
                    id: e.features[0].id,
                }, {
                    hover: true
                });
            }
        }
    }

    __onMouseLeaveFeature(e) {
        if (this.__highlightedId) {
            for (let sourceId of this.sourceIds) {
                this.map.setFeatureState({
                    source: sourceId,
                    id: this.__highlightedId
                }, {
                    hover: false
                });
            }
            delete this.__highlightedId;
        }
    }
}

export default HoverStateHelper;

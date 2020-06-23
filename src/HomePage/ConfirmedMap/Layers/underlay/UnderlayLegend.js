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


class UnderlayLegend {
    /**
     * A legend control for the underlay
     *
     * Works together with the underlay fill
     * poly layer, synchronizing the color key
     *
     * @param map a MapBox GL instance
     * @param isPercent
     * @param maxMinStatVal
     */
    constructor(map, isPercent, maxMinStatVal) {
        this.map = map;
        this.isPercent = isPercent;
        var min, max, median;

        min = maxMinStatVal['min'];
        max = maxMinStatVal['max']; // HACK!
        // HACK - weight the median so we don't
        // get the same values more than once!
        median = (maxMinStatVal['median'] * 0.7) + ((min + (max - min)) * 0.3);

        this.__labels = [
            min,
            min + (median - min) * 0.25,
            min + (median - min) * 0.5,
            min + (median - min) * 0.75,
            median,
            median + (max - median) * 0.25,
            median + (max - median) * 0.5,
            median + (max - median) * 0.75,
            max
        ];
        this.__colors = [
            //'#ffffff',
            '#f0f5ff',
            '#dcf0ff',
            //'#c8ebff',
            '#bae1ff',
            '#9ed0fb',
            '#83bff8',
            //'#68adf4',
            '#4f9bef',
            '#3689e9',
            '#1e76e3',
            //'#0463da',
            '#004fd0'
        ];
    }

    /**
     * Get the labels (values)/colors for the underlay fill layer
     * @returns {[]}
     */
    getLabelsColors() {
        var r = []
        for (let i=0; i<this.__labels.length; i++) {
            r.push(this.__labels[i]);
            r.push(this.__colors[i]);
        }
        return r;
    }

    /*******************************************************************
     * Map legends
     *******************************************************************/

    /**
     * Show the map legend
     */
    show() {
        this.hide();

        var legend = this.legend = document.createElement('div');
        legend.style.position = 'absolute';
        legend.style.bottom = '40px';
        legend.style.left = '10px';
        legend.style.width = '10%';
        legend.style.minWidth = '75px';
        legend.style.background = 'rgba(255,255,255, 0.35)';
        legend.style.padding = '3px';
        legend.style.boxShadow = '0px 1px 5px 0px rgba(0,0,0,0.05)';
        legend.style.borderRadius = "2px";
        this.map.getCanvasContainer().appendChild(legend);

        var allBetween0_10 = true,
            sameConsecutive = false,
            lastNum = null,
            labels = this.__labels,
            colors = this.__colors;

        for (let i = 0; i < labels.length; i++) {
            if (!(labels[i] > -10.0 && labels[i] < 10.0)) {
                allBetween0_10 = false;
            }
            if (lastNum === parseInt(labels[i])) {
                sameConsecutive = true;
                break;
            }
            lastNum = parseInt(labels[i]);
        }

        for (let i = 0; i < labels.length; i++) {
            var label = labels[i],
                color = colors[i];

            var item = document.createElement('div');
            var key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;
            key.style.display = 'inline-block';
            key.style.borderRadius = '20%';
            key.style.width = '10px';
            key.style.height = '10px';

            var value = document.createElement('span');
            value.innerHTML = this._getABSValue(label, allBetween0_10, sameConsecutive);
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }
    }

    /**
     * Hide the map legend
     */
    hide() {
        if (this.legend) {
            this.legend.parentNode.removeChild(this.legend);
            this.legend = null;
        }
    }

    /*******************************************************************
     * Miscellaneous
     *******************************************************************/

    /**
     * Get a prettified value, adding a percent or trimming
     * floating point decimals to an appropriate precision
     *
     * @param label the raw value
     * @param allBetween0_10
     * @param sameConsecutive
     * @returns {string}
     */
    _getPrettifiedValue(label, allBetween0_10, sameConsecutive) {
        return (
            ((allBetween0_10 || sameConsecutive) && label <= 15) ? label.toFixed(1) : parseInt(label)
        ) + (
            this.isPercent ? '%' : ''
        );
    }
}

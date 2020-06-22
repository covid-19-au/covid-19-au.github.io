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
    constructor() {
        // TODO!
    }

    /*******************************************************************
     * Map legends
     *******************************************************************/

    /**
     *
     * @param dataSource
     * @param labels
     * @param colors
     * @private
     */
    _addLegend(dataSource, labels, colors) {
        this._removeLegend();

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
            lastNum = null;

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
            value.innerHTML = this._getABSValue(dataSource, label, allBetween0_10, sameConsecutive);
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }
    }

    /**
     *
     * @private
     */
    _removeLegend() {
        if (this.legend) {
            this.legend.parentNode.removeChild(this.legend);
            this.legend = null;
        }
    }
}
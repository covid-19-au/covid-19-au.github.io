import setLayerSource from "../setLayerSource";


class FillPolyLayerABS {
    /**
     *
     * @param map
     * @param stateName
     * @param uniqueId
     */
    constructor(map, stateName, uniqueId, cachedMapboxSource) {
        this.map = map;
        this.stateName = stateName;
        this.uniqueId = uniqueId;
        this.cachedMapboxSource = cachedMapboxSource;

        // Make it so that symbol/circle layers are given different priorities
        // This is a temporary fix to make ACT display in the correct priority -
        // see also LayerHeatMap.js for an explanation.
        var lastFillLayer;
        var layers = map.getStyle().layers;
        for (var i = 0; i < layers.length; i++) {
            if (
                layers[i].type === "fill" &&
                layers[i].id.indexOf("fillpoly") !== -1
            ) {
                lastFillLayer = layers[i].id;
            }
        }

        map.addLayer(
            {
                id: this.getFillPolyId(),
                type: "fill",
                minzoom: 2,
                source: cachedMapboxSource.getSourceId(),
                paint: {
                    "fill-opacity": 0.7
                }
            },
            lastFillLayer
        );
    }

    getFillPolyId() {
        return this.uniqueId + "absfillpoly";
    }

    show(absDataSource, maxMinStatVal) {
        this.map.setLayoutProperty(this.getFillPolyId(), "visibility", "visible");

        let min, max, median;

        if (maxMinStatVal) {
            min = maxMinStatVal["min"];
            max = maxMinStatVal["max"]; // HACK!
            // HACK - weight the median so we don't
            // get the same values more than once!
            median = maxMinStatVal["median"] * 0.7 + (min + (max - min)) * 0.3;
        } else {
            min = 0;
            median = 125;
            max = 250; // HACK!
        }

        let labels = [
            min,
            min + (median - min) * 0.25,
            min + (median - min) * 0.5,
            min + (median - min) * 0.75,
            median,
            median + (max - median) * 0.25,
            median + (max - median) * 0.5,
            median + (max - median) * 0.75,
            max,
        ];

        let colors = [
            //'#ffffff',
            "#f0f5ff",
            "#dcf0ff",
            //'#c8ebff',
            "#bae1ff",
            "#9ed0fb",
            "#83bff8",
            //'#68adf4',
            "#4f9bef",
            "#3689e9",
            "#1e76e3",
            //'#0463da',
            "#004fd0",
        ];

        this.map.setPaintProperty(
            this.getFillPolyId(),
            "fill-color",
            [
                "interpolate",
                ["linear"],
                ["get", "stat"],
                labels[0],
                colors[0],
                labels[1],
                colors[1],
                labels[2],
                colors[2],
                labels[3],
                colors[3],
                labels[4],
                colors[4],
                labels[5],
                colors[5],
                labels[6],
                colors[6],
                labels[7],
                colors[7],
                labels[8],
                colors[8],
            ]
        );

        // Add legend/popup event as specified
        this.__absStatsLegend = new ABSStatsLegend(
            this.map, absDataSource, labels, colors
        );
    }

    hide() {
        this.map.setLayoutProperty(this.getFillPolyId(), "visibility", "none");

        if (this.__absStatsLegend) {
            this.__absStatsLegend.remove();
            delete this.__absStatsLegend;
        }
    }
}


class ABSStatsLegend {
    /**
     *
     * @param dataSource
     * @param labels
     * @param colors
     */
    constructor(map, dataSource, labels, colors) {
        this.map = map;
        this.dataSource = dataSource;

        var legend = (this.legend = document.createElement("div"));
        legend.style.position = "absolute";
        legend.style.bottom = "40px";
        legend.style.left = "10px";
        legend.style.width = "10%";
        legend.style.minWidth = "75px";
        legend.style.background = "rgba(255,255,255, 0.35)";
        legend.style.padding = "3px";
        legend.style.boxShadow = "0px 1px 5px 0px rgba(0,0,0,0.05)";
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

            var item = document.createElement("div");
            var key = document.createElement("span");
            key.className = "legend-key";
            key.style.backgroundColor = color;
            key.style.display = "inline-block";
            key.style.borderRadius = "20%";
            key.style.width = "10px";
            key.style.height = "10px";

            var value = document.createElement("span");
            value.innerHTML = this._getABSValue(
                label,
                allBetween0_10,
                sameConsecutive
            );
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }
    }

    _getABSValue(label, allBetween0_10, sameConsecutive) {
        var isPercent = this.dataSource.getSourceName().indexOf("(%)") !== -1;
        return (
            ((allBetween0_10 || sameConsecutive) && label <= 15
                ? label.toFixed(1)
                : parseInt(label)) + (isPercent ? "%" : "")
        );
    }

    remove() {
        if (this.legend) {
            this.legend.parentNode.removeChild(this.legend);
            this.legend = null;
        }
    }
}


export default FillPolyLayerABS;

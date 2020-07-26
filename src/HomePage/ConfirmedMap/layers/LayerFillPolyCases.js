import mapboxgl from "mapbox-gl";
import CanvasJS from "../../../assets/canvasjs.min";
import dvAna from "../../../dvAna";
import setLayerSource from "../setLayerSource";


class FillPolyLayerCases {
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
        let lastFillLayer;
        let layers = map.getStyle().layers;

        for (let i = 0; i < layers.length; i++) {
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
                    "fill-opacity": 0
                }
            },
            lastFillLayer
        );
    }

    getFillPolyId() {
        return this.uniqueId + "casesfillpoly";
    }

    show(caseDataSource) {
        this.map.setLayoutProperty(this.getFillPolyId(), "visibility", "visible");

        // Create a new cases popup events instance,
        // removing the previous one (if relevant)
        if (this.__casesPopup) {
            this.__casesPopup.remove();
        }
        this.__casesPopup = new CasesPopup(
            this.map, this.getFillPolyId(), caseDataSource
        );
    }

    hide() {
        this.map.setLayoutProperty(this.getFillPolyId(), "visibility", "none");

        if (this.__casesPopup) {
            this.__casesPopup.remove();
            delete this.__casesPopup;
        }
    }
}


class CasesPopup {
    /**
     *
     * @param map
     * @param useID
     * @param caseDataSource
     */
    constructor(map, useID, caseDataSource) {
        this.map = map;
        this.useID = useID;
        this.caseDataSource = caseDataSource;

        let popup;
        let currentFeature = null;

        var click = (e) => {
            if (!e.features.length) {
                if (popup) {
                    popup.remove();
                }
                currentFeature = null;
                return;
            }

            let cityName,
                caseInfo,
                feature;

            for (feature of e.features) {
                if (feature == currentFeature) {
                    return;
                }
                cityName = feature.properties.city;
                caseInfo = this.caseDataSource.getCaseNumber(cityName, null);

                if (
                    !caseInfo ||
                    caseInfo["numCases"] == null ||
                    caseInfo["updatedDate"] == null
                ) {
                    // no data?
                    continue;
                }

                currentFeature = feature;
                if (popup) {
                    popup.remove();
                }
                break;
            }

            /*var absInfo;
            if (this.absDataSource) {
                // TODO: Store on mouseover, so as to allow combining different schemas?
                absInfo = this.absDataSource.getCaseInfoForCity(
                    this.stateName,
                    cityName
                );
            }*/

            if (caseDataSource.getCaseNumberTimeSeries) {
                let timeSeries = caseDataSource.getCaseNumberTimeSeries(
                    cityName, null
                );

                popup = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true,
                })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        `${cityName} (${
                            this.caseDataSource.schema === "statewide"
                                ? "statewide"
                                : this.caseDataSource.schema.toUpperCase()
                        })` +
                        "<br/>Cases: " +
                        caseInfo["numCases"] +
                        "&nbsp;&nbsp;&nbsp;&nbsp;By: " +
                        caseInfo["updatedDate"] +
                        /*(absInfo
                            ? "<br>ABS Underlay: " +
                            this._getABSValue(
                                this.absDataSource,
                                absInfo["numCases"],
                                true
                            )
                            : "") +*/
                        '<div id="chartContainer" ' +
                        'style="width: 200px; min-height: 60px; height: 13vh;"></div>'
                    )
                    .addTo(map);

                let chart = new CanvasJS.Chart("chartContainer", {
                    animationEnabled: false,
                    //animationDuration: 200,
                    theme: "light2",
                    axisX: {
                        valueFormatString: "D/M",
                        gridThickness: 1,
                    },
                    data: [
                        {
                            type: "line",
                            dataPoints: timeSeries,
                        },
                    ],
                });
                chart.render();

                document.getElementById("chartContainer").id = "";
            } else {
                popup = new mapboxgl.Popup({
                    closeButton: true,
                    closeOnClick: true,
                })
                    .setLngLat(e.lngLat)
                    .setHTML(
                        e.features[0].properties.city +
                        "<br/>Cases: " +
                        caseInfo["numCases"] +
                        "<br/>By: " +
                        caseInfo["updatedDate"]
                    )
                    .addTo(map);
            }

            // for dvAna

            (async () => {
                try {
                    dvAna({
                        type: "ClickPopUp",
                        marker: map.dvAnaClickContext._markers.toString(),
                        period: map.dvAnaClickContext._timeperiod.toString(),
                        underlay:
                            map.dvAnaClickContext._underlay === null
                                ? "no underlay"
                                : map.dvAnaClickContext._underlay.toString(),
                        zoomLevel: map.getZoom(),
                        clickCity: cityName,
                        lngLat: e.lngLat.toString(),
                    });
                } catch (e) {
                    return null;
                }
            })();
        };

        map.on("click", useID, click);

        let mouseEnter = () => {
            map.getCanvas().style.cursor = "pointer";
        };
        map.on("mouseenter", useID, mouseEnter);

        // Change it back to a pointer when it leaves.
        let mouseLeave = () => {
            map.getCanvas().style.cursor = "";
        };
        map.on("mouseleave", useID, mouseLeave);

        this.resetPopupEvent = function () {
            map.off("click", useID, click);
            map.off("mouseenter", useID, mouseEnter);
            map.off("mouseleave", useID, mouseLeave);

            if (popup) {
                popup.remove();
                popup = null;
            }
            currentFeature = null;
        };
    }

    remove() {
        if (this.resetPopupEvent) {
            this.resetPopupEvent();
            delete this.resetPopupEvent;
        }
    }
}


export default FillPolyLayerCases;

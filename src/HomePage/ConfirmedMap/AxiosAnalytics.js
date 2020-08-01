import axios from "axios";
const qs = require("querystring");


function dvAna(record) {
    const token = process.env.REACT_APP_MAP_API;
    const promise = axios({
        method: "post",
        url: `https://dvana.ellieben.com:2046/records/`,
        data: qs.stringify(record),
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            token: token,
        },
    });
    promise.then((response) => {
        return null;
    });
    promise.catch((err) => {
        return null;
    });
}


class AxiosAnalytics {
    constructor(map) {
        //dvAna functions
        var my = this;
        map.on("dragend", async (e) => {
            try {
                dvAna({
                    type: "Pan",
                    marker: my.state._markers.toString(),
                    period: my.state._timeperiod.toString(),
                    underlay:
                        my.state._underlay === null
                            ? "no underlay"
                            : my.state._underlay.toString(),
                    zoomLevel: map.getZoom(),
                    endLngLat: map.getCenter().toString(),
                });
            } catch (e) {
                return null;
            }
        });

        map.on("zoomend", async (e) => {
            try {
                dvAna({
                    type: "Zoom",
                    marker: my.state._markers.toString(),
                    period: my.state._timeperiod.toString(),
                    underlay:
                        my.state._underlay === null
                            ? "no underlay"
                            : my.state._underlay.toString(),
                    zoomLevel: map.getZoom(),
                    endLngLat: map.getCenter().toString(),
                });
            } catch (e) {
                return null;
            }
        });

        map.on("click", function (e) {
            try {
                map.dvAnaClickContext = my.state;
            } catch (e) {
                return null;
            }
        });
    }

    associateLayerId(layerId) {
        this.map.on('click', 'FIXME', (e) => {
            let cityName = e.FIXME; // FIXME!!

            // for dvAna
            (async () => {
                try {
                    dvAna({
                        type: "ClickPopUp",
                        marker: this.map.dvAnaClickContext._markers.toString(),
                        period: this.map.dvAnaClickContext._timeperiod.toString(),
                        underlay:
                            this.map.dvAnaClickContext._underlay === null
                                ? "no underlay"
                                : this.map.dvAnaClickContext._underlay.toString(),
                        zoomLevel: this.map.getZoom(),
                        clickCity: cityName,
                        lngLat: e.lngLat.toString(),
                    });
                } catch (e) {
                    return null;
                }
            })();
        });
    }
}

export default AxiosAnalytics;

import axios from "axios";
import RegionType from "../CrawlerDataTypes/RegionType";
const qs = require("querystring");

class AxiosAnalytics {
  constructor(map, covidMapControls, mapTimeSlider) {
    this.map = map;
    this.covidMapControls = covidMapControls;
    this.mapTimeSlider = mapTimeSlider;
    this.associatedLayers = new Set();

    map.on("dragend", async (e) => {
      try {
        this.__send({
          type: "Pan",
          marker: covidMapControls.getDataType(),
          period: covidMapControls.getTimePeriod()
            ? covidMapControls.getTimePeriod()
            : "All",
          zoomLevel: map.getZoom(),
          endlngLat: map.getCenter().toString(),
          dateSlider: mapTimeSlider.getValue().toISOString(),
        });
      } catch (e) {
        return null;
      }
    });

    map.on("zoomend", async (e) => {
      try {
        this.__send({
          type: "Zoom",
          marker: covidMapControls.getDataType(),
          period: covidMapControls.getTimePeriod()
            ? covidMapControls.getTimePeriod()
            : "All",
          zoomLevel: map.getZoom(),
          endlngLat: map.getCenter().toString(),
          dateSlider: mapTimeSlider.getValue().toISOString(),
        });
      } catch (e) {
        return null;
      }
    });
  }

  associateLayerId(layerId) {
    if (this.associatedLayers.has(layerId)) {
      // Only associate once!
      return;
    }
    this.associatedLayers.add(layerId);

    this.map.on("click", layerId, (e) => {
      if (!e.features.length) {
        return;
      }

      let feature = e.features[0];
      if (!feature.properties || !feature.properties["regionChild"]) {
        return;
      }

      // Get info about the region
      let regionType = new RegionType(
        feature.properties["regionSchema"],
        feature.properties["regionParent"],
        feature.properties["regionChild"]
      );
      let cityName = regionType.prettified();

      (async () => {
        try {
          this.__send({
            type: "ClickPopUp",
            marker: this.covidMapControls.getDataType(),
            period: this.covidMapControls.getTimePeriod()
              ? this.covidMapControls.getTimePeriod()
              : "All",
            zoomLevel: this.map.getZoom(),
            clickCity: cityName,
            endlngLat: e.lngLat.toString(),
            dateSlider: this.mapTimeSlider.getValue().toISOString(),
          });
        } catch (e) {
          return null;
        }
      })();
    });
  }

  __send(record) {
    const token = process.env.REACT_APP_MAP_API;
    const promise = axios({
      method: "post",
      url: `https://dvana.ellieben.com:2046/ra11/`,
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
}

export default AxiosAnalytics;

import React from "react";

import mapboxgl from 'mapbox-gl/dist/mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'

import '../home/ConfirmedMap.css'
import hospitalData from "../data/mapdataHos.json"
import hospitalImg from '../assets/img/icon/hospital.png'

import MarkerHospital from "../common/data_vis/ConfirmedMap/Markers/MarkerHospital"
import BRIGHT_V9_MOD_STYLE from "../common/data_vis/ConfirmedMap/bright_v9_mod";


//Fetch Token from env
let token = process.env.REACT_APP_MAP_API;
mapboxgl.accessToken = token;


class HospitalsMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lng: 133.751567,
            lat: -26.344589,
            zoom: 2,
            showMarker: true
        };
    }

    /*******************************************************************
     * HTML Template
     *******************************************************************/

    render() {
        return (
            <p style={{width: "100%"}}>
                <div ref={el => this.mapContainer = el} style={{width: "100%", height: "55vh"}}>

                </div>
                <span className="due">
                    <div ref={this.hospitalMessage}>
                        <span className="key"><img src={hospitalImg} /><p>Hospital or COVID-19 assessment centre</p></span>
                    </div>
                </span>
            </p>
        );
    }

    /*******************************************************************
     * Intialization after load
     *******************************************************************/

    componentDidMount() {
        const lng = this.state['lng'],
              lat = this.state['lat'],
              zoom = this.state['zoom'];

        var bounds = [
            [101.6015625, -49.83798245308484], // Southwest coordinates
            [166.2890625, 0.8788717828324276] // Northeast coordinates
        ];

        const map = this.map = new mapboxgl.Map({
            container: this.mapContainer,
            //style: 'mapbox://styles/mapbox/streets-v9',
            style: BRIGHT_V9_MOD_STYLE,
            center: [lng, lat],
            zoom: zoom,
            maxZoom: 9,
            maxBounds: bounds // Sets bounds as max
        });

        // Disable map rotation
        map.dragRotate.disable();
        map.touchZoomRotate.disableRotation();

        // Add geolocate control to the map.
        map.addControl(
            new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true
            })
        );

        //Add zoom+fullscreen controls
        map.addControl(new mapboxgl.NavigationControl());
        map.addControl(new mapboxgl.FullscreenControl());

        this.hospitalMarkers = hospitalData.map((item) => {
            return new MarkerHospital(map, item);
        });

        map.on('load', () => {
            this.hospitalMarkers.forEach((marker) => {
                marker.show();
            });
        });
    }

    componentWillUnmount() {
        this.map.remove();
    }
}

export default HospitalsMap

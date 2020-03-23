import React, { useState, Suspense, useEffect } from "react";
import mapboxgl from 'mapbox-gl';
import confirmedData from "./data/mapdataCon"
import hospitalData from "./data/mapdataHos"
import ReactMapboxGl, { Layer, Feature, Popup } from 'react-mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css'
import './ConfirmedMap.css'
import confirmedImg from './img/icon/confirmed-recent.png'
import confirmedOldImg from './img/icon/confirmed-old.png'
import hospitalImg from './img/icon/hospital.png'
const oldCaseDays = 14; // Threshold for an 'old case', in days

class MbMap extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            lng: 133.751567,
            lat: -26.344589,
            zoom: 2.5
        };
    }

    // Check if a date was more than two weeks ago
    isOld(date) {
        // Working with raw data, so try-catch just in case
        try {
            // 'DD/MM/YY' format
            // Assume entries with incorrect formats are old
            const eventDay = date.split("/");
            if (eventDay.length !== 3 || eventDay === 'N/A') { return true; }

            // Default constructor has current time
            const today = new Date();
            
            // Day of the event. Transform to YYYY/MM/DD format
            const day = eventDay[0], month = eventDay[1];
            const year = '20' + eventDay[2]
            let caseDate = new Date(year + '-' + month + '-' + day);

            // Add two weeks for comparison
            caseDate.setDate(caseDate.getDate() + oldCaseDays);

            // True iff the original date was more than two weeks old
            if (today > caseDate) {
                return true;
            } else {
                return false;
            }
        } catch {
            return true;
        }
    }

    componentDidMount() {
        const { lng, lat, zoom } = this.state;

        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: {
              version: 8,
              sources: {
                osm: {
                  type: 'raster',
                  tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                  tileSize: 256,
                  attribution: 'Map tiles by <a target="_top" rel="noopener" href="https://tile.openstreetmap.org/">OpenStreetMap tile servers</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>'
                }
              },
              layers: [{
                id: 'osm',
                type: 'raster',
                source: 'osm',
              }],
            },
            center: [lng, lat],
            minZoom: 2.5,
            zoom
        });

        map.on('move', () => {
            const { lng, lat } = map.getCenter();

            this.setState({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });
        const noMargin = { margin: 0 };
        confirmedData.map((item) => {
            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';
            el.style.height = '20px';
            el.style.width = '20px';
            el.style.backgroundSize = 'cover';
            if (this.isOld(item['date'])) {
                el.style.backgroundImage = `url(${confirmedOldImg})`;
            } else {
                el.style.backgroundImage = `url(${confirmedImg})`;
            }
            el.style.borderRadius = '50%';
            el.style.cursor = 'pointer';

            let coor = [item['coor'][1], item['coor'][0]]
            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
                .setLngLat(coor)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML('<h3 style="margin:0;">' + item['name'] + '</h3>' + '<p style="margin:0;">' + item['date'] + '</p><p style="margin:0;">Activity Time: ' + item['time'] + '</p>'))
                .addTo(map);
        })

        hospitalData.map((item) => {
            // create a HTML element for each feature
            var el = document.createElement('div');
            el.className = 'marker';
            el.style.height = '20px';
            el.style.width = '20px';
            el.style.backgroundSize = 'cover';
            el.style.backgroundImage = `url(${hospitalImg})`;
            el.style.borderRadius = '50%';
            el.style.cursor = 'pointer';

            let coor = [item['coor'][1], item['coor'][0]]
            // make a marker for each feature and add to the map
            new mapboxgl.Marker(el)
                .setLngLat(coor)
                .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
                    .setHTML('<h3 style="margin:0;">' + item['name'] + '</h3><p style="margin:0;">Phone: ' + item['hospitalPhone'] + '</p><p style="margin:0;">Addr: ' + item['address'] + '</p>'))

                .addTo(map);
        })
    }

    render() {
        const style = {
            height: '100%',

        };


        return (
            <div className="card" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '520px'
            }}>
                <h2>Hospital & Case Map</h2>

                <div style={style} ref={el => this.mapContainer = el} >
                    {/*{*/}
                    {/*confirmedData.map((item)=>(*/}
                    {/*<div style={activityStyle}>*/}

                    {/*</div>*/}
                    {/*))*/}
                    {/*}*/}
                </div>

                <span className="due">
                    <span className="key"><img src={confirmedImg}/><p>Recently confirmed case</p></span>
                    <span className="key"><img src={confirmedOldImg}/><p>Case over {oldCaseDays} days old</p></span>
                    <span className="key"><img src={hospitalImg}/><p>Hospital or COVID-19 assessment centre</p></span>
        </span>
            </div>
        );
    }
}

export default MbMap

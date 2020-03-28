import React from "react";
import mapboxgl from 'mapbox-gl';
import confirmedData from "./data/mapdataCon"
import hospitalData from "./data/mapdataHos"
import vicLgaData from "./data/lga_vic.geojson"
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
            const day = eventDay[0], month = parseInt(eventDay[1])-1;
            const year = '20' + eventDay[2]
            let caseDate = new Date(year, month, day);

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

        var bounds = [
          [101.6015625,-49.83798245308484], // Southwest coordinates
          [166.2890625,0.8788717828324276] // Northeast coordinates
        ];

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
            maxBounds: bounds // Sets bounds as max
        });

        function get_html(city_name) {
          var city = city_name.toLowerCase().split(" ");
          var numberOfCases = 0;
          var city_type = city.slice(-1);
          city.pop();
          city_name = city.join(' ');
          if (city_type == 'city'){
            city_name += '(c)';
          }
          else{
            city_name += '(s)';
          }
          for (var data in confirmedData){
            var data_map = confirmedData[data];
            city = data_map['area'];
            // console.log(city.toLowerCase(),city_name)
            if (city.toLowerCase() === city_name && numberOfCases == 0){
              // return data_map['numberOfCases']
              numberOfCases = data_map['numberOfCases'];
            }
          }
          return parseInt(numberOfCases);
        }

        function formNewJson(geojsonData){
          for(var key in geojsonData.features){
            var data = geojsonData.features[key];
            var cases = get_html(data.properties.vic_lga__2);
            data.properties['cases'] = cases;
            geojsonData.features[key] = data;
          }
          return geojsonData;
        }

        map.on('load', function() {

          // var maxValue = 56;
          async function loadJSON(fname) {
            let geojsonData = await fetch(`${vicLgaData}`)
              .then(response => response.json())
              .then(responseData => {
                return responseData;
            });
            return geojsonData;
          };

          (async () => {
            var geosjondata = loadJSON().then(data => {
              data = formNewJson(data);
              map.addLayer({
                id: 'id_poly',
                type: 'fill',
                minzoom:4,
                source: {
                  type: 'geojson',
                  data: data
                },
                'paint': {
                  'fill-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'cases'],
                    0,
                    '#e0f7fa',
                    1,
                    '#b2eaf2',
                    5,
                    '#80ddea',
                    10,
                    '#4ccfe1',
                    20,
                    '#25c5da',
                    30,
                    '#01bad4',
                    40,
                    '#00aac1',
                    50,
                    '#0096a7',
                    60,
                    '#00828f',
                    70,
                    '#005f64'
                  ],
                  'fill-opacity': 0.75
                },
                filter: ['==', '$type', 'Polygon']
              });
              map.addLayer({
                id: 'id_line_ploy',
                minzoom:4,
                type: 'line',
                source: {
                  type: 'geojson',
                  data: data
                },
                paint: {
                  // 'line-color': '#088',
                  'line-opacity': 1,
                  'line-width': 3,
                },
                filter: ['==', '$type', 'Polygon']
              });
            });

          })()


          map.on('click', 'id_poly', function(e) {
            var cases = e.features[0].properties.cases;
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(e.features[0].properties.vic_lga__2 + '<br/>Cases:' + cases)
              .addTo(map);
          });

          // Change the cursor to a pointer when the mouse is over the states layer.
          map.on('mouseenter', 'id_poly', function() {
            map.getCanvas().style.cursor = 'pointer';
          });

          // Change it back to a pointer when it leaves.
          map.on('mouseleave', 'id_poly', function() {
            map.getCanvas().style.cursor = '';
          });
        });

        // Add geolocate control to the map.
        map.addControl(
          new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: true
          })
        );

        //Add Zoom Controls
        map.addControl(new mapboxgl.NavigationControl());

        map.on('move', () => {
            const { lng, lat } = map.getCenter();

            this.setState({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        });
        confirmedData.map((item) => {
          if (item['state'] !== 'VIC'){
            if(item['state']==='VIC' && item['area'].length > 0){
                item['description']="This case number is just the suburb confirmed number, not the case number at this geo point."
                item['date'] = '26/3/20'
            }
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
                    .setHTML('<h3 style="margin:0;">' + item['name'] + '</h3>' + '<p style="margin:0;">' + item['date'] + '</p><p style="margin:0;">' + item['description'] + '</p>'))
                .addTo(map);
        };})

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
                    <span className="key"><img src={hospitalImg}/><p>Hospital or COVID-19 assessment centre</p></span>
                    <span className="key"><img src={confirmedOldImg}/><p>Case over {oldCaseDays} days old</p></span>
                    <span className="key"><img src={confirmedImg}/><p>Recently confirmed case(not all, collecting)</p></span>
                    <span className="Key">*City Wise Data Present Only For Victoria</span>
        </span>
            </div>
        );
    }
}

export default MbMap

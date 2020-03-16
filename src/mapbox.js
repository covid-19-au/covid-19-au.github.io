mapboxgl.accessToken =
  "pk.eyJ1Ijoid29veXVubG9uZyIsImEiOiJjazBtM3cyM3kwMndmM2JrYmg0aXY4aHNxIn0.IjdNPocM6cBQiXBvWhDLVw";
const locations = [
  {
    latitude: "-37.776845",
    longitude: " 144.987074",
    description: "Mary Miller Café, Fitzroy North"
  },
  {
    latitude: "-37.773059",
    longitude: " 144.916153",
    description: "No. 19 Café, Ascot Vale"
  },
  {
    latitude: "-37.672278",
    longitude: " 144.851175",
    description: "Emirates flight EK0406 from Dubai to Melbourne"
  },
  { latitude: 0, longitude: 0, description: "" },
  { latitude: 0, longitude: 0, description: "" },
  {
    latitude: "-37.819814",
    longitude: " 144.983471",
    description:
      "T20 Cricket World Cup Final, Melbourne Cricket Ground, MCC Members Level 2"
  },
  {
    latitude: "-37.800857",
    longitude: " 145.075181",
    description: "Myrtle Oval, Macleay Park, North Balwyn"
  },
  {
    latitude: "-37.791837",
    longitude: " 145.003320",
    description: "Ramsden Street Oval, Clifton Hill"
  },
  { latitude: 0, longitude: 0, description: "" },
  {
    latitude: "-37.825005",
    longitude: " 144.983814",
    description: "AAMI Park (Rebels vs Lions rugby game)"
  },
  {
    latitude: "-37.825005",
    longitude: " 144.983814",
    description: "Albert Park Hotel"
  },
  {
    latitude: "-37.831845",
    longitude: " 144.955896",
    description: "South Melbourne Market"
  },
  {
    latitude: "-38.199037",
    longitude: " 144.318418",
    description: "Coles Waurn Ponds"
  },
  {
    latitude: "-37.863086",
    longitude: " 145.086915",
    description: "Ashburton Park"
  },
  { latitude: 0, longitude: 0, description: "" },
  { latitude: 0, longitude: 0, description: "" },
  {
    latitude: "-37.809968",
    longitude: " 144.995144",
    description: "Pho Hung Vuong 2 Vietnamese Restaurant in Richmond"
  },
  { latitude: 0, longitude: 0, description: "" },
  {
    latitude: "-38.198995",
    longitude: " 144.318471",
    description: "Coles Waurn Ponds"
  },
  {
    latitude: "-37.831845",
    longitude: " 144.955896",
    description: "South Melbourne Market"
  },
  { latitude: 0, longitude: 0, description: "" },
  {
    latitude: "-37.797814",
    longitude: " 144.967985",
    description: "Cinema Nova, Carlton (Movie: The Amber Light)"
  },
  {
    latitude: "-37.818268",
    longitude: " 144.952479",
    description: "VLine train from Southern Cross to Geelong"
  },
  {
    latitude: "-37.028275",
    longitude: " 145.143338",
    description: "Wine by Sam - Seymour"
  },
  {
    latitude: "-37.720446",
    longitude: " 145.048468",
    description: "La Trobe University, Bundoora Campus"
  },
  { latitude: 0, longitude: 0, description: "" },
  { latitude: 0, longitude: 0, description: "" },
  {
    latitude: "-37.826473",
    longitude: " 145.059436",
    description: "Metro train from Southern Cross to Camberwell"
  },
  {
    latitude: "-37.847949",
    longitude: " 145.005577",
    description: "Toorak Clinic; 575 Malvern Rd, Toorak"
  },
  { latitude: 0, longitude: 0, description: "" },
  { latitude: 0, longitude: 0, description: "" },
  { latitude: 0, longitude: 0, description: "" }
];

let data = [];
for (var i = 0; i < locations.length; i++) {
  var feature = {
    type: "Feature",
    properties: {
      description: locations[i].description,
      icon: "circle-15"
    },
    geometry: {
      type: "Point",
      coordinates: [locations[i].longitude, locations[i].latitude]
    }
  };
  data.push(feature);
}
console.log(`${data.length} points ready`);

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v10",
  zoom: 11,
  center: [locations[0].longitude, locations[0].latitude]
});
map.on("load", function() {
  // Add a layer showing the places.
  map.addLayer({
    id: "places",
    type: "symbol",
    source: {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: data
      }
    },
    layout: {
      "icon-image": "{icon}",
      "icon-allow-overlap": true
    }
  });

  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl
    })
  );

  map.addControl(new mapboxgl.NavigationControl());
  // When a click event occurs on a feature in the places layer, open a popup at the
  // location of the feature, with description HTML from its properties.
  map.on("click", "places", function(e) {
    var coordinates = e.features[0].geometry.coordinates.slice();
    var description = e.features[0].properties.description;
    // Ensure that if the map is zoomed out such that multiple
    // copies of the feature are visible, the popup appears
    // over the copy being pointed to.
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
    new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(description)
      .addTo(map);
  });
  // Change the cursor to a pointer when the mouse is over the places layer.
  map.on("mouseenter", "places", function() {
    map.getCanvas().style.cursor = "pointer";
  });
  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "places", function() {
    map.getCanvas().style.cursor = "";
  });
});

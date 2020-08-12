const ROAD_OPACITY = 0.5;
const ROAD_COLOR = "orange"; //"#e9ac77";
const ROAD_LINE_WIDTH = 0.5;

const OTHER_LABEL_COLOR = '#555555';
const OTHER_LABEL_TRANSFORM = 'lowercase';

const MAIN_LABEL_COLOR = '#333333';
const GREENERY_OPACITY = 0.3;


export default {
    "version": 8,
    "name": "Bright",
    "metadata": {
        "mapbox:autocomposite": true,
        "mapbox:type": "template",
        "mapbox:groups": {
            "1444849364238.8171": {
                "name": "Buildings",
                "collapsed": true
            },
            "1444849354174.1904": {
                "name": "Tunnels",
                "collapsed": true
            },
            "1444849320558.5054": {
                "name": "Water labels",
                "collapsed": true
            },
            "1444849371739.5945": {
                "name": "Aeroways",
                "collapsed": true
            },
            "1444849258897.3083": {
                "name": "Marine labels",
                "collapsed": true
            },
            "1444849388993.3071": {
                "name": "Landuse",
                "collapsed": true
            },
            "1444849242106.713": {
                "name": "Country labels",
                "collapsed": true
            },
            "1444849382550.77": {
                "name": "Water",
                "collapsed": true
            },
            "1444849345966.4436": {
                "name": "Roads",
                "collapsed": true
            },
            "1444849307123.581": {
                "name": "Admin  lines",
                "collapsed": true
            },
            "1456163609504.0715": {
                "name": "Road labels",
                "collapsed": true
            },
            "1444849272561.29": {
                "name": "Place labels",
                "collapsed": true
            },
            "1444849290021.1838": {
                "name": "Road labels",
                "collapsed": true
            },
            "1444849334699.1902": {
                "name": "Bridges",
                "collapsed": true
            },
            "1444849297111.495": {
                "name": "POI labels",
                "collapsed": true
            }
        }
    },
    "sources": {
        "mapbox": {
            "url": "mapbox://mapbox.mapbox-streets-v7",
            "type": "vector"
        }
    },
    "center": [
        -118.2518,
        34.0442
    ],
    "zoom": 15,
    "sprite": "mapbox://sprites/mapbox/bright-v9",
    "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
    "layers": [
        {
            "id": "background",
            "type": "background",
            "paint": {
                "background-color": "#f8f4f0"
            },
            "interactive": true
        },

        {
            "id": "landuse_overlay_national_park",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "landuse_overlay",
            "filter": [
                "==",
                "class",
                "national_park"
            ],
            "paint": {
                "fill-color": "#d2edae",
                "fill-opacity": GREENERY_OPACITY
            },
            "interactive": true
        },
        {
            "id": "landuse_park",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "landuse",
            "filter": [
                "==",
                "class",
                "park"
            ],
            "paint": {
                "fill-color": "#d2edae",
                "fill-opacity": GREENERY_OPACITY
            },
            "interactive": true
        },
        {
            "id": "waterway",
            "type": "line",
            "source": "mapbox",
            "source-layer": "waterway",
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "in",
                    "class",
                    "river",
                    "canal"
                ]
            ],
            "paint": {
                "line-color": "#a0cfdf",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            8,
                            0.5
                        ],
                        [
                            20,
                            15
                        ]
                    ]
                }
            },
            "interactive": true
        },
        {
            "id": "water",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "water",
            "paint": {
                "fill-color": "#a0cfdf"
            },
            "interactive": true
        },
        {
            "id": "building",
            "type": "fill",
            "source": "mapbox",
            "source-layer": "building",
            "paint": {
                "fill-color": "#d6d6d6"
            },
            "interactive": true
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "==",
                        "structure",
                        "tunnel"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "tunnel_minor",
            "paint": {
                "line-color": "#efefef",
                "line-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                },
                "line-dasharray": [
                    0.36,
                    0.18
                ]
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "==",
                        "structure",
                        "tunnel"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "tunnel_major",
            "paint": {
                "line-color": "#fff",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            6,
                            0.5
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                },
                "line-dasharray": [
                    0.28,
                    0.14
                ]
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "in",
                        "structure",
                        "none",
                        "ford"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "road_minor",
            "paint": {
                "line-color": "#efefef",
                "line-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "in",
                        "structure",
                        "none",
                        "ford"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "road_major",
            "paint": {
                "line-color": "#fff",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            6,
                            0.5
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_minor case",
            "paint": {
                "line-color": "#dedede",
                "line-width": {
                    "base": 1.6,
                    "stops": [
                        [
                            12,
                            0.5
                        ],
                        [
                            20,
                            10
                        ]
                    ]
                },
                "line-gap-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "butt",
                "line-join": "miter"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_major case",
            "paint": {
                "line-color": "#dedede",
                "line-width": {
                    "base": 1.6,
                    "stops": [
                        [
                            12,
                            0.5
                        ],
                        [
                            20,
                            10
                        ]
                    ]
                },
                "line-gap-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway_link",
                        "street",
                        "street_limited",
                        "service",
                        "track",
                        "pedestrian",
                        "path",
                        "link"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_minor",
            "paint": {
                "line-color": "#efefef",
                "line-width": {
                    "base": 1.55,
                    "stops": [
                        [
                            4,
                            0.25
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "in",
                        "class",
                        "motorway",
                        "primary",
                        "secondary",
                        "tertiary",
                        "trunk"
                    ],
                    [
                        "==",
                        "structure",
                        "bridge"
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_major",
            "paint": {
                "line-color": "#fff",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            6,
                            0.5
                        ],
                        [
                            20,
                            30
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "all",
                    [
                        "<=",
                        "admin_level",
                        2
                    ],
                    [
                        "==",
                        "maritime",
                        0
                    ]
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "admin_country",
            "paint": {
                "line-color": "#8b8a8a",
                "line-width": {
                    "base": 1.3,
                    "stops": [
                        [
                            3,
                            0.5
                        ],
                        [
                            22,
                            15
                        ]
                    ]
                }
            },
            "source-layer": "admin"
        },
        {
            "interactive": true,
            "minzoom": 5,
            "layout": {
                "icon-image": "{maki}-11",
                "text-offset": [
                    0,
                    0.5
                ],
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-max-width": 8,
                "text-anchor": "top",
                "text-size": 11,
                "icon-size": 1
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "all",
                    [
                        "==",
                        "scalerank",
                        1
                    ],
                    [
                        "==",
                        "localrank",
                        1
                    ]
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "poi_label",
            "paint": {
                "text-color": "#666",
            },
            "source-layer": "poi_label"
        },
        {
            "interactive": true,
            "layout": {
                "symbol-placement": "line",
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": "uppercase",
                "text-letter-spacing": 0.1,
                "text-size": {
                    "base": 1.4,
                    "stops": [
                        [
                            10,
                            8
                        ],
                        [
                            20,
                            14
                        ]
                    ]
                }
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "in",
                    "class",
                    "motorway",
                    "primary",
                    "secondary",
                    "tertiary",
                    "trunk"
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "road_major_label",
            "paint": {
                "text-color": "#666",
            },
            "source-layer": "road_label"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round",
                "line-join": "round",
                "visibility": "visible"
            },
            "metadata": {
                "mapbox:group": "1444849345966.4436"
            },
            "filter": [
                "all",
                [
                    "in",
                    "class",
                    "trunk",
                    "primary"
                ],
                [
                    "!in",
                    "structure",
                    "bridge",
                    "tunnel"
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "road_trunk_primary_casing",
            "paint": {
                "line-color": ROAD_COLOR,
                "line-opacity": ROAD_OPACITY,
                "line-width": ROAD_LINE_WIDTH,
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "minzoom": 5,
            "layout": {
                "line-cap": "round",
                "line-join": "round",
                "visibility": "visible"
            },
            "metadata": {
                "mapbox:group": "1444849345966.4436"
            },
            "filter": [
                "all",
                [
                    "==",
                    "class",
                    "motorway"
                ],
                [
                    "!in",
                    "structure",
                    "bridge",
                    "tunnel"
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "road_motorway_casing",
            "paint": {
                "line-color": ROAD_COLOR,
                "line-opacity": ROAD_OPACITY,
                "line-width": ROAD_LINE_WIDTH,
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "metadata": {
                "mapbox:group": "1444849345966.4436"
            },
            "id": "road_trunk_primary",
            "paint": {
                "line-color": ROAD_COLOR,
                "line-opacity": ROAD_OPACITY,
                "line-width": ROAD_LINE_WIDTH,
            },
            "ref": "road_trunk_primary_casing"
        },
        {
            "interactive": true,
            "layout": {
                "line-join": "round"
            },
            "metadata": {
                "mapbox:group": "1444849334699.1902"
            },
            "filter": [
                "all",
                [
                    "==",
                    "structure",
                    "bridge"
                ],
                [
                    "in",
                    "class",
                    "trunk",
                    "primary"
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "bridge_trunk_primary_casing",
            "paint": {
                "line-color": "#e9ac77",
                "line-width": {
                    "base": 1.2,
                    "stops": [
                        [
                            5,
                            0.4
                        ],
                        [
                            6,
                            0.6
                        ],
                        [
                            7,
                            1.5
                        ],
                        [
                            20,
                            22
                        ]
                    ]
                }
            },
            "source-layer": "road"
        },
        {
            "interactive": true,
            "metadata": {
                "mapbox:group": "1444849334699.1902"
            },
            "id": "bridge_trunk_primary",
            "paint": {
                "line-color": "#fea",
                "line-width": {
                    "base": 1.2,
                    "stops": [
                        [
                            6.5,
                            0
                        ],
                        [
                            7,
                            0.5
                        ],
                        [
                            20,
                            18
                        ]
                    ]
                }
            },
            "ref": "bridge_trunk_primary_casing"
        },
        {
            "id": "bridge_major_rail",
            "type": "line",
            "source": "mapbox",
            "source-layer": "road",
            "filter": [
                "all",
                [
                    "==",
                    "structure",
                    "bridge"
                ],
                [
                    "==",
                    "class",
                    "major_rail"
                ]
            ],
            "paint": {
                "line-color": "#bbb",
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            14,
                            0.4
                        ],
                        [
                            15,
                            0.75
                        ],
                        [
                            20,
                            2
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849334699.1902"
            },
            "interactive": true
        },
        {
            "id": "bridge_major_rail_hatching",
            "paint": {
                "line-color": "#bbb",
                "line-dasharray": [
                    0.2,
                    8
                ],
                "line-width": {
                    "base": 1.4,
                    "stops": [
                        [
                            14.5,
                            0
                        ],
                        [
                            15,
                            3
                        ],
                        [
                            20,
                            8
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849334699.1902"
            },
            "interactive": true,
            "ref": "bridge_major_rail"
        },

        // BEGIN ADMIN BOUNDARIES

        {
            "interactive": true,
            "layout": {
                "line-join": "round"
            },
            "metadata": {
                "mapbox:group": "1444849307123.581"
            },
            "filter": [
                "all",
                [
                    ">=",
                    "admin_level",
                    3
                ],
                [
                    "==",
                    "maritime",
                    0
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "admin_level_3",
            "paint": {
                "line-color": "#9e9cab",
                "line-dasharray": [
                    3,
                    1,
                    1,
                    1
                ],
                "line-width": {
                    "base": 1,
                    "stops": [
                        [
                            4,
                            0.4
                        ],
                        [
                            5,
                            1
                        ],
                        [
                            12,
                            3
                        ]
                    ]
                }
            },
            "source-layer": "admin"
        },
        {
            "interactive": true,
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "metadata": {
                "mapbox:group": "1444849307123.581"
            },
            "filter": [
                "all",
                [
                    "==",
                    "admin_level",
                    2
                ],
                [
                    "==",
                    "disputed",
                    0
                ],
                [
                    "==",
                    "maritime",
                    0
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "admin_level_2",
            "paint": {
                "line-color": "#9e9cab",
                "line-width": {
                    "base": 1,
                    "stops": [
                        [
                            4,
                            1.4
                        ],
                        [
                            5,
                            2
                        ],
                        [
                            12,
                            8
                        ]
                    ]
                }
            },
            "source-layer": "admin"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round"
            },
            "metadata": {
                "mapbox:group": "1444849307123.581"
            },
            "filter": [
                "all",
                [
                    "==",
                    "admin_level",
                    2
                ],
                [
                    "==",
                    "disputed",
                    1
                ],
                [
                    "==",
                    "maritime",
                    0
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "admin_level_2_disputed",
            "paint": {
                "line-color": "#9e9cab",
                "line-dasharray": [
                    2,
                    2
                ],
                "line-width": {
                    "base": 1,
                    "stops": [
                        [
                            4,
                            1.4
                        ],
                        [
                            5,
                            2
                        ],
                        [
                            12,
                            8
                        ]
                    ]
                }
            },
            "source-layer": "admin"
        },
        {
            "interactive": true,
            "layout": {
                "line-join": "round"
            },
            "metadata": {
                "mapbox:group": "1444849307123.581"
            },
            "filter": [
                "all",
                [
                    ">=",
                    "admin_level",
                    3
                ],
                [
                    "==",
                    "maritime",
                    1
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "admin_level_3_maritime",
            "paint": {
                "line-color": "#a0c8f0",
                "line-opacity": 0.5,
                "line-dasharray": [
                    3,
                    1,
                    1,
                    1
                ],
                "line-width": {
                    "base": 1,
                    "stops": [
                        [
                            4,
                            0.4
                        ],
                        [
                            5,
                            1
                        ],
                        [
                            12,
                            3
                        ]
                    ]
                }
            },
            "source-layer": "admin"
        },
        {
            "interactive": true,
            "layout": {
                "line-cap": "round"
            },
            "metadata": {
                "mapbox:group": "1444849307123.581"
            },
            "filter": [
                "all",
                [
                    "==",
                    "admin_level",
                    2
                ],
                [
                    "==",
                    "maritime",
                    1
                ]
            ],
            "type": "line",
            "source": "mapbox",
            "id": "admin_level_2_maritime",
            "paint": {
                "line-color": "#a0c8f0",
                "line-opacity": 0.5,
                "line-width": {
                    "base": 1,
                    "stops": [
                        [
                            4,
                            1.4
                        ],
                        [
                            5,
                            2
                        ],
                        [
                            12,
                            8
                        ]
                    ]
                }
            },
            "source-layer": "admin"
        },

        // END ADMIN BOUNDARIES

        // BEGIN VARIOUS LABELS

        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 5,
                "text-size": 12
            },
            "metadata": {
                "mapbox:group": "1444849320558.5054"
            },
            "filter": [
                "==",
                "$type",
                "Point"
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "water_label",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "water_label"
        },
        {
            "interactive": true,
            "minzoom": 16,
            "layout": {
                "icon-image": "{maki}-11",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 9,
                "text-padding": 2,
                "text-offset": [
                    0,
                    0.6
                ],
                "text-anchor": "top",
                "text-size": 12
            },
            "metadata": {
                "mapbox:group": "1444849297111.495"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "scalerank",
                    4
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "poi_label_4",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "poi_label"
        },
        {
            "interactive": true,
            "minzoom": 15,
            "layout": {
                "icon-image": "{maki}-11",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 9,
                "text-padding": 2,
                "text-offset": [
                    0,
                    0.6
                ],
                "text-anchor": "top",
                "text-size": 12
            },
            "metadata": {
                "mapbox:group": "1444849297111.495"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "scalerank",
                    3
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "poi_label_3",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "poi_label"
        },
        {
            "interactive": true,
            "minzoom": 14,
            "layout": {
                "icon-image": "{maki}-11",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 9,
                "text-padding": 2,
                "text-offset": [
                    0,
                    0.6
                ],
                "text-anchor": "top",
                "text-size": 12
            },
            "metadata": {
                "mapbox:group": "1444849297111.495"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "scalerank",
                    2
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "poi_label_2",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "poi_label"
        },
        {
            "layout": {
                "text-size": 12,
                "icon-image": "{maki}-11",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-padding": 2,
                "visibility": "visible",
                "text-offset": [
                    0,
                    0.6
                ],
                "text-anchor": "top",
                "text-field": "{name_en}",
                "text-max-width": 9
            },
            "metadata": {
                "mapbox:group": "1444849297111.495"
            },
            "type": "symbol",
            "source": "mapbox",
            "id": "rail_station_label",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "rail_station_label",
            "interactive": true
        },
        {
            "interactive": true,
            "minzoom": 13,
            "layout": {
                "icon-image": "{maki}-11",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 9,
                "text-padding": 2,
                "text-offset": [
                    0,
                    0.6
                ],
                "text-anchor": "top",
                "text-size": 12
            },
            "metadata": {
                "mapbox:group": "1444849297111.495"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "scalerank",
                    1
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "poi_label_1",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "poi_label"
        },
        {
            "interactive": true,
            "minzoom": 11,
            "layout": {
                "icon-image": "{maki}-11",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 9,
                "text-padding": 2,
                "text-offset": [
                    0,
                    0.6
                ],
                "text-anchor": "top",
                "text-size": 12
            },
            "metadata": {
                "mapbox:group": "1444849297111.495"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "in",
                    "scalerank",
                    1,
                    2,
                    3
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "airport_label",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "airport_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Regular",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-size": {
                    "base": 1,
                    "stops": [
                        [
                            13,
                            12
                        ],
                        [
                            14,
                            13
                        ]
                    ]
                },
                "symbol-placement": "line"
            },
            "metadata": {
                "mapbox:group": "1456163609504.0715"
            },
            "filter": [
                "!=",
                "class",
                "ferry"
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "road_label",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "road_label"
        },
        {
            "interactive": true,
            "minzoom": 8,
            "layout": {
                "text-field": "{ref}",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-size": 11,
                "icon-image": "motorway_{reflen}",
                "symbol-placement": {
                    "base": 1,
                    "stops": [
                        [
                            10,
                            "point"
                        ],
                        [
                            11,
                            "line"
                        ]
                    ]
                },
                "symbol-spacing": 500,
                "text-rotation-alignment": "viewport",
                "icon-rotation-alignment": "viewport"
            },
            "metadata": {
                "mapbox:group": "1456163609504.0715"
            },
            "filter": [
                "<=",
                "reflen",
                6
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "road_label_highway_shield",
            "paint": {},
            "source-layer": "road_label"
        },

        // BEGIN PLACE LABELS

        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Bold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-letter-spacing": 0.1,
                "text-field": "{name_en}",
                "text-max-width": 9,
                "text-size": {
                    "base": 1.2,
                    "stops": [
                        [
                            12,
                            10
                        ],
                        [
                            15,
                            14
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849272561.29"
            },
            "filter": [
                "in",
                "type",
                "hamlet",
                "suburb",
                "neighbourhood",
                "island",
                "islet"
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "place_label_other",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "place_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Regular",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 8,
                "text-size": {
                    "base": 1.2,
                    "stops": [
                        [
                            10,
                            12
                        ],
                        [
                            15,
                            22
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849272561.29"
            },
            "filter": [
                "==",
                "type",
                "village"
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "place_label_village",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "place_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Regular",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 8,
                "text-size": {
                    "base": 1.2,
                    "stops": [
                        [
                            10,
                            14
                        ],
                        [
                            15,
                            24
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849272561.29"
            },
            "filter": [
                "==",
                "type",
                "town"
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "place_label_town",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "place_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 8,
                "text-size": {
                    "base": 1.2,
                    "stops": [
                        [
                            7,
                            14
                        ],
                        [
                            11,
                            24
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849272561.29"
            },
            "filter": [
                "==",
                "type",
                "city"
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "place_label_city",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "place_label"
        },



        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-letter-spacing": 0.2,
                "symbol-placement": "line",
                "text-size": {
                    "stops": [
                        [
                            3,
                            11
                        ],
                        [
                            4,
                            12
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    ">=",
                    "labelrank",
                    4
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_line_4",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 6,
                "text-letter-spacing": 0.2,
                "symbol-placement": "point",
                "text-size": {
                    "stops": [
                        [
                            3,
                            11
                        ],
                        [
                            4,
                            12
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    ">=",
                    "labelrank",
                    4
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_4",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-letter-spacing": 0.2,
                "symbol-placement": "line",
                "text-size": {
                    "stops": [
                        [
                            3,
                            11
                        ],
                        [
                            4,
                            14
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "==",
                    "labelrank",
                    3
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_line_3",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 5,
                "text-letter-spacing": 0.2,
                "symbol-placement": "point",
                "text-size": {
                    "stops": [
                        [
                            3,
                            11
                        ],
                        [
                            4,
                            14
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "labelrank",
                    3
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_point_3",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-letter-spacing": 0.2,
                "symbol-placement": "line",
                "text-size": {
                    "stops": [
                        [
                            3,
                            14
                        ],
                        [
                            4,
                            16
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "==",
                    "labelrank",
                    2
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_line_2",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 5,
                "text-letter-spacing": 0.2,
                "symbol-placement": "point",
                "text-size": {
                    "stops": [
                        [
                            3,
                            14
                        ],
                        [
                            4,
                            16
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "labelrank",
                    2
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_point_2",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-letter-spacing": 0.2,
                "symbol-placement": "line",
                "text-size": {
                    "stops": [
                        [
                            3,
                            18
                        ],
                        [
                            4,
                            22
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "==",
                    "labelrank",
                    1
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_line_1",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Italic",
                    "Arial Unicode MS Regular"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 5,
                "text-letter-spacing": 0.2,
                "text-line-height": 1.6,
                "symbol-placement": "point",
                "text-offset": [
                    0,
                    2.4
                ],
                "text-size": {
                    "stops": [
                        [
                            3,
                            18
                        ],
                        [
                            4,
                            22
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849258897.3083"
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "Point"
                ],
                [
                    "==",
                    "labelrank",
                    1
                ]
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "marine_label_point_1",
            "paint": {
                "text-color": OTHER_LABEL_COLOR,
            },
            "source-layer": "marine_label"
        },

        // BEGIN COUNTRY LABELS

        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Bold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 6.25,
                "text-size": {
                    "stops": [
                        [
                            4,
                            11
                        ],
                        [
                            6,
                            15
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849242106.713"
            },
            "filter": [
                ">=",
                "scalerank",
                4
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "country_label_4",
            "paint": {
                "text-color": MAIN_LABEL_COLOR,
            },
            "source-layer": "country_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Bold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 6.25,
                "text-size": {
                    "stops": [
                        [
                            3,
                            11
                        ],
                        [
                            7,
                            17
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849242106.713"
            },
            "filter": [
                "==",
                "scalerank",
                3
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "country_label_3",
            "paint": {
                "text-color": MAIN_LABEL_COLOR,
            },
            "source-layer": "country_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Bold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 6.25,
                "text-size": {
                    "stops": [
                        [
                            2,
                            11
                        ],
                        [
                            5,
                            17
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849242106.713"
            },
            "filter": [
                "==",
                "scalerank",
                2
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "country_label_2",
            "paint": {
                "text-color": MAIN_LABEL_COLOR,
            },
            "source-layer": "country_label"
        },
        {
            "interactive": true,
            "layout": {
                "text-font": [
                    "Open Sans Bold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": OTHER_LABEL_TRANSFORM,
                "text-field": "{name_en}",
                "text-max-width": 6.25,
                "text-size": {
                    "stops": [
                        [
                            1,
                            11
                        ],
                        [
                            4,
                            17
                        ]
                    ]
                }
            },
            "metadata": {
                "mapbox:group": "1444849242106.713"
            },
            "filter": [
                "==",
                "scalerank",
                1
            ],
            "type": "symbol",
            "source": "mapbox",
            "id": "country_label_1",
            "paint": {
                "text-color": MAIN_LABEL_COLOR,
            },
            "source-layer": "country_label"
        }
    ]
}

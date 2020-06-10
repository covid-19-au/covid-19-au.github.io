import "./schema_types";

class CovidMapBoxControl {
    constructor(schemaTypeSelect, map) {
        this.schemas = FXIME;
        this.admin0Coords = FIXME;
        this.admin1Coords = FIXME;

        this.constantSelect = FIXME;
        this.dataTypes = FIXME;

        this.staticDataListing = FIXME;
        this.caseDataListing = FIXME;

        this.schemaTypeSelect = schemaTypeSelect;
        this.map = map;

        this.staticData = {};
        this.caseData = {};

        this.displayedSchemaInsts = [];
        this.displayedCaseDataInsts = [];
    }

    onMapMoveChange() {
        // TODO: Download any static/case data based on the
        //  countries/regions in view, and hide/show as needed!

        this.schemaTypeSelect.setPossibleOptions(
            this.getPossibleSchemaTypeSelectOptions()
        );
    }

    //========================================================//
    //                     Miscellaneous                      //
    //========================================================//

    mapContainsCoord(long, lat, bounds) {
        bounds = bounds || this.map.getBounds();
        return bounds.contains([long, lat]);
    }

    mapIntersects(long1, lat1, long2, lat2, bounds) {
        bounds = bounds || this.map.getBounds();

        return (
            bounds.contains([long1, lat1]) ||
            bounds.contains([long1, lat2]) ||
            bounds.contains([long2, lat1]) ||
            bounds.contains([long2, lat2])
        );
    }

    //========================================================//
    //                     Change Schemas                     //
    //========================================================//

    getPossibleSchemaTypes() {
        var admin0InView = this.getAdmin0InView(),
            mapZoom = this.map.getZoom(),
            r = [];

        for (var schema in this.schemas) {
            /*
            schemaInfo ->
            {
                "iso_3166": "TH",
                "min_zoom": 8,
                "priority": -1,
                "line_width": 0.5,
                "split_by_parent_region": false
            }
             */
            var schemaInfo = this.schemas[schema];

            if (schemaInfo.min_zoom != null && mapZoom <= schemaInfo.min_zoom) {
                continue;
            }
            else if (schemaInfo.max_zoom != null && mapZoom >= schemaInfo.max_zoom) {
                continue;
            }
            r.push(schema);
        }
        return r;
    }

    getAdmin0InView() {
        /*
        Find which admin0-level units (i.e. countries) are visible

        Returns an object of e.g. {'AU': true, 'US': false, ...}
         */
        return this.__getCoordsInView(this.admin0Coords);
    }

    getAdmin1InView() {
        /*
        Find which admin1-level units (i.e. states/territories/provinces) are visible

        Returns an object of e.g. {'AU-VIC': false, 'AU-WA': true, 'JP-01': false, ...}
         */
        return this.__getCoordsInView(this.admin1Coords);
    }

    __getCoordsInView(adminCoords) {
        /*
        Find which admin0-level units (i.e. countries) are visible
         */
        var bounds = this.map.getBounds(),
            inView = {};

        for (var [adminCode, long1, lat1, long2, lat2] of adminCoords) {
            inView[adminCode] = this.mapIntersects(
                long1, lat1, long2, lat2, bounds
            );
        }
        return inView;
    }

    //========================================================//
    //                     Get DataTypes                      //
    //========================================================//

    getPossibleDataTypes() {
        for (var dataType in this.dataTypes) {

        }
    }

    //========================================================//
    //                   Get Select Options                   //
    //========================================================//

    getPossibleMarkersSelectOptions(regionTypes) {
        /*
        TODO: Get all the possible markers that can be displayed
          considering whether the admin0/admin1
         */
        var selOptionsOut = [];

        for (var [groupText, groupItems] of this.constantSelect) {
            var groupItemsOut = [];

            for (var [optionText, optionValue] of groupItems) {
                var found = false;
                for (var [regionSchema, regionParent] of regionTypes) {
                    if (this.caseData[regionSchema][regionParent][optionValue]) { // CHECK ME!!! ====================
                        found = true;
                        break;
                    }
                }
                if (found) {
                    groupItemsOut.push([optionText, optionValue]);
                }
            }
            selOptionsOut.push([groupText, groupItemsOut]);
        }
        return selOptionsOut;
    }

    getPossibleUnderlaySelectOptions() {
        // TODO!
    }
}
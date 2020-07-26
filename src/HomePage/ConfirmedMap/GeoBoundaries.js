import ConfirmedMapFns from "./Fns"

import lgaGeoSchemas from "./geoschemas/GeoSchemaLGA"
import otherGeoSchemas from "./geoschemas/GeoSchemaOther"
import stateGeoSchemas from "./geoschemas/GeoSchemaState"

class GeoBoundaries {
    constructor() {
        this.__geoBoundaryCache = new Map();
    }

    __getGeoBoundaryClasses() {
        return {
            // LGA classes
            //"act:lga": ACTBoundary,
            "nsw:lga": lgaGeoSchemas.NSWLGABoundaries,
            "nt:lga": lgaGeoSchemas.NTLGABoundaries,
            "vic:lga": lgaGeoSchemas.VicLGABoundaries,
            "qld:lga": lgaGeoSchemas.QLDLGABoundaries,
            "sa:lga": lgaGeoSchemas.SALGABoundaries,
            "tas:lga": lgaGeoSchemas.TasLGABoundaries,
            "wa:lga": lgaGeoSchemas.WALGABoundaries,

            // Statewide outlines
            "act:statewide": stateGeoSchemas.ACTBoundary,
            "nsw:statewide": stateGeoSchemas.NSWBoundary,
            "nt:statewide": stateGeoSchemas.NTBoundary,
            "vic:statewide": stateGeoSchemas.VicBoundary,
            "qld:statewide": stateGeoSchemas.QLDBoundary,
            "sa:statewide": stateGeoSchemas.SABoundary,
            "tas:statewide": stateGeoSchemas.TasBoundary,
            "wa:statewide": stateGeoSchemas.WABoundary,

            // Other schemas
            "act:sa3": otherGeoSchemas.ACTSA3Boundaries,
            "qld:hhs": otherGeoSchemas.QLDHHSGeoBoundaries,
            "nsw:lhd": otherGeoSchemas.NSWLHDGeoBoundaries,
            "tas:ths": otherGeoSchemas.TasTHSBoundaries
            //"nsw:postcode": otherGeoSchemas.NSWPostCodeBoundaries
        };
    }

    getAvailableGeoBoundaries() {
        return ConfirmedMapFns.sortedKeys(
            this.__getGeoBoundaryClasses()
        );
    }

    getGeoBoundary(map, schema, stateName) {
        let key = `${stateName}:${schema}`;
        if (this.__geoBoundaryCache.has(key)) {
            return this.__geoBoundaryCache.get(key);
        }
        // console.log(`Creating new stateName:${stateName} schema:${schema}`)
        var inst = new (this.__getGeoBoundaryClasses()[key])(map);
        this.__geoBoundaryCache.set(key, inst);
        return inst;
    }

    clearGeoBoundaryCache() {
        // Make sure to call this when destroying the map!
        this.__geoBoundaryCache = new Map();
    }
}

export default GeoBoundaries;

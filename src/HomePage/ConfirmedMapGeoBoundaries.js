import ConfirmedMapFns from "./ConfirmedMapFns"

import lgaGeoSchemas from "./ConfirmedMapGeoSchemaLGA"
import otherGeoSchemas from "./ConfirmedMapGeoSchemaOther"
import stateGeoSchemas from "./ConfirmedMapGeoSchemaState"


function __getGeoBoundaryClasses() {
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


function getAvailableGeoBoundaries() {
    return ConfirmedMapFns.sortedKeys(__getGeoBoundaryClasses());
}


var __geoBoundaryCache = new Map();
function getGeoBoundary(map, schema, stateName) {
    let key = `${stateName}:${schema}`;
    if (__geoBoundaryCache.has(key)) {
        return __geoBoundaryCache.get(key);
    }
    // console.log(`Creating new stateName:${stateName} schema:${schema}`)
    var inst = new (__getGeoBoundaryClasses()[key])(map);
    __geoBoundaryCache.set(key, inst);
    return inst;
}


function clearGeoBoundaryCache() {
    // Make sure to call this when destroying the map!
    __geoBoundaryCache = new Map();
}


// We'll only allow access to these
// classes via the above utility fns
var exportDefaults = {
    getGeoBoundary: getGeoBoundary,
    getAvailableGeoBoundaries: getAvailableGeoBoundaries,
    clearGeoBoundaryCache: clearGeoBoundaryCache
};
export default exportDefaults;

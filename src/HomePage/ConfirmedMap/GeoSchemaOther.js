import actSaData from "../../data/sa3_act.geojson";
import qldHhsData from "../../data/hhs_qld.geojson";
import nswLhdData from "../../data/lhd_nsw.geojson";
import tasThsData from "../../data/ths_tas.geojson";
import nswPostCodeData from "../../data/suburb_nsw.geojson"
import ConfirmedMapFns from "./Fns";
import JSONGeoBoundariesBase from "./GeoBoundariesBase"


/*******************************************************************
 * Other boundary schemas
 *******************************************************************/


class ACTSA3Boundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'sa3', 'ACT','sa3_act', actSaData);
    }
    getCityNameFromProperty(data) {
        return data.properties['name'];
    }
}

class QLDHHSGeoBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'hhs', 'QLD', 'hhs_qld', qldHhsData);
    }
    getCityNameFromProperty(data) {
        return data.properties.HHS;
    }
}

class NSWLHDGeoBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'nsw', 'NSW', 'lhd_nsw', nswLhdData);
    }
    getCityNameFromProperty(data) {
        return data.properties.name;
    }
}

class TasTHSBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'ths', 'TAS', 'ths_tas', tasThsData);
    }
    getCityNameFromProperty(data) {
        if (!data.properties['tas_ths']) {
            return null;
        }
        return ConfirmedMapFns.toTitleCase(data.properties['tas_ths']);
    }
}

class NSWPostCodeBoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'postcode', 'NSW', 'postcode_nsw', nswPostCodeData);
    }
    getCityNameFromProperty(data) {
        var v = data.properties.loc_pid;
        if (v) {
            return v.replace('NSW', '');
        }
        return null;
    }
    getCityPrintableNameFromProperty(data) {
        var v = data.properties.nsw_loca_2;
        if (v) {
            return ConfirmedMapFns.toTitleCase(v);
        }
        return null;
    }
}


export default {
    ACTSA3Boundaries: ACTSA3Boundaries,
    QLDHHSGeoBoundaries: QLDHHSGeoBoundaries,
    NSWLHDGeoBoundaries: NSWLHDGeoBoundaries,
    TasTHSBoundaries: TasTHSBoundaries,
    NSWPostCodeBoundaries: NSWPostCodeBoundaries
}

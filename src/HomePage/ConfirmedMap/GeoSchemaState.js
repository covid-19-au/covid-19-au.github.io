import actOutlineData from "../../data/boundary_act.geojson";
import nswOutlineData from "../../data/boundary_nsw.geojson";
import ntOutlineData from "../../data/boundary_nt.geojson";
import vicOutlineData from "../../data/boundary_vic.geojson";
import qldOutlineData from "../../data/boundary_qld.geojson";
import saOutlineData from "../../data/boundary_sa.geojson";
import tasOutlineData from "../../data/boundary_tas.geojson";
import waOutlineData from "../../data/boundary_wa.geojson";
import JSONGeoBoundariesBase from "./GeoBoundariesBase"


/*******************************************************************
 * Simple state boundaries
 *******************************************************************/


class ACTBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'ACT', 'boundary_act', actOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'ACT';
    }
}

class NSWBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'NSW', 'boundary_nsw', nswOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'NSW';
    }
}

class NTBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'NT', 'boundary_nt', ntOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'NT';
    }
}

class VicBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'VIC', 'boundary_vic', vicOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'VIC';
    }
}

class QLDBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'QLD', 'boundary_qld', qldOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'QLD';
    }
}

class SABoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'SA', 'boundary_sa', saOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'SA';
    }
}

class TasBoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'TAS', 'boundary_tas', tasOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'TAS';
    }
}

class WABoundary extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'statewide', 'WA', 'boundary_wa', waOutlineData);
    }
    getCityNameFromProperty(data) {
        return 'WA';
    }
}


export default {
    ACTBoundary: ACTBoundary,
    NSWBoundary: NSWBoundary,
    NTBoundary: NTBoundary,
    VicBoundary: VicBoundary,
    QLDBoundary: QLDBoundary,
    SABoundary: SABoundary,
    TasBoundary: TasBoundary,
    WABoundary: WABoundary
}

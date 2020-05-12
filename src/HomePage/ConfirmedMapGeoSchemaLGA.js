import waLgaData from "../data/lga_wa.geojson";
import ConfirmedMapFns from "./ConfirmedMapFns";
import nswLgaData from "../data/lga_nsw.geojson";
import vicLgaData from "../data/lga_vic.geojson";
import ntLgaData from "../data/lga_nt.geojson";
import qldLgaData from "../data/lga_qld.geojson";
import saLgaData from "../data/lga_sa.geojson";
import tasLgaData from "../data/lga_tas.geojson";
import JSONGeoBoundariesBase from "./ConfirmedMapGeoBoundariesBase"


/*******************************************************************
 * LGA schema boundaries
 *******************************************************************/


class WALGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'WA','lga_wa', waLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties.wa_lga_s_3);
    }
}

class NSWLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'NSW','lga_nsw', nswLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties.nsw_lga__3);
    }
}

class VicLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'VIC','lga_vic', vicLgaData);
    }
    getCityNameFromProperty(data) {
        let city_name = data.properties.vic_lga__2;
        var city = city_name.split(" ");
        city.pop();
        city_name = city.join(' ');
        return ConfirmedMapFns.toTitleCase(city_name);
    }
}

class NTLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'lga', 'NT', 'lga_nt', ntLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties['nt_lga_s_3']);
    }
}

class QLDLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map,'lga', 'QLD', 'lga_qld', qldLgaData);
    }
    getCityNameFromProperty(data) {
        return data.properties['qld_lga__3'] ?
            ConfirmedMapFns.toTitleCase(data.properties['qld_lga__3']) : null;
    }
}

class SALGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'lga', 'SA', 'lga_sa', saLgaData);
    }
    getCityNameFromProperty(data) {
        return ConfirmedMapFns.toTitleCase(data.properties['abbname']);
    }
}

class TasLGABoundaries extends JSONGeoBoundariesBase {
    constructor(map) {
        super(map, 'lga', 'TAS', 'lga_tas', tasLgaData);
    }
    getCityNameFromProperty(data) {
        //console.log(data.properties['tas_lga__3'])
        return ConfirmedMapFns.toTitleCase(data.properties['tas_lga__3']);
    }
}

export default {
    WALGABoundaries: WALGABoundaries,
    NSWLGABoundaries: NSWLGABoundaries,
    VicLGABoundaries: VicLGABoundaries,
    NTLGABoundaries: NTLGABoundaries,
    QLDLGABoundaries: QLDLGABoundaries,
    SALGABoundaries: SALGABoundaries,
    TasLGABoundaries: TasLGABoundaries
}

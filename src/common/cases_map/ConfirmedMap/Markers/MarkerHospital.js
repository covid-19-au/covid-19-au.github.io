import hospitalImg from "../../../../assets/img/icon/hospital.png";
import mapboxgl from "mapbox-gl/dist/mapbox-gl";

/*******************************************************************
 * Hospital markers
 *******************************************************************/

class MarkerHospital {
    constructor(map, item) {
        this.map = map;
        this.item = item;

        // create a HTML element for each feature
        var el = this.el = document.createElement('div');

        this._setStyles(el);
        this._addMarker(el);
        this.hide();
    }

    show() {
        if (this._marker)
            return;
        this.el.style.display = 'block';
        this._addMarker(this.el);
    }

    hide() {
        this.el.style.display = 'none';
        if (!this._marker)
            return;
        this._marker.remove();
        delete this._marker;
    }

    _setStyles() {
        const el = this.el;
        el.className = 'marker';
        el.style.height = '20px';
        el.style.width = '20px';
        el.style.backgroundSize = 'cover';
        el.style.backgroundImage = `url(${hospitalImg})`;
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
    }

    _addMarker(el) {
        let coor = [
            this.item['coor'][1],
            this.item['coor'][0]
        ];

        // make a marker for each feature and add to the map
        new mapboxgl
            .Marker(el)
            .setLngLat(coor)
            .setPopup(
                new mapboxgl
                    .Popup({ offset: 25 }) // add popups
                    .setHTML(
                        '<h3 style="margin:0;">' + this.item['name'] + '</h3>' +
                        '<p style="margin:0;">Phone: ' + this.item['hospitalPhone'] + '</p>' +
                        '<p style="margin:0;">Addr: ' + this.item['address'] + '</p>'
                    )
            )
            .addTo(this.map);
    }
}

export default MarkerHospital;

import confirmedImg from "../../../img/icon/confirmed-recent.png";
import mapboxgl from "mapbox-gl/dist/mapbox-gl";


/*******************************************************************
 * Confirmed markers
 *******************************************************************/


// Threshold for an 'old case', in days
let OLD_CASE_DAYS = 21;


class MarkerConfirmed {
    constructor(map, item) {
        this.map = map;
        this.item = item;

        if (item['state'] === 'VIC' && item['area'].length > 0) {
            item['description'] =
                "This case number is just the suburb confirmed " +
                "number, not the case number at this geo point.";
        }

        // create a HTML element for each feature
        var el = this.el = document.createElement('div');
        el.className = 'marker';
        el.style.height = '20px';
        el.style.width = '20px';
        el.style.backgroundSize = 'cover';
        el.style.backgroundImage = `url(${confirmedImg})`;
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';

        el.onclick = (event) => {
            event.preventDefault();
            return false;
        };

        this.hide();
    }

    _addMarker() {
        // make a marker for each feature and add to the map
        this._marker = new mapboxgl
            .Marker(this.el)
            .setLngLat([
                this.item['coor'][1],
                this.item['coor'][0]
            ])
            .setPopup(
                new mapboxgl
                    .Popup({ offset: 25 }) // add popups
                    .setHTML(
                        `<h3 style="margin:0;">${this.item['name']}</h3>` +
                        `<p style="margin:0;">${this.item['date']}</p>` +
                        `<p style="margin:0;">${this.item['description']}</p>`
                    )
            )
            .addTo(this.map);
    }

    show() {
        if (this._marker) return;
        this.el.style.display = 'block';
        this._addMarker(this.el);
    }

    hide() {
        this.el.style.display = 'none';
        if (!this._marker) return;
        this._marker.remove();
        delete this._marker;
    }

    getIsActive(today) {
        // Default constructor has current day/time
        today = today || new Date();
        // Adjust to midnight current day
        today.setHours(0, 0, 0, 0);

        // 'DD/MM/YY' format
        // Assume entries with incorrect formats are old
        const eventDay = this.item['date'];
        if (eventDay.split("/").length !== 3 || eventDay === 'N/A') {
            return false;
        }

        // Day of the event. Transform to YYYY/MM/DD format
        let [day, month, year] = eventDay.split('/');
        let caseDate = new Date(
            year.length === 2 ? parseInt('20' + year) : parseInt(year),
            parseInt(month)-1, parseInt(day)
        );

        // True if the original date was more than
        // 3 weeks old and before the current date
        return (
            caseDate <= today &&
            caseDate >= new Date(today.getTime() - OLD_CASE_DAYS*86400000)
        );
    }
}

export default MarkerConfirmed;

import confirmedImg from "../../../img/icon/confirmed-recent.png";
import orangeImg from "../../../img/icon/orange_covid_pin.png";
import redImg from "../../../img/icon/red_covid_pin.png";
import mapboxgl from "mapbox-gl/dist/mapbox-gl";


/*******************************************************************
 * Confirmed markers
 *******************************************************************/


// Threshold for an 'old case', in days
let OLD_CASE_DAYS = 15;
let __openPopup;


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

        if (item['type'] === 'monitor') {
            el.style.backgroundImage = `url(${orangeImg})`;
        } else if (item['type'] === 'isolate') {
            el.style.backgroundImage = `url(${redImg})`;
        } else {
            el.style.backgroundImage = `url(${confirmedImg})`;
        }

        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';


        el.onclick = evt => {
            let popup = this._marker.getPopup();
            popup.isOpen()?this.map.fire('allowAllPopups'):
                this.map.fire('closeAllPopups');
           
            // Stop the case statistics dialog from showing
            evt.preventDefault();
            evt.stopPropagation();

            // Hide any existing open popups
            if (__openPopup) {
                __openPopup.remove()
                __openPopup = null;
            }

            // Add the new popup, and register this
            // one as being the currently open popup
            this.popup.addTo(this.map);
            __openPopup = this.popup

            return false;
        };

        this.hide();
    }

    _addMarker() {
        // make a marker for each feature and add to the map
        this.popup = new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML(
                `<p style="margin:0; font-size: 1.3em"><b>Area:</b> ${this.item['area']}</p>` +
                `<p style="margin:0; margin-top: 5px; font-size: 1.3em"><b>Venue:</b> ${this.item['venue']}</p>` +
                `<p style="margin:0; margin-top: 5px; font-size: 1.3em"><b>Date:</b> ${this.item['date']}</p>` +
                `<p style="margin:0; margin-top: 5px; font-size: 1.3em"><b>Time:</b> ${this.item['time']}</p>` +
                `<p style="margin:0; margin-top: 8px; font-size: 1.3em; font-weight: bold">${this.item['description']}</p>`
            )
        this._marker = new mapboxgl
            .Marker(this.el)
            .setLngLat([this.item['coor'][1], this.item['coor'][0]])
            .setPopup(this.popup)
            .addTo(this.map);
    }

    getPopupStatus() {
        if(this._marker){
            let popup = this._marker.getPopup();
            return popup.isOpen()
        }
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

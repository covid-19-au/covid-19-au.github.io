module.exports = {
    /*******************************************************************
     * Array helper functions
     *******************************************************************/

    sortedKeys: function(o) {
        // Return the keys in `o`, sorting
        // (case-sensitive)
        var r = [];
        for (var k in o) {
            if (!o.hasOwnProperty(k)) {
                continue;
            }
            r.push(k);
        }
        r.sort();
        return r
    },

    /*******************************************************************
     * String functions
     *******************************************************************/

    toTitleCase: function(str) {
        // convert to Title Case
        // https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    },

    prepareForComparison: function(s) {
        // Replace different kinds of successive hyphens
        // and whitespace with only a single hyphen,
        // then lowercase before comparing to make sure
        // e.g. "KALGOORLIE-BOULDER" matches against
        // "Kalgoorlie - Boulder"
        s = s.replace(/(\s*[-‒–—])\s+/g, '-');
        s = s.toLowerCase();
        // Sync me with get_regions_json_data in the web app!!
        s = s.replace('the corporation of the city of ', '');
        s = s.replace('the corporation of the town of ', '');
        s = s.replace('pastoral unincorporated area', 'pua');
        s = s.replace('district council', '');
        s = s.replace('regional council', '');
        s = s.replace(' shire', '');
        s = s.replace(' council', '');
        s = s.replace(' regional', '');
        s = s.replace(' rural', '');
        s = s.replace('the dc of ', '');
        s = s.replace('town of ', '');
        s = s.replace('city of ', '');
        if (s.indexOf('the ') === 0)
            s = s.slice(4);
        return s;
    },

    /*******************************************************************
     * Date functions
     *******************************************************************/

    getToday: function() {
        // Get today's date, setting the time to
        // midnight to allow for calculations
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    },

    parseDate: function(str) {
        // Convert `str` to a `Date` object
        // dateString must be dd/mm/yyyy format
        var mdy = str.split('/');
        // year, month index, day
        return new Date(mdy[2], mdy[1] - 1, mdy[0]);
    },

    dateDiff: function(first, second) {
        // Get the difference in days between
        // the first and second `Date` instances
        return Math.round((second - first) / (1000 * 60 * 60 * 24));
    },

    dateDiffFromToday: function(dateString) {
        // Get number of days ago from today and
        // `dateString` in dd/mm/yyyy format
        // NOTE: returns a *positive* number if
        // `dateString` is in the past
        var today = this.getToday();
        var dateUpdatedInst = this.parseDate(dateString).getTime();
        return this.dateDiff(dateUpdatedInst, today);
    }
}

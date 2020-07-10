/**
 * Method for adding suffix to date
 * @param {int} i date
 */
function ordinal_suffix_of(i) {
    var j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return i + "st";
    }
    if (j === 2 && k !== 12) {
        return i + "nd";
    }
    if (j === 3 && k !== 13) {
        return i + "rd";
    }
    return i + "th";
}

/**
 * Method for formatting time into am/pm format
 * @param {Date} date date
 */
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ' ' + minutes + ' ' + ampm;
    return strTime;
}

/**
 * Method for adding aria label to datetime of status update
 * @param {String} updatedTime update time for status information
 */
function getAriaLabelForUpdatedTime(updatedTime) {
    var timeElem = updatedTime.split(" ")[0].split(":")
    var dateElem = []
    if (updatedTime.split(" ")[1].includes("/")) {
        dateElem = updatedTime.split(" ")[1].split("/")
    }
    else if (updatedTime.split(" ")[1].includes("-")) {
        dateElem = updatedTime.split(" ")[1].split("-")
    }
    var tempDate = new Date(dateElem[2], dateElem[1], dateElem[0], timeElem[0], timeElem[1])
    const month = tempDate.toLocaleString('default', { month: 'long' });
    return `Time in AEST, last updated at: ${ordinal_suffix_of(tempDate.getDate())} of ${month} ${tempDate.getFullYear()} at ${formatAMPM(tempDate)}`
}

export default {
    ordinal_suffix_of: ordinal_suffix_of,
    formatAMPM: formatAMPM,
    getAriaLabelForUpdatedTime: getAriaLabelForUpdatedTime
};


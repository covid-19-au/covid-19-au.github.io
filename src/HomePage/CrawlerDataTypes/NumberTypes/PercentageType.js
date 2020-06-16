class PercentageType extends NumberType {
    getPrettifiedValue() {

    }

    getCompactValue(digits) {
        // TODO: What could be done here!?
        //   It really needs the maximum/minimum values

        var n = Math.abs(this);
        var decimal = n - Math.floor(n);
        var negative = this < 0 ? '-' : '';

        if (n >= 1) {
            return parseInt(this)+'%'
        }
        else if (n >= 0.1) {
            return `${negative}${String(decimal).slice(0, 3)}`;
        }
        else if (n >= 0.01) {
            return `${negative}${String(decimal).slice(0, 4)}`;
        }
        else if (n >= 0.001) {
            return `${negative}${String(decimal).slice(0, 5)}`;
        }
        else {
            return '0%';  // TODO: Is there any instance this could be a problem? ======================================
        }
    }

    getCanvasJSFormat() {

    }
}

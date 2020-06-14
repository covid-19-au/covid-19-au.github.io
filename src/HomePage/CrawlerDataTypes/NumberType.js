function getNumberByType(type, value) {
    switch (type) {
        case 'number': return new NumberType(value);
        case 'percent': return new PercentageType(value);
        case 'dollars': return new DollarsType(value);
        case 'float': return new FloatType(value);
        case 'integer': return new IntegerType(value);
        case 'per100k': return new Per100kType(value);
        default: throw `Unknown number type ${type}`;
    }
}


class NumberType extends Number {
    getPrettifiedValue() {
        // TODO!
    }

    getCompactValue(digits) {
        // https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
        var si = [
            {value: 1, symbol: ""},
            {value: 1E3, symbol: "k"},
            {value: 1E6, symbol: "M"},
            {value: 1E9, symbol: "G"},
            {value: 1E12, symbol: "T"},
            {value: 1E15, symbol: "P"},
            {value: 1E18, symbol: "E"}
        ];
        var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
        var i;

        for (i = si.length - 1; i > 0; i--) {
            if (this >= si[i].value) {
                break;
            }
        }
        return (this / si[i].value)
               .toFixed(digits)
               .replace(rx, "$1") + si[i].symbol;
    }
}


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
}


class DollarsType extends NumberType {
    getPrettifiedValue() {

    }

    getCompactValue(digits) {
        // TODO: What could be done here!?
        //   It really needs the maximum/minimum values
    }
}


class FloatType extends NumberType {
    getPrettifiedValue() {

    }

    getCompactValue(digits) {
        // TODO: What could be done here!?
        //   It really needs the maximum/minimum values
    }
}


class IntegerType extends NumberType {
    getPrettifiedValue() {

    }

    getCompactValue(digits) {
        // TODO: What could be done here!?
        //   It really needs the maximum/minimum values
    }
}


class Per100kType extends NumberType {
    getPrettifiedValue() {

    }

    getCompactValue(digits) {
        // TODO: What could be done here!?
        //   It really needs the maximum/minimum values
    }
}


class OneHotValues extends NumberType {
    // TODO: Is this ever needed/desirable??? ==============
}

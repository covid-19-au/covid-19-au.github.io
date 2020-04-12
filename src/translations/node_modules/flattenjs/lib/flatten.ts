let _ = require('lodash');

export function undo(params) {
    return _.reduce(params, function (result, value, key) { return _.set(result, key, value) }, {});
}

export function convert(obj) {
    return _.transform(obj, function (result, value, key) {
        if (_.isObject(value)) {
            let flatMap = _.mapKeys(convert(value), function (mvalue, mkey) {
                if (_.isArray(value)) {
                    let index = mkey.indexOf('.');
                    if (-1 !== index) {
                        return `${key}[${mkey.slice(0, index)}]${mkey.slice(index)}`;
                    }
                    return `${key}[${mkey}]`;
                }
                return `${key}.${mkey}`;
            });

            _.assign(result, flatMap);
        } else {
            result[key] = value;
        }

        return result;
    }, {});
}

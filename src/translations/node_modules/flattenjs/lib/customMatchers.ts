let _ = require('lodash');

export let matchers = {
    toDeepEqual: (util, customEqualityTesters) => {
        return {
            compare: (actual, expected) => {
                let result = {
                    pass: _.isEqual(actual, expected),
                    message: undefined
                };

                if (!result.pass) {
                    result.message = `Expected: ${JSON.stringify(expected)} Actual: ${JSON.stringify(actual)}`;
                }
                return result;
            }
        };
    }
};

"use strict";
var _ = require('lodash');
exports.matchers = {
    toDeepEqual: function (util, customEqualityTesters) {
        return {
            compare: function (actual, expected) {
                var result = {
                    pass: _.isEqual(actual, expected),
                    message: undefined
                };
                if (!result.pass) {
                    result.message = "Expected: " + JSON.stringify(expected) + " Actual: " + JSON.stringify(actual);
                }
                return result;
            }
        };
    }
};
//# sourceMappingURL=customMatchers.js.map
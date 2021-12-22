"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFirst = exports.lowerFirst = exports.higherFirst = void 0;
const assert_1 = require("./assert");
// -1 => element1 first
// +1 => element2 first
function higherFirst(getValue) {
    return (element1, element2) => {
        const val1 = getValue(element1);
        const val2 = getValue(element2);
        if (val1 === val2) {
            return 0;
        }
        return val1 > val2 ? -1 : 1;
    };
}
exports.higherFirst = higherFirst;
function lowerFirst(getValue) {
    return (element1, element2) => {
        const val1 = getValue(element1);
        const val2 = getValue(element2);
        if (val1 === val2) {
            return 0;
        }
        return val1 < val2 ? -1 : 1;
    };
}
exports.lowerFirst = lowerFirst;
function makeFirst(getValue) {
    return (element1, element2) => {
        const val1 = getValue(element1);
        const val2 = getValue(element2);
        (0, assert_1.assert)([true, false].includes(val1));
        (0, assert_1.assert)([true, false].includes(val2));
        if (val1 === val2) {
            return 0;
        }
        if (val1) {
            return -1; // element1 first
        }
        if (val2) {
            return 1; // element2 first
        }
        (0, assert_1.assert)(false);
    };
}
exports.makeFirst = makeFirst;
//# sourceMappingURL=sorter.js.map
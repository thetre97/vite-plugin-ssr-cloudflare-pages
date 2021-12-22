import { assert } from './assert';
export { higherFirst };
export { lowerFirst };
export { makeFirst };
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
function makeFirst(getValue) {
    return (element1, element2) => {
        const val1 = getValue(element1);
        const val2 = getValue(element2);
        assert([true, false].includes(val1));
        assert([true, false].includes(val2));
        if (val1 === val2) {
            return 0;
        }
        if (val1) {
            return -1; // element1 first
        }
        if (val2) {
            return 1; // element2 first
        }
        assert(false);
    };
}
//# sourceMappingURL=sorter.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slice = void 0;
const assert_1 = require("./assert");
function slice(thing, from, to) {
    if (typeof thing === 'string') {
        return sliceArray(thing.split(''), from, to).join('');
    }
    else {
        return sliceArray(thing, from, to);
    }
}
exports.slice = slice;
function sliceArray(list, from, to) {
    const listSlice = [];
    let start = from >= 0 ? from : list.length + from;
    (0, assert_1.assert)(start >= 0 && start <= list.length);
    let end = to >= 0 ? to : list.length + to;
    (0, assert_1.assert)(end >= 0 && end <= list.length);
    while (true) {
        if (start === end) {
            break;
        }
        if (start === list.length) {
            start = 0;
        }
        if (start === end) {
            break;
        }
        const el = list[start];
        (0, assert_1.assert)(el !== undefined);
        listSlice.push(el);
        start++;
    }
    return listSlice;
}
//# sourceMappingURL=slice.js.map
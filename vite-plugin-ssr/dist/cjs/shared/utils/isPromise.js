"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = void 0;
const hasProp_1 = require("./hasProp");
const isCallable_1 = require("./isCallable");
function isPromise(thing) {
    return (0, hasProp_1.hasProp)(thing, 'then') && (0, isCallable_1.isCallable)(thing.then);
}
exports.isPromise = isPromise;
//# sourceMappingURL=isPromise.js.map
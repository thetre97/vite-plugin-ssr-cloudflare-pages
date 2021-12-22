"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPathDistance = void 0;
const assert_1 = require("./assert");
function getPathDistance(pathA, pathB) {
    (0, assert_1.assert)(pathA.startsWith('/'));
    (0, assert_1.assert)(pathB.startsWith('/'));
    (0, assert_1.assert)(!pathA.startsWith('\\'));
    (0, assert_1.assert)(!pathB.startsWith('\\'));
    let charIdx = 0;
    for (; charIdx < pathA.length && charIdx < pathB.length; charIdx++) {
        if (pathA[charIdx] !== pathB[charIdx])
            break;
    }
    const pathAWithoutCommon = pathA.slice(charIdx);
    const pathBWithoutCommon = pathB.slice(charIdx);
    const distanceA = pathAWithoutCommon.split('/').length;
    const distanceB = pathBWithoutCommon.split('/').length;
    const distance = distanceA + distanceB;
    return distance;
}
exports.getPathDistance = getPathDistance;
//# sourceMappingURL=getPathDistance.js.map
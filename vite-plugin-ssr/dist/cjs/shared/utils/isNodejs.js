"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodejs = void 0;
const assert_1 = require("./assert");
// We don't use `isNodejs()` anymore because it doesn't work for Cloudflare Workers
function isNodejs() {
    (0, assert_1.assert)(false);
    // return typeof process !== 'undefined' && typeof process.versions.node !== 'undefined'
}
exports.isNodejs = isNodejs;
//# sourceMappingURL=isNodejs.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSsrEnv = exports.setSsrEnv = void 0;
const utils_1 = require("../shared/utils");
function getSsrEnv() {
    const ssrEnv = global.__vite_ssr_plugin;
    (0, utils_1.assertBaseUrl)(ssrEnv.baseUrl);
    return ssrEnv;
}
exports.getSsrEnv = getSsrEnv;
function setSsrEnv(ssrEnv) {
    (0, utils_1.assertBaseUrl)(ssrEnv.baseUrl);
    global.__vite_ssr_plugin = ssrEnv;
}
exports.setSsrEnv = setSsrEnv;
//# sourceMappingURL=ssrEnv.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSSR_options = exports.isSSR_config = void 0;
const utils_1 = require("../../../shared/utils");
function isSSR_config(config) {
    var _a;
    return !!((_a = config === null || config === void 0 ? void 0 : config.build) === null || _a === void 0 ? void 0 : _a.ssr);
}
exports.isSSR_config = isSSR_config;
// https://github.com/vitejs/vite/discussions/5109#discussioncomment-1450726
function isSSR_options(options) {
    if (options === undefined) {
        return false;
    }
    if (typeof options === 'boolean') {
        return options;
    }
    if ((0, utils_1.isObject)(options)) {
        return !!options.ssr;
    }
    (0, utils_1.assert)(false);
}
exports.isSSR_options = isSSR_options;
//# sourceMappingURL=isSSR.js.map
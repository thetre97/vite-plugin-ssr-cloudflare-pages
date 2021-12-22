"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleExists = void 0;
const path_1 = require("path");
const assert_1 = require("./assert");
function moduleExists(modulePath, dirPath) {
    if (!(0, path_1.isAbsolute)(modulePath)) {
        (0, assert_1.assert)(dirPath);
        (0, assert_1.assert)((0, path_1.isAbsolute)(dirPath));
        modulePath = (0, path_1.resolve)(dirPath, modulePath);
    }
    (0, assert_1.assert)((0, path_1.isAbsolute)(modulePath));
    // `req` instead of `require` in order to skip Webpack's dependency analysis
    const req = require;
    try {
        req.resolve(modulePath);
        return true;
    }
    catch (err) {
        return false;
    }
}
exports.moduleExists = moduleExists;
//# sourceMappingURL=moduleExists.js.map
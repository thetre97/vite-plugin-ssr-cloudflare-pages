"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertExports = void 0;
const assert_1 = require("./assert");
const isObject_1 = require("./isObject");
const stringifyStringArray_1 = require("./stringifyStringArray");
function assertExports(fileExports, filePath, exportNames, renamedExports = {}, deprecatedExports = {}) {
    (0, assert_1.assert)((0, isObject_1.isObject)(fileExports));
    const unknownExports = [];
    Object.keys(fileExports).forEach((exportName) => {
        (0, assert_1.assertUsage)(!(exportName in deprecatedExports), `Your ${filePath} exports \`${exportName}\` which has been deprecated in favor of \`${deprecatedExports[exportName]}\`. See \`CHANGELOG.md\`.`);
        (0, assert_1.assertUsage)(!(exportName in renamedExports), `Rename the export \`${exportName}\` to \`${renamedExports[exportName]}\` in ${filePath}`);
        if (!exportNames.includes(exportName)) {
            unknownExports.push(exportName);
        }
    });
    const errSuffix = `Only following exports are allowed: ${(0, stringifyStringArray_1.stringifyStringArray)(exportNames)}. See https://vite-plugin-ssr.com/custom-exports if you want to re-use code defined in ${filePath}.`;
    if (unknownExports.length !== 0) {
        if (unknownExports.length === 1) {
            (0, assert_1.assertWarning)(false, `Unknown exports ${(0, stringifyStringArray_1.stringifyStringArray)(unknownExports)} in ${filePath}. ${errSuffix}`);
        }
        else {
            (0, assert_1.assert)(unknownExports.length >= 2);
            (0, assert_1.assertWarning)(false, `Unknown export \`${unknownExports[0]}\` in ${filePath}. ${errSuffix}`);
        }
    }
}
exports.assertExports = assertExports;
//# sourceMappingURL=assertExports.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformPageServerFiles = void 0;
const es_module_lexer_1 = require("es-module-lexer");
const utils_1 = require("./utils");
function transformPageServerFiles() {
    return {
        name: 'vite-plugin-ssr:transformPageServerFiles',
        async transform(src, id, options) {
            if ((0, utils_1.isSSR_options)(options)) {
                return;
            }
            if (!/\.page\.server\.[a-zA-Z0-9]+$/.test(id)) {
                return;
            }
            await es_module_lexer_1.init;
            const exports = (0, es_module_lexer_1.parse)(src)[1];
            const hasExportOnBeforeRender = exports.includes('onBeforeRender') ? 'true' : 'false';
            return {
                code: `export const hasExportOnBeforeRender = ${hasExportOnBeforeRender};`,
                // Remove Source Map to save KBs
                //  - https://rollupjs.org/guide/en/#source-code-transformations
                map: { mappings: '' },
            };
        },
    };
}
exports.transformPageServerFiles = transformPageServerFiles;
//# sourceMappingURL=transformPageServerFiles.js.map
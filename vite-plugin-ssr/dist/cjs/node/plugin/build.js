"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const path_1 = require("path");
const utils_1 = require("../../shared/utils");
const glob = require("fast-glob");
const utils_2 = require("./utils");
function build() {
    let isSsrBuild;
    return {
        name: 'vite-plugin-ssr:build',
        apply: 'build',
        config: (config) => {
            var _a, _b;
            isSsrBuild = (0, utils_2.isSSR_config)(config);
            const input = Object.assign(Object.assign({}, entryPoints(config)), normalizeRollupInput((_b = (_a = config.build) === null || _a === void 0 ? void 0 : _a.rollupOptions) === null || _b === void 0 ? void 0 : _b.input));
            return {
                build: {
                    outDir: getOutDir(config),
                    manifest: true,
                    rollupOptions: { input },
                    polyfillDynamicImport: false,
                },
                //*
                ssr: { external: ['vite-plugin-ssr'] },
                /*/
                // Try Hydrogen's `noExternal: true` bundling strategy for Cloudflare Workers
                ssr: { noExternal: true },
                //*/
            };
        },
        transform: (_src, id) => {
            (0, utils_1.assert)(isSsrBuild === true || isSsrBuild === false);
            return removeClientCode(isSsrBuild, id) || undefined;
        },
    };
}
exports.build = build;
function removeClientCode(isSsrBuild, id) {
    if (!isSsrBuild) {
        return;
    }
    if (id.includes('.page.client.')) {
        return {
            code: `throw new Error('[vite-plugin-ssr][Wrong Usage] File ${id} should not be loaded in Node.js');`,
            map: { mappings: '' },
        };
    }
}
function entryPoints(config) {
    if ((0, utils_2.isSSR_config)(config)) {
        return serverEntryPoints();
    }
    else {
        return browserEntryPoints(config);
    }
}
function serverEntryPoints() {
    // Current directory: vite-plugin-ssr/dist/cjs/node/plugin/
    const serverEntry = require.resolve('../../../../dist/esm/node/page-files/pageFiles.js');
    (0, utils_1.assert)(serverEntry.endsWith('.js'));
    const entryName = (0, path_1.basename)(serverEntry).replace(/\.js$/, '');
    const entryPoints = {
        [entryName]: serverEntry,
    };
    return entryPoints;
}
function browserEntryPoints(config) {
    const root = getRoot(config);
    (0, utils_1.assert)((0, path_1.isAbsolute)(root));
    const browserEntries = glob.sync(`${root}/**/*.page.client.*([a-zA-Z0-9])`, {
        ignore: ['**/node_modules/**'],
    });
    const entryPoints = {};
    for (const filePath of browserEntries) {
        (0, utils_1.assert)((0, path_1.isAbsolute)(filePath));
        const outFilePath = pathRelativeToRoot(filePath, config);
        entryPoints[outFilePath] = filePath;
    }
    return entryPoints;
}
function pathRelativeToRoot(filePath, config) {
    (0, utils_1.assert)((0, path_1.isAbsolute)(filePath));
    const root = getRoot(config);
    (0, utils_1.assert)((0, path_1.isAbsolute)(root));
    return (0, path_1.relative)(root, filePath);
}
function getRoot(config) {
    let root = config.root || process.cwd();
    (0, utils_1.assertUsage)((0, path_1.isAbsolute)(root), 
    // Looking at Vite's source code, Vite does seem to normalize `root`.
    // But this doens't seem to be always the case, see https://github.com/brillout/vite-plugin-ssr/issues/208
    'The `root` config in your `vite.config.js` should be an absolute path. (I.e. `/path/to/root` instead of `../path/to/root`.)');
    root = posixPath(root);
    return root;
}
function getOutDir(config) {
    var _a, _b;
    let outDir = (_a = config.build) === null || _a === void 0 ? void 0 : _a.outDir;
    if (!outDir) {
        outDir = 'dist';
    }
    return ((_b = config.build) === null || _b === void 0 ? void 0 : _b.ssr) ? `${outDir}/server` : `${outDir}/client`;
}
function posixPath(path) {
    return path.split(path_1.sep).join(path_1.posix.sep);
}
function normalizeRollupInput(input) {
    if (!input) {
        return {};
    }
    /*
    if (typeof input === "string") {
      return { [input]: input };
    }
    if (Array.isArray(input)) {
      return Object.fromEntries(input.map((i) => [i, i]));
    }
    */
    (0, utils_1.assert)((0, utils_1.isObject)(input));
    return input;
}
//# sourceMappingURL=build.js.map
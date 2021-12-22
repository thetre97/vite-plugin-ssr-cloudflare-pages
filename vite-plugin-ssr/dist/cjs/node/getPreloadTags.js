"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPreloadUrls = void 0;
const ssrEnv_1 = require("./ssrEnv");
const utils_1 = require("../shared/utils");
async function getPreloadUrls(pageContext, dependencies, clientManifest, serverManifest) {
    const ssrEnv = (0, ssrEnv_1.getSsrEnv)();
    let preloadUrls = new Set();
    if (!ssrEnv.isProduction) {
        const visitedModules = new Set();
        const pageViewFiles = pageContext._allPageFiles['.page'].map(({ filePath }) => filePath);
        const skipPageViewFiles = pageViewFiles.filter((pageViewFile) => !dependencies.some((dep) => dep.includes(pageViewFile)));
        await Promise.all(dependencies.map(async (filePath) => {
            (0, utils_1.assert)(filePath);
            const mod = await ssrEnv.viteDevServer.moduleGraph.getModuleByUrl(filePath);
            collectCss(mod, preloadUrls, visitedModules, skipPageViewFiles);
        }));
    }
    else {
        (0, utils_1.assert)(clientManifest && serverManifest);
        const visistedAssets = new Set();
        dependencies.forEach((filePath) => {
            const modulePath = getModulePath(filePath);
            let manifest = undefined;
            if (serverManifest[modulePath])
                manifest = serverManifest;
            if (clientManifest[modulePath])
                manifest = clientManifest;
            if (!manifest)
                return; // `modulePath` may be missing in the manifest; https://github.com/brillout/vite-plugin-ssr/issues/51
            if (manifest === serverManifest)
                return; // We disable this for now; changes to Vite are required for this to work.
            const onlyCollectStaticAssets = manifest === serverManifest;
            collectAssets(modulePath, preloadUrls, visistedAssets, manifest, onlyCollectStaticAssets);
        });
    }
    return Array.from(preloadUrls);
}
exports.getPreloadUrls = getPreloadUrls;
function collectAssets(modulePath, preloadUrls, visistedAssets, manifest, onlyCollectStaticAssets) {
    if (visistedAssets.has(modulePath))
        return;
    visistedAssets.add(modulePath);
    const manifestEntry = manifest[modulePath];
    (0, utils_1.assert)(manifestEntry);
    const { imports = [], assets = [], css = [] } = manifestEntry;
    for (const importAsset of imports) {
        const importManifestEntry = manifest[importAsset];
        (0, utils_1.assert)(importManifestEntry);
        const { file } = importManifestEntry;
        if (!onlyCollectStaticAssets) {
            preloadUrls.add(`/${file}`);
        }
        collectAssets(importAsset, preloadUrls, visistedAssets, manifest, onlyCollectStaticAssets);
    }
    for (const cssAsset of css) {
        preloadUrls.add(`/${cssAsset}`);
    }
    for (const asset of assets) {
        preloadUrls.add(`/${asset}`);
    }
}
function getModulePath(filePath) {
    let modulePath = filePath;
    if (modulePath.startsWith('/')) {
        modulePath = modulePath.slice(1);
    }
    return modulePath;
}
function collectCss(mod, preloadUrls, visitedModules, skipPageViewFiles) {
    if (!mod)
        return;
    if (!mod.url)
        return;
    if (skipPageViewFiles.some((pageViewFile) => mod.id && mod.id.includes(pageViewFile)))
        return;
    if (visitedModules.has(mod.url))
        return;
    visitedModules.add(mod.url);
    if (mod.url.endsWith('.css') || (mod.id && /\?vue&type=style/.test(mod.id))) {
        preloadUrls.add(mod.url);
    }
    mod.importedModules.forEach((dep) => {
        collectCss(dep, preloadUrls, visitedModules, skipPageViewFiles);
    });
}
//# sourceMappingURL=getPreloadTags.js.map
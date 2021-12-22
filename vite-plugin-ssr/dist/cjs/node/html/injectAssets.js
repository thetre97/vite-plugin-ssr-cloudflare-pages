"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageAssets = exports.injectAssetsAfterRender = exports.injectAssetsBeforeRender = exports.injectAssets = exports.injectAssets__public = void 0;
const utils_1 = require("../../shared/utils");
const getPreloadTags_1 = require("../getPreloadTags");
const ssrEnv_1 = require("../ssrEnv");
const getViteManifest_1 = require("../getViteManifest");
const path_1 = require("path");
const inferMediaType_1 = require("./inferMediaType");
const serializePageContextClientSide_1 = require("../serializePageContextClientSide");
const sanitizeJson_1 = require("./injectAssets/sanitizeJson");
async function getPageAssets(pageContext, dependencies, pageClientFilePath, isPreRendering) {
    (0, utils_1.assert)(dependencies.every((filePath) => (0, path_1.isAbsolute)(filePath)));
    const { isProduction = false } = (0, ssrEnv_1.getSsrEnv)();
    let clientManifest = null;
    let serverManifest = null;
    if (isPreRendering || isProduction) {
        const manifests = retrieveViteManifest(isPreRendering);
        clientManifest = manifests.clientManifest;
        serverManifest = manifests.serverManifest;
    }
    const preloadAssets = await (0, getPreloadTags_1.getPreloadUrls)(pageContext, dependencies, clientManifest, serverManifest);
    let pageAssets = preloadAssets.map((src) => {
        const { mediaType = null, preloadType = null } = (0, inferMediaType_1.inferMediaType)(src) || {};
        const assetType = mediaType === 'text/css' ? 'style' : 'preload';
        return {
            src,
            assetType,
            mediaType,
            preloadType,
        };
    });
    const scriptSrc = !isProduction ? pageClientFilePath : resolveScriptSrc(pageClientFilePath, clientManifest);
    pageAssets.push({
        src: scriptSrc,
        assetType: 'script',
        mediaType: 'text/javascript',
        preloadType: null,
    });
    pageAssets = pageAssets.map((pageAsset) => {
        pageAsset.src = (0, utils_1.prependBaseUrl)((0, utils_1.normalizePath)(pageAsset.src), pageContext._baseUrl);
        return pageAsset;
    });
    sortPageAssetsForHttpPush(pageAssets);
    return pageAssets;
}
exports.getPageAssets = getPageAssets;
function sortPageAssetsForHttpPush(pageAssets) {
    pageAssets.sort((0, utils_1.higherFirst)(({ assetType, preloadType }) => {
        let priority = 0;
        // CSS has highest priority
        if (assetType === 'style')
            return priority;
        priority--;
        if (preloadType === 'style')
            return priority;
        priority--;
        // Visual assets have high priority
        if (preloadType === 'font')
            return priority;
        priority--;
        if (preloadType === 'image')
            return priority;
        priority--;
        // JavaScript has lowest priority
        if (preloadType === 'script')
            return priority - 1;
        if (assetType === 'script')
            return priority - 2;
        return priority;
    }));
}
function retrieveViteManifest(isPreRendering) {
    const { clientManifest, serverManifest, clientManifestPath, serverManifestPath } = (0, getViteManifest_1.getViteManifest)();
    const userOperation = isPreRendering
        ? 'running `$ vite-plugin-ssr prerender`'
        : 'running the server with `isProduction: true`';
    (0, utils_1.assertUsage)(clientManifest && serverManifest, 'You are ' +
        userOperation +
        " but you didn't build your app yet: make sure to run `$ vite build && vite build --ssr` before. (Following build manifest is missing: `" +
        clientManifestPath +
        '` and/or `' +
        serverManifestPath +
        '`.)');
    return { clientManifest, serverManifest };
}
async function injectAssets__public(htmlString, pageContext) {
    (0, utils_1.assertUsage)(typeof htmlString === 'string', '[injectAssets(htmlString, pageContext)]: Argument `htmlString` should be a string.');
    (0, utils_1.assertUsage)(pageContext, '[injectAssets(htmlString, pageContext)]: Argument `pageContext` is missing.');
    const errMsg = (body) => '[injectAssets(htmlString, pageContext)]: ' +
        body +
        '. Make sure that `pageContext` is the object that `vite-plugin-ssr` provided to your `render(pageContext)` hook.';
    (0, utils_1.assertUsage)((0, utils_1.hasProp)(pageContext, 'urlPathname', 'string'), errMsg('`pageContext.urlPathname` should be a string'));
    (0, utils_1.assertUsage)((0, utils_1.hasProp)(pageContext, '_pageId', 'string'), errMsg('`pageContext._pageId` should be a string'));
    (0, utils_1.assertUsage)((0, utils_1.hasProp)(pageContext, '_getPageAssets'), errMsg('`pageContext._getPageAssets` is missing'));
    (0, utils_1.assertUsage)((0, utils_1.hasProp)(pageContext, '_passToClient', 'string[]'), errMsg('`pageContext._passToClient` is missing'));
    (0, utils_1.assertUsage)((0, utils_1.hasProp)(pageContext, '_pageClientPath', 'string'), errMsg('`pageContext._pageClientPath` is missing'));
    (0, utils_1.castProp)(pageContext, '_getPageAssets');
    pageContext._getPageAssets;
    htmlString = await injectAssets(htmlString, pageContext);
    return htmlString;
}
exports.injectAssets__public = injectAssets__public;
async function injectAssets(htmlString, pageContext) {
    htmlString = await injectAssetsBeforeRender(htmlString, pageContext);
    htmlString = await injectAssetsAfterRender(htmlString, pageContext);
    return htmlString;
}
exports.injectAssets = injectAssets;
async function injectAssetsBeforeRender(htmlString, pageContext) {
    (0, utils_1.assert)(htmlString);
    (0, utils_1.assert)(typeof htmlString === 'string');
    // Ensure existence of `<head>` (Vite's `transformIndexHtml()` is buggy when `<head>` is missing)
    htmlString = ensureHeadTagExistence(htmlString);
    // Inject Vite transformations
    const { urlPathname } = pageContext;
    (0, utils_1.assert)(typeof urlPathname === 'string' && urlPathname.startsWith('/'));
    htmlString = await applyViteHtmlTransform(htmlString, urlPathname);
    const pageAssets = await pageContext._getPageAssets();
    // Inject script
    const scripts = pageAssets.filter(({ assetType }) => assetType === 'script');
    (0, utils_1.assert)(scripts.length === 1);
    const script = scripts[0];
    (0, utils_1.assert)(script);
    htmlString = injectScript(htmlString, script);
    // Inject preload links
    const preloadAssets = pageAssets.filter(({ assetType }) => assetType === 'preload' || assetType === 'style');
    const linkTags = preloadAssets.map((pageAsset) => {
        const isEsModule = pageAsset.preloadType === 'script';
        return inferAssetTag(pageAsset, isEsModule);
    });
    htmlString = injectLinkTags(htmlString, linkTags);
    return htmlString;
}
exports.injectAssetsBeforeRender = injectAssetsBeforeRender;
async function injectAssetsAfterRender(htmlString, pageContext) {
    // Inject pageContext__client
    (0, utils_1.assertUsage)(!injectPageInfoAlreadyDone(htmlString), 'Assets are being injected twice into your HTML. Make sure to remove your superfluous `injectAssets()` call (`vite-plugin-ssr` already automatically calls `injectAssets()`).');
    htmlString = injectPageInfo(htmlString, pageContext);
    return htmlString;
}
exports.injectAssetsAfterRender = injectAssetsAfterRender;
async function applyViteHtmlTransform(htmlString, urlPathname) {
    const ssrEnv = (0, ssrEnv_1.getSsrEnv)();
    if (ssrEnv.isProduction) {
        return htmlString;
    }
    htmlString = await ssrEnv.viteDevServer.transformIndexHtml(urlPathname, htmlString);
    htmlString = removeDuplicatedBaseUrl(htmlString, ssrEnv.baseUrl);
    return htmlString;
}
function removeDuplicatedBaseUrl(htmlString, baseUrl) {
    // Proper fix is to add Vite option to skip this: https://github.com/vitejs/vite/blob/aaa26a32501c857d854e9d9daca2a88a9e086392/packages/vite/src/node/server/middlewares/indexHtml.ts#L62-L67
    const baseUrlNormalized = (0, utils_1.normalizeBaseUrl)(baseUrl);
    if (baseUrlNormalized === '/') {
        return htmlString;
    }
    (0, utils_1.assert)(!baseUrlNormalized.endsWith('/'));
    htmlString = htmlString.split(baseUrlNormalized + baseUrlNormalized).join(baseUrlNormalized);
    return htmlString;
}
function resolveScriptSrc(filePath, clientManifest) {
    (0, utils_1.assert)(filePath.startsWith('/'));
    (0, utils_1.assert)((0, ssrEnv_1.getSsrEnv)().isProduction);
    const manifestKey = filePath.slice(1);
    const manifestVal = clientManifest[manifestKey];
    (0, utils_1.assert)(manifestVal);
    (0, utils_1.assert)(manifestVal.isEntry);
    let { file } = manifestVal;
    (0, utils_1.assert)(!file.startsWith('/'));
    return '/' + file;
}
const pageInfoInjectionBegin = '<script id="vite-plugin-ssr_pageContext" type="application/json">';
function injectPageInfo(htmlString, pageContext) {
    const pageContextSerialized = (0, sanitizeJson_1.sanitizeJson)((0, serializePageContextClientSide_1.serializePageContextClientSide)(pageContext));
    const injection = `${pageInfoInjectionBegin}${pageContextSerialized}</script>`;
    return injectEnd(htmlString, injection);
}
function injectPageInfoAlreadyDone(htmlString) {
    return htmlString.includes(pageInfoInjectionBegin);
}
function injectScript(htmlString, script) {
    const isEsModule = true;
    const injection = inferAssetTag(script, isEsModule);
    return injectEnd(htmlString, injection);
}
const headClose = '</head>';
function injectLinkTags(htmlString, linkTags) {
    (0, utils_1.assert)(linkTags.every((tag) => tag.startsWith('<') && tag.endsWith('>')));
    const injection = linkTags.join('');
    return injectAtClosingTag(htmlString, headClose, injection);
}
const headOpen = /<head(>| [^>]*>)/;
function injectBegin(htmlString, injection) {
    if (headOpen.test(htmlString)) {
        return injectAtOpeningTag(htmlString, headOpen, injection);
    }
    const htmlBegin = /<html(>| [^>]*>)/;
    if (htmlBegin.test(htmlString)) {
        return injectAtOpeningTag(htmlString, htmlBegin, injection);
    }
    if (htmlString.toLowerCase().startsWith('<!doctype')) {
        const lines = htmlString.split('\n');
        return [...(0, utils_1.slice)(lines, 0, 1), injection, ...(0, utils_1.slice)(lines, 1, 0)].join('\n');
    }
    else {
        return injection + '\n' + htmlString;
    }
}
function injectEnd(htmlString, injection) {
    const bodyClose = '</body>';
    if (htmlString.includes(bodyClose)) {
        return injectAtClosingTag(htmlString, bodyClose, injection);
    }
    const htmlClose = '</html>';
    if (htmlString.includes(htmlClose)) {
        return injectAtClosingTag(htmlString, htmlClose, injection);
    }
    return htmlString + '\n' + injection;
}
function injectAtOpeningTag(htmlString, openingTag, injection) {
    const matches = htmlString.match(openingTag);
    (0, utils_1.assert)(matches && matches.length >= 1);
    const tag = matches[0];
    (0, utils_1.assert)(tag);
    const htmlParts = htmlString.split(tag);
    (0, utils_1.assert)(htmlParts.length >= 2);
    // Insert `injection` after first `tag`
    const before = (0, utils_1.slice)(htmlParts, 0, 1);
    const after = (0, utils_1.slice)(htmlParts, 1, 0).join(tag);
    return before + tag + injection + after;
}
function injectAtClosingTag(htmlString, closingTag, injection) {
    (0, utils_1.assert)(closingTag.startsWith('</'));
    (0, utils_1.assert)(closingTag.endsWith('>'));
    (0, utils_1.assert)(!closingTag.includes(' '));
    const htmlParts = htmlString.split(closingTag);
    (0, utils_1.assert)(htmlParts.length >= 2);
    // Insert `injection` before last `closingTag`
    const before = (0, utils_1.slice)(htmlParts, 0, -1).join(closingTag);
    const after = (0, utils_1.slice)(htmlParts, -1, 0);
    return before + injection + closingTag + after;
}
function inferAssetTag(pageAsset, isEsModule) {
    const { src, assetType, mediaType, preloadType } = pageAsset;
    (0, utils_1.assert)(isEsModule === false || assetType === 'script' || preloadType === 'script');
    if (assetType === 'script') {
        (0, utils_1.assert)(mediaType === 'text/javascript');
        if (isEsModule) {
            return `<script type="module" src="${src}"></script>`;
        }
        else {
            return `<script src="${src}"></script>`;
        }
    }
    if (assetType === 'style') {
        // CSS has utmost priority.
        // Would there be any advantage of using a preload tag for a css file instead of loading it right away?
        return `<link rel="stylesheet" type="text/css" href="${src}">`;
    }
    if (assetType === 'preload') {
        if (preloadType === 'font') {
            // `crossorigin` is needed for fonts, see https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/preload#cors-enabled_fetches
            return `<link rel="preload" as="font" crossorigin type="${mediaType}" href="${src}">`;
        }
        if (preloadType === 'script') {
            (0, utils_1.assert)(mediaType === 'text/javascript');
            if (isEsModule) {
                return `<link rel="modulepreload" as="script" type="${mediaType}" href="${src}">`;
            }
            else {
                return `<link rel="preload" as="script" type="${mediaType}" href="${src}">`;
            }
        }
        const attributeAs = !preloadType ? '' : ` as="${preloadType}"`;
        const attributeType = !mediaType ? '' : ` type="${mediaType}"`;
        return `<link rel="preload" href="${src}"${attributeAs}${attributeType}>`;
    }
    (0, utils_1.assert)(false);
}
function ensureHeadTagExistence(htmlString) {
    if (headOpen.test(htmlString)) {
        return htmlString;
    }
    htmlString = injectBegin(htmlString, '<head></head>');
    return htmlString;
}
//# sourceMappingURL=injectAssets.js.map
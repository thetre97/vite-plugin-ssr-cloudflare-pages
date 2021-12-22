"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwPrerenderError = exports.loadOnBeforePrerenderHook = exports.loadPageFiles = exports.getGlobalContext = exports.renderStatic404Page = exports.prerenderPage = exports.renderPageWithoutThrowing = void 0;
const route_1 = require("../shared/route");
const renderHtml_1 = require("./html/renderHtml");
const getPageFiles_1 = require("../shared/getPageFiles");
const ssrEnv_1 = require("./ssrEnv");
const json_s_1 = require("@brillout/json-s");
const utils_1 = require("../shared/utils");
const injectAssets_1 = require("./html/injectAssets");
const loadPageIsomorphicFiles_1 = require("../shared/loadPageIsomorphicFiles");
const onBeforeRenderHook_1 = require("../shared/onBeforeRenderHook");
const sortPageContext_1 = require("../shared/sortPageContext");
const stream_1 = require("./html/stream");
const serializePageContextClientSide_1 = require("./serializePageContextClientSide");
const addComputedUrlProps_1 = require("../shared/addComputedUrlProps");
const determinePageIds_1 = require("../shared/determinePageIds");
const assertPageContextProvidedByUser_1 = require("../shared/assertPageContextProvidedByUser");
async function renderPage(pageContextInit) {
    assertArguments(...arguments);
    const pageContext = await initializePageContext(pageContextInit);
    if ('httpResponse' in pageContext) {
        (0, utils_1.assert)(pageContext.httpResponse === null);
        return pageContext;
    }
    // *** Route ***
    const routeResult = await (0, route_1.route)(pageContext);
    // TODO: remove unnecessary extra error handling?
    if ('hookError' in routeResult) {
        const err = routeResult.hookError;
        logError(err);
        return await render500Page(pageContextInit, routeResult.hookError);
    }
    (0, utils_1.objectAssign)(pageContext, routeResult.pageContextAddendum);
    // *** Handle 404 ***
    let statusCode;
    if ((0, utils_1.hasProp)(pageContext, '_pageId', 'string')) {
        statusCode = 200;
    }
    else {
        (0, utils_1.assert)(pageContext._pageId === null);
        if (!pageContext._isPageContextRequest) {
            warn404(pageContext);
        }
        const errorPageId = (0, route_1.getErrorPageId)(pageContext._allPageIds);
        if (!errorPageId) {
            warnMissingErrorPage();
            if (pageContext._isPageContextRequest) {
                const httpResponse = createHttpResponseObject((0, json_s_1.stringify)({
                    pageContext404PageDoesNotExist: true,
                }), {
                    statusCode: 200,
                    renderFilePath: null,
                }, pageContext);
                (0, utils_1.objectAssign)(pageContext, { httpResponse });
                return pageContext;
            }
            else {
                const httpResponse = null;
                (0, utils_1.objectAssign)(pageContext, { httpResponse });
                return pageContext;
            }
        }
        if (!pageContext._isPageContextRequest) {
            statusCode = 404;
        }
        else {
            statusCode = 200;
        }
        (0, utils_1.objectAssign)(pageContext, {
            _pageId: errorPageId,
            is404: true,
        });
    }
    const pageFiles = await loadPageFiles(pageContext);
    (0, utils_1.objectAssign)(pageContext, pageFiles);
    await executeOnBeforeRenderHooks(pageContext);
    if (pageContext._isPageContextRequest) {
        const pageContextSerialized = (0, serializePageContextClientSide_1.serializePageContextClientSide)(pageContext);
        const httpResponse = createHttpResponseObject(pageContextSerialized, { statusCode: 200, renderFilePath: null }, pageContext);
        (0, utils_1.objectAssign)(pageContext, { httpResponse });
        return pageContext;
    }
    const renderHookResult = await executeRenderHook(pageContext);
    // TODO: remove unnecessary extra error handling?
    if ('hookError' in renderHookResult) {
        const err = renderHookResult.hookError;
        logError(err);
        return await render500Page(pageContextInit, err);
    }
    if (renderHookResult === null) {
        (0, utils_1.objectAssign)(pageContext, { httpResponse: null });
        return pageContext;
    }
    else {
        const { htmlRender, renderFilePath } = renderHookResult;
        const httpResponse = createHttpResponseObject(htmlRender, { statusCode, renderFilePath }, pageContext);
        (0, utils_1.objectAssign)(pageContext, { httpResponse });
        return pageContext;
    }
}
async function initializePageContext(pageContextInit) {
    const pageContext = Object.assign({ _isPreRendering: false }, pageContextInit);
    if (pageContext.url.endsWith('/favicon.ico')) {
        (0, utils_1.objectAssign)(pageContext, { httpResponse: null });
        return pageContext;
    }
    const baseUrl = getBaseUrl();
    const { isPageContextRequest, hasBaseUrl } = _parseUrl(pageContext.url, baseUrl);
    if (!hasBaseUrl) {
        (0, utils_1.objectAssign)(pageContext, { httpResponse: null });
        return pageContext;
    }
    (0, utils_1.objectAssign)(pageContext, {
        _isPageContextRequest: isPageContextRequest,
    });
    const globalContext = await getGlobalContext();
    (0, utils_1.objectAssign)(pageContext, globalContext);
    (0, addComputedUrlProps_1.addComputedUrlProps)(pageContext);
    return pageContext;
}
// `renderPageWithoutThrowing()` calls `renderPage()` while ensuring an `err` is always `console.error(err)` instead of `throw err`, so that `vite-plugin-ssr` never triggers a server shut down. (Throwing an error in an Express.js middleware shuts down the whole Express.js server.)
async function renderPageWithoutThrowing(pageContextInit) {
    const args = arguments;
    try {
        return await renderPage.apply(null, args);
    }
    catch (err) {
        logError(err);
        try {
            return await render500Page(pageContextInit, err);
        }
        catch (_err2) {
            // We swallow `_err2`; logging `err` should be enough; `_err2` is likely the same error than `err` anyways.
            const pageContext = {};
            (0, utils_1.objectAssign)(pageContext, pageContextInit);
            (0, utils_1.objectAssign)(pageContext, {
                httpResponse: null,
                _err: _err2,
            });
            return pageContext;
        }
    }
}
exports.renderPageWithoutThrowing = renderPageWithoutThrowing;
async function render500Page(pageContextInit, err) {
    (0, utils_1.assert)(hasAlreadyLogged(err));
    const pageContext = await initializePageContext(pageContextInit);
    // `pageContext.httpResponse===null` should have already been handled in `renderPage()`
    (0, utils_1.assert)(!('httpResponse' in pageContext));
    (0, utils_1.objectAssign)(pageContext, {
        is404: false,
        _err: err,
        httpResponse: null,
        routeParams: {},
    });
    if (pageContext._isPageContextRequest) {
        const body = (0, json_s_1.stringify)({
            serverSideError: true,
        });
        const httpResponse = createHttpResponseObject(body, { statusCode: 500, renderFilePath: null }, pageContext);
        (0, utils_1.objectAssign)(pageContext, { httpResponse });
        return pageContext;
    }
    const errorPageId = (0, route_1.getErrorPageId)(pageContext._allPageIds);
    if (errorPageId === null) {
        warnMissingErrorPage();
        return pageContext;
    }
    (0, utils_1.objectAssign)(pageContext, {
        _pageId: errorPageId,
    });
    const pageFiles = await loadPageFiles(pageContext);
    (0, utils_1.objectAssign)(pageContext, pageFiles);
    // We swallow hook errors; another error was already shown to the user in the `logError()` at the beginning of this function; the second error is likely the same than the first error anyways.
    await executeOnBeforeRenderHooks(pageContext);
    /*
    const hookResult = await executeOnBeforeRenderHooks(pageContext)
    if ('hookError' in hookResult) {
      warnCouldNotRender500Page(hookResult)
      return pageContext
    }
    */
    const renderHookResult = await executeRenderHook(pageContext);
    if ('hookError' in renderHookResult) {
        warnCouldNotRender500Page(renderHookResult);
        return pageContext;
    }
    const { htmlRender, renderFilePath } = renderHookResult;
    const httpResponse = createHttpResponseObject(htmlRender, { statusCode: 500, renderFilePath }, pageContext);
    (0, utils_1.objectAssign)(pageContext, { httpResponse });
    return pageContext;
}
function createHttpResponseObject(htmlRender, { statusCode, renderFilePath }, pageContext) {
    if (htmlRender === null) {
        return null;
    }
    (0, utils_1.assert)(!pageContext._isPageContextRequest || typeof htmlRender === 'string');
    return {
        statusCode,
        contentType: pageContext._isPageContextRequest ? 'application/json' : 'text/html',
        get body() {
            if (typeof htmlRender !== 'string') {
                (0, utils_1.assert)(renderFilePath);
                (0, utils_1.assertUsage)(false, '`pageContext.httpResponse.body` is not available because your `render()` hook (' +
                    renderFilePath +
                    ') provides an HTML stream. Use `const body = await pageContext.httpResponse.getBody()` instead, see https://vite-plugin-ssr.com/stream');
            }
            const body = htmlRender;
            return body;
        },
        async getBody() {
            const body = await (0, renderHtml_1.getHtmlString)(htmlRender);
            return body;
        },
        async getNodeStream() {
            (0, utils_1.assert)(htmlRender !== null);
            const nodeStream = await (0, stream_1.getStreamReadableNode)(htmlRender);
            (0, utils_1.assertUsage)(nodeStream !== null, '`pageContext.httpResponse.getNodeStream()` is not available: make sure your `render()` hook provides a Node.js Stream, see https://vite-plugin-ssr.com/stream');
            return nodeStream;
        },
        async getWebStream() {
            (0, utils_1.assert)(htmlRender !== null);
            const webStream = await (0, stream_1.getStreamReadableWeb)(htmlRender);
            (0, utils_1.assertUsage)(webStream !== null, '`pageContext.httpResponse.getWebStream()` is not available: make sure your `render()` hook provides a Web Stream, see https://vite-plugin-ssr.com/stream');
            return webStream;
        },
        pipeToWebWritable(writable) {
            const success = (0, stream_1.pipeToStreamWritableWeb)(htmlRender, writable);
            (0, utils_1.assertUsage)(success, '`pageContext.httpResponse.pipeToWebWritable` is not available: make sure your `render()` hook provides a Web Stream Pipe, see https://vite-plugin-ssr.com/stream');
        },
        pipeToNodeWritable(writable) {
            const success = (0, stream_1.pipeToStreamWritableNode)(htmlRender, writable);
            (0, utils_1.assertUsage)(success, '`pageContext.httpResponse.pipeToNodeWritable` is not available: make sure your `render()` hook provides a Node.js Stream Pipe, see https://vite-plugin-ssr.com/stream');
        },
    };
}
async function prerenderPage(pageContext) {
    (0, utils_1.assert)(pageContext._isPreRendering === true);
    (0, utils_1.objectAssign)(pageContext, {
        _isPageContextRequest: false,
    });
    (0, addComputedUrlProps_1.addComputedUrlProps)(pageContext);
    await executeOnBeforeRenderHooks(pageContext);
    const renderHookResult = await executeRenderHook(pageContext);
    if ('hookError' in renderHookResult) {
        throwPrerenderError(renderHookResult.hookError);
        (0, utils_1.assert)(false);
    }
    (0, utils_1.assertUsage)(renderHookResult.htmlRender !== null, "Pre-rendering requires your `render()` hook to provide HTML. Open a GitHub issue if that's a problem for you.");
    (0, utils_1.assert)(pageContext._isPageContextRequest === false);
    const documentHtml = await (0, renderHtml_1.getHtmlString)(renderHookResult.htmlRender);
    (0, utils_1.assert)(typeof documentHtml === 'string');
    if (!pageContext._usesClientRouter) {
        return { documentHtml, pageContextSerialized: null };
    }
    else {
        const pageContextSerialized = (0, serializePageContextClientSide_1.serializePageContextClientSide)(pageContext);
        return { documentHtml, pageContextSerialized };
    }
}
exports.prerenderPage = prerenderPage;
async function renderStatic404Page(globalContext) {
    const errorPageId = (0, route_1.getErrorPageId)(globalContext._allPageIds);
    if (!errorPageId) {
        return null;
    }
    const pageContext = Object.assign(Object.assign({}, globalContext), { _pageId: errorPageId, is404: true, routeParams: {}, url: '/fake-404-url', 
        // `renderStatic404Page()` is about generating `dist/client/404.html` for static hosts; there is no Client Routing.
        _usesClientRouter: false });
    const pageFiles = await loadPageFiles(pageContext);
    (0, utils_1.objectAssign)(pageContext, pageFiles);
    return prerenderPage(pageContext);
}
exports.renderStatic404Page = renderStatic404Page;
function preparePageContextForRelease(pageContext) {
    (0, utils_1.assert)(typeof pageContext.url === 'string');
    (0, utils_1.assert)(typeof pageContext.urlPathname === 'string');
    (0, utils_1.assert)((0, utils_1.isPlainObject)(pageContext.urlParsed));
    (0, utils_1.assert)((0, utils_1.isPlainObject)(pageContext.routeParams));
    (0, utils_1.assert)('Page' in pageContext);
    (0, utils_1.assert)((0, utils_1.isObject)(pageContext.pageExports));
    (0, sortPageContext_1.sortPageContext)(pageContext);
    if ((0, route_1.isErrorPage)(pageContext._pageId)) {
        (0, utils_1.assert)((0, utils_1.hasProp)(pageContext, 'is404', 'boolean'));
        (0, serializePageContextClientSide_1.addIs404ToPageProps)(pageContext);
    }
}
/*/
type PageServerFiles = {
  pageServerFile: PageServerFile | null
  pageServerFileDefault: PageServerFile | null
}
//*/
async function loadPageFiles(pageContext) {
    const { Page, pageExports, pageIsomorphicFile, pageIsomorphicFileDefault } = await (0, loadPageIsomorphicFiles_1.loadPageIsomorphicFiles)(pageContext);
    const pageClientPath = getPageClientPath(pageContext);
    const { pageServerFile, pageServerFileDefault } = await loadPageServerFiles(pageContext);
    const pageFiles = {
        Page,
        pageExports,
        _pageIsomorphicFile: pageIsomorphicFile,
        _pageIsomorphicFileDefault: pageIsomorphicFileDefault,
        _pageServerFile: pageServerFile,
        _pageServerFileDefault: pageServerFileDefault,
        _pageClientPath: pageClientPath,
    };
    (0, utils_1.objectAssign)(pageFiles, {
        _passToClient: (pageServerFile === null || pageServerFile === void 0 ? void 0 : pageServerFile.fileExports.passToClient) || (pageServerFileDefault === null || pageServerFileDefault === void 0 ? void 0 : pageServerFileDefault.fileExports.passToClient) || [],
    });
    const isPreRendering = pageContext._isPreRendering;
    (0, utils_1.assert)([true, false].includes(isPreRendering));
    const dependencies = [
        pageIsomorphicFile === null || pageIsomorphicFile === void 0 ? void 0 : pageIsomorphicFile.filePath,
        pageIsomorphicFileDefault === null || pageIsomorphicFileDefault === void 0 ? void 0 : pageIsomorphicFileDefault.filePath,
        pageClientPath,
    ].filter((p) => !!p);
    (0, utils_1.objectAssign)(pageFiles, {
        _getPageAssets: async () => {
            const pageAssets = await (0, injectAssets_1.getPageAssets)(pageContext, dependencies, pageClientPath, isPreRendering);
            return pageAssets;
        },
    });
    return pageFiles;
}
exports.loadPageFiles = loadPageFiles;
function getPageClientPath(pageContext) {
    var _a, _b;
    const { _pageId: pageId, _allPageFiles: allPageFiles } = pageContext;
    const pageClientFiles = allPageFiles['.page.client'];
    (0, utils_1.assertUsage)(pageClientFiles.length > 0, 'No `*.page.client.js` file found. Make sure to create one. You can create a `_default.page.client.js` which will apply as default to all your pages.');
    const pageClientPath = ((_a = (0, getPageFiles_1.findPageFile)(pageClientFiles, pageId)) === null || _a === void 0 ? void 0 : _a.filePath) || ((_b = (0, getPageFiles_1.findDefaultFile)(pageClientFiles, pageId)) === null || _b === void 0 ? void 0 : _b.filePath);
    (0, utils_1.assert)(pageClientPath);
    return pageClientPath;
}
async function loadPageServerFiles(pageContext) {
    const pageId = pageContext._pageId;
    let serverFiles = pageContext._allPageFiles['.page.server'];
    (0, utils_1.assertUsage)(serverFiles.length > 0, 'No `*.page.server.js` file found. Make sure to create one. You can create a `_default.page.server.js` which will apply as default to all your pages.');
    const [pageServerFile, pageServerFileDefault] = await Promise.all([
        loadPageServerFile((0, getPageFiles_1.findPageFile)(serverFiles, pageId)),
        loadPageServerFile((0, getPageFiles_1.findDefaultFile)(serverFiles, pageId)),
    ]);
    (0, utils_1.assert)(pageServerFile || pageServerFileDefault);
    if (pageServerFile !== null) {
        return { pageServerFile, pageServerFileDefault };
    }
    if (pageServerFileDefault !== null) {
        return { pageServerFile, pageServerFileDefault };
    }
    (0, utils_1.assert)(false);
    async function loadPageServerFile(serverFile) {
        if (serverFile === null) {
            return null;
        }
        const fileExports = await serverFile.loadFile();
        const { filePath } = serverFile;
        assertExportsOfServerPage(fileExports, filePath);
        assert_pageServerFile(fileExports, filePath);
        const onBeforeRenderHook = (0, onBeforeRenderHook_1.getOnBeforeRenderHook)(fileExports, filePath);
        return { filePath, fileExports, onBeforeRenderHook };
    }
    function assert_pageServerFile(fileExports, filePath) {
        (0, utils_1.assert)(filePath);
        (0, utils_1.assert)(fileExports);
        const render = fileExports['render'];
        (0, utils_1.assertUsage)(!render || (0, utils_1.isCallable)(render), `The \`render()\` hook defined in ${filePath} should be a function.`);
        (0, utils_1.assertUsage)(!('onBeforeRender' in fileExports) || (0, utils_1.isCallable)(fileExports['onBeforeRender']), `The \`onBeforeRender()\` hook defined in ${filePath} should be a function.`);
        (0, utils_1.assertUsage)(!('passToClient' in fileExports) || (0, utils_1.hasProp)(fileExports, 'passToClient', 'string[]'), `The \`passToClient_\` export defined in ${filePath} should be an array of strings.`);
        const prerender = fileExports['prerender'];
        (0, utils_1.assertUsage)(!prerender || (0, utils_1.isCallable)(prerender), `The \`prerender()\` hook defined in ${filePath} should be a function.`);
    }
}
async function loadOnBeforePrerenderHook(globalContext) {
    const defautFiles = (0, getPageFiles_1.findDefaultFiles)(globalContext._allPageFiles['.page.server']);
    let onBeforePrerenderHook = null;
    let hookFilePath = undefined;
    await Promise.all(defautFiles.map(async ({ filePath, loadFile }) => {
        const fileExports = await loadFile();
        assertExportsOfServerPage(fileExports, filePath);
        if ('onBeforePrerender' in fileExports) {
            (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'onBeforePrerender', 'function'), `The \`export { onBeforePrerender }\` in ${filePath} should be a function.`);
            (0, utils_1.assertUsage)(onBeforePrerenderHook === null, 'There can be only one `onBeforePrerender()` hook. If you need to be able to define several, open a new GitHub issue.');
            onBeforePrerenderHook = fileExports.onBeforePrerender;
            hookFilePath = filePath;
        }
    }));
    if (!onBeforePrerenderHook) {
        return null;
    }
    (0, utils_1.assert)(hookFilePath);
    return { onBeforePrerenderHook, hookFilePath };
}
exports.loadOnBeforePrerenderHook = loadOnBeforePrerenderHook;
function assertExportsOfServerPage(fileExports, filePath) {
    (0, utils_1.assertExports)(fileExports, filePath, ['render', 'onBeforeRender', 'passToClient', 'prerender', 'doNotPrerender', 'onBeforePrerender'], {
        ['_onBeforePrerender']: 'onBeforePrerender',
    }, {
        ['addPageContext']: 'onBeforeRender',
    });
}
async function executeOnBeforeRenderHooks(pageContext) {
    var _a, _b, _c, _d;
    if (pageContext._pageContextAlreadyProvidedByPrerenderHook) {
        return;
    }
    let serverHooksCalled = false;
    let skipServerHooks = false;
    if (isomorphicHooksExist() && !pageContext._isPageContextRequest) {
        const pageContextAddendum = await (0, onBeforeRenderHook_1.runOnBeforeRenderHooks)(pageContext._pageIsomorphicFile, pageContext._pageIsomorphicFileDefault, Object.assign(Object.assign({}, pageContext), { skipOnBeforeRenderServerHooks,
            runOnBeforeRenderServerHooks }));
        Object.assign(pageContext, pageContextAddendum);
        (0, onBeforeRenderHook_1.assertUsageServerHooksCalled)({
            hooksServer: [
                ((_a = pageContext._pageServerFile) === null || _a === void 0 ? void 0 : _a.onBeforeRenderHook) && pageContext._pageServerFile.filePath,
                ((_b = pageContext._pageServerFileDefault) === null || _b === void 0 ? void 0 : _b.onBeforeRenderHook) && pageContext._pageServerFileDefault.filePath,
            ],
            hooksIsomorphic: [
                ((_c = pageContext._pageIsomorphicFile) === null || _c === void 0 ? void 0 : _c.onBeforeRenderHook) && pageContext._pageIsomorphicFile.filePath,
                ((_d = pageContext._pageIsomorphicFileDefault) === null || _d === void 0 ? void 0 : _d.onBeforeRenderHook) && pageContext._pageIsomorphicFileDefault.filePath,
            ],
            serverHooksCalled,
            _pageId: pageContext._pageId,
        });
    }
    else {
        const { pageContext: pageContextAddendum } = await runOnBeforeRenderServerHooks();
        Object.assign(pageContext, pageContextAddendum);
    }
    return undefined;
    function isomorphicHooksExist() {
        var _a, _b;
        return (!!((_a = pageContext._pageIsomorphicFile) === null || _a === void 0 ? void 0 : _a.onBeforeRenderHook) ||
            !!((_b = pageContext._pageIsomorphicFileDefault) === null || _b === void 0 ? void 0 : _b.onBeforeRenderHook));
    }
    async function skipOnBeforeRenderServerHooks() {
        (0, utils_1.assertUsage)(serverHooksCalled === false, 'You cannot call `pageContext.skipOnBeforeRenderServerHooks()` after having called `pageContext.runOnBeforeRenderServerHooks()`.');
        skipServerHooks = true;
    }
    async function runOnBeforeRenderServerHooks() {
        (0, utils_1.assertUsage)(skipServerHooks === false, 'You cannot call `pageContext.runOnBeforeRenderServerHooks()` after having called `pageContext.skipOnBeforeRenderServerHooks()`.');
        (0, utils_1.assertUsage)(serverHooksCalled === false, 'You already called `pageContext.runOnBeforeRenderServerHooks()`; you cannot call it a second time.');
        serverHooksCalled = true;
        const pageContextAddendum = await (0, onBeforeRenderHook_1.runOnBeforeRenderHooks)(pageContext._pageServerFile, pageContext._pageServerFileDefault, pageContext);
        return { pageContext: pageContextAddendum };
    }
}
async function executeRenderHook(pageContext) {
    (0, utils_1.assert)(pageContext._pageServerFile || pageContext._pageServerFileDefault);
    let render;
    let renderFilePath;
    const pageServerFile = pageContext._pageServerFile;
    const pageRenderFunction = pageServerFile === null || pageServerFile === void 0 ? void 0 : pageServerFile.fileExports.render;
    if (pageServerFile && pageRenderFunction) {
        render = pageRenderFunction;
        renderFilePath = pageServerFile.filePath;
    }
    else {
        const pageServerFileDefault = pageContext._pageServerFileDefault;
        const pageDefaultRenderFunction = pageServerFileDefault === null || pageServerFileDefault === void 0 ? void 0 : pageServerFileDefault.fileExports.render;
        if (pageServerFileDefault && pageDefaultRenderFunction) {
            render = pageDefaultRenderFunction;
            renderFilePath = pageServerFileDefault.filePath;
        }
    }
    (0, utils_1.assertUsage)(render, 'No `render()` hook found. Make sure to define a `*.page.server.js` file with `export function render() { /*...*/ }`. You can also `export { render }` in `_default.page.server.js` which will be the default `render()` hook of all your pages.');
    (0, utils_1.assert)(renderFilePath);
    preparePageContextForRelease(pageContext);
    const hookName = 'render';
    let result;
    try {
        // We use a try-catch because the `render()` hook is user-defined and may throw an error.
        result = await render(pageContext);
    }
    catch (hookError) {
        return { hookError, hookName, hookFilePath: renderFilePath };
    }
    if ((0, utils_1.isObject)(result) && !(0, renderHtml_1.isDocumentHtml)(result)) {
        assertHookResult(result, hookName, ['documentHtml', 'pageContext'], renderFilePath);
    }
    if ((0, utils_1.hasProp)(result, 'pageContext')) {
        const pageContextProvidedByUser = result.pageContext;
        (0, assertPageContextProvidedByUser_1.assertPageContextProvidedByUser)(pageContextProvidedByUser, { hookFilePath: renderFilePath, hookName });
        Object.assign(pageContext, pageContextProvidedByUser);
    }
    const errPrefix = 'The `render()` hook exported by ' + renderFilePath;
    const errSuffix = [
        "a string generated with the `escapeInject` template tag or a string returned by `dangerouslySkipEscape('<p>Some HTML</p>')`",
        ', see https://vite-plugin-ssr.com/escapeInject',
    ].join(' ');
    let documentHtml;
    if (!(0, utils_1.isObject)(result) || (0, renderHtml_1.isDocumentHtml)(result)) {
        (0, utils_1.assertUsage)(typeof result !== 'string', [
            errPrefix,
            'returned a plain JavaScript string which is forbidden;',
            'instead, it should return',
            errSuffix,
        ].join(' '));
        (0, utils_1.assertUsage)(result === null || (0, renderHtml_1.isDocumentHtml)(result), [
            errPrefix,
            'should return `null`, a string `documentHtml`, or an object `{ documentHtml, pageContext }`',
            'where `pageContext` is `undefined` or an object holding additional `pageContext` values',
            'and `documentHtml` is',
            errSuffix,
        ].join(' '));
        documentHtml = result;
    }
    else {
        assertKeys(result, ['documentHtml', 'pageContext'], errPrefix);
        if ('documentHtml' in result) {
            documentHtml = result.documentHtml;
            (0, utils_1.assertUsage)(typeof documentHtml !== 'string', [
                errPrefix,
                'returned `{ documentHtml }`, but `documentHtml` is a plain JavaScript string which is forbidden;',
                '`documentHtml` should be',
                errSuffix,
            ].join(' '));
            (0, utils_1.assertUsage)(documentHtml === undefined || documentHtml === null || (0, renderHtml_1.isDocumentHtml)(documentHtml), [errPrefix, 'returned `{ documentHtml }`, but `documentHtml` should be', errSuffix].join(' '));
        }
    }
    (0, utils_1.assert)(documentHtml === undefined || documentHtml === null || (0, renderHtml_1.isDocumentHtml)(documentHtml));
    if (documentHtml === null || documentHtml === undefined) {
        return { htmlRender: null, renderFilePath };
    }
    const onErrorWhileStreaming = (err) => {
        (0, utils_1.objectAssign)(pageContext, {
            _err: err,
            _serverSideErrorWhileStreaming: true,
        });
        logError(err);
    };
    const htmlRender = await (0, renderHtml_1.renderHtml)(documentHtml, pageContext, renderFilePath, onErrorWhileStreaming);
    if ((0, utils_1.hasProp)(htmlRender, 'hookError')) {
        return { hookError: htmlRender.hookError, hookName, hookFilePath: renderFilePath };
    }
    return { htmlRender, renderFilePath };
}
function assertHookResult(hookResult, hookName, hookResultKeys, hookFile) {
    const errPrefix = `The \`${hookName}()\` hook exported by ${hookFile}`;
    (0, utils_1.assertUsage)(hookResult === null || hookResult === undefined || (0, utils_1.isPlainObject)(hookResult), `${errPrefix} should return \`null\`, \`undefined\`, or a plain JavaScript object.`);
    if (hookResult === undefined || hookResult === null) {
        return;
    }
    assertKeys(hookResult, hookResultKeys, errPrefix);
}
function assertKeys(obj, keysExpected, errPrefix) {
    const keysUnknown = [];
    const keys = Object.keys(obj);
    for (const key of keys) {
        if (!keysExpected.includes(key)) {
            keysUnknown.push(key);
        }
    }
    (0, utils_1.assertUsage)(keysUnknown.length === 0, [
        errPrefix,
        'returned an object with unknown keys',
        (0, utils_1.stringifyStringArray)(keysUnknown) + '.',
        'Only following keys are allowed:',
        (0, utils_1.stringifyStringArray)(keysExpected) + '.',
    ].join(' '));
}
function assertArguments(...args) {
    const pageContext = args[0];
    (0, utils_1.assertUsage)(pageContext, '`renderPage(pageContext)`: argument `pageContext` is missing.');
    (0, utils_1.assertUsage)((0, utils_1.isPlainObject)(pageContext), `\`renderPage(pageContext)\`: argument \`pageContext\` should be a plain JavaScript object, but you passed a \`pageContext\` with \`pageContext.constructor === ${pageContext.constructor}\`.`);
    (0, utils_1.assertUsage)((0, utils_1.hasProp)(pageContext, 'url'), '`renderPage(pageContext)`: The `pageContext` you passed is missing the property `pageContext.url`.');
    (0, utils_1.assertUsage)(typeof pageContext.url === 'string', '`renderPage(pageContext)`: `pageContext.url` should be a string but `typeof pageContext.url === "' +
        typeof pageContext.url +
        '"`.');
    (0, utils_1.assertUsage)(pageContext.url.startsWith('/') || pageContext.url.startsWith('http'), '`renderPage(pageContext)`: `pageContext.url` should start with `/` (e.g. `/product/42`) or `http` (e.g. `http://example.org/product/42`) but `pageContext.url === "' +
        pageContext.url +
        '"`.');
    try {
        const { url } = pageContext;
        const urlWithOrigin = url.startsWith('http') ? url : 'http://fake-origin.example.org' + url;
        // `new URL()` conveniently throws if URL is not an URL
        new URL(urlWithOrigin);
    }
    catch (err) {
        (0, utils_1.assertUsage)(false, '`renderPage(pageContext)`: `pageContext.url` should be a URL but `pageContext.url==="' + pageContext.url + '"`.');
    }
    const len = args.length;
    (0, utils_1.assertUsage)(len === 1, `\`renderPage(pageContext)\`: You passed ${len} arguments but \`renderPage()\` accepts only one argument.'`);
}
function warnMissingErrorPage() {
    const { isProduction } = (0, ssrEnv_1.getSsrEnv)();
    if (!isProduction) {
        (0, utils_1.assertWarning)(false, 'No `_error.page.js` found. We recommend creating a `_error.page.js` file. (This warning is not shown in production.)');
    }
}
function warnCouldNotRender500Page({ hookFilePath, hookName }) {
    (0, utils_1.assert)(!hookName.endsWith('()'));
    (0, utils_1.assertWarning)(false, `The error page \`_error.page.js\` could be not rendered because your \`${hookName}()\` hook exported by ${hookFilePath} threw an error.`);
}
function warn404(pageContext) {
    const { isProduction } = (0, ssrEnv_1.getSsrEnv)();
    const pageRoutes = pageContext._pageRoutes;
    (0, utils_1.assertUsage)(pageRoutes.length > 0, 'No page found. Create a file that ends with the suffix `.page.js` (or `.page.vue`, `.page.jsx`, ...).');
    const { urlPathname } = pageContext;
    if (!isProduction && !isFileRequest(urlPathname)) {
        (0, utils_1.assertWarning)(false, [
            `URL \`${urlPathname}\` is not matching any of your ${pageRoutes.length} page routes (this warning is not shown in production):`,
            ...getPagesAndRoutesInfo(pageRoutes),
        ].join('\n'));
    }
}
function getPagesAndRoutesInfo(pageRoutes) {
    return pageRoutes
        .map((pageRoute) => {
        const { pageId, filesystemRoute, pageRouteFile } = pageRoute;
        let route;
        let routeType;
        if (pageRouteFile) {
            const { routeValue } = pageRouteFile;
            route =
                typeof routeValue === 'string'
                    ? routeValue
                    : truncateString(String(routeValue).split(/\s/).filter(Boolean).join(' '), 64);
            routeType = typeof routeValue === 'string' ? 'Route String' : 'Route Function';
        }
        else {
            route = filesystemRoute;
            routeType = 'Filesystem Route';
        }
        return `\`${route}\` (${routeType} of \`${pageId}.page.*\`)`;
    })
        .sort(utils_1.compareString)
        .map((line, i) => {
        const nth = (i + 1).toString().padStart(pageRoutes.length.toString().length, '0');
        return ` (${nth}) ${line}`;
    });
}
function truncateString(str, len) {
    if (len > str.length) {
        return str;
    }
    else {
        str = str.substring(0, len);
        return str + '...';
    }
}
function isFileRequest(urlPathname) {
    (0, utils_1.assert)(urlPathname.startsWith('/'));
    const paths = urlPathname.split('/');
    const lastPath = paths[paths.length - 1];
    (0, utils_1.assert)(typeof lastPath === 'string');
    const parts = lastPath.split('.');
    if (parts.length < 2) {
        return false;
    }
    const fileExtension = parts[parts.length - 1];
    (0, utils_1.assert)(typeof fileExtension === 'string');
    return /^[a-z0-9]+$/.test(fileExtension);
}
function _parseUrl(url, baseUrl) {
    (0, utils_1.assert)(url.startsWith('/') || url.startsWith('http'));
    (0, utils_1.assert)(baseUrl.startsWith('/'));
    const { urlWithoutPageContextRequestSuffix, isPageContextRequest } = (0, utils_1.handlePageContextRequestSuffix)(url);
    return Object.assign(Object.assign({}, (0, utils_1.parseUrl)(urlWithoutPageContextRequestSuffix, baseUrl)), { isPageContextRequest });
}
async function getGlobalContext() {
    const globalContext = {
        _parseUrl,
        _baseUrl: getBaseUrl(),
    };
    (0, utils_1.assertBaseUrl)(globalContext._baseUrl);
    const allPageFiles = await (0, getPageFiles_1.getAllPageFiles)();
    (0, utils_1.objectAssign)(globalContext, {
        _allPageFiles: allPageFiles,
    });
    const allPageIds = await (0, determinePageIds_1.determinePageIds)(allPageFiles);
    (0, utils_1.objectAssign)(globalContext, { _allPageIds: allPageIds });
    const { pageRoutes, onBeforeRouteHook } = await (0, route_1.loadPageRoutes)(globalContext);
    (0, utils_1.objectAssign)(globalContext, { _pageRoutes: pageRoutes, _onBeforeRouteHook: onBeforeRouteHook });
    return globalContext;
}
exports.getGlobalContext = getGlobalContext;
function throwPrerenderError(err) {
    // `err` originates from a user hook throwing; Vite is out of the equation here.
    (0, utils_1.assert)(viteAlreadyLoggedError(err) === false);
    viteErrorCleanup(err);
    if ((0, utils_1.hasProp)(err, 'stack')) {
        throw err;
    }
    else {
        throw new Error(err);
    }
}
exports.throwPrerenderError = throwPrerenderError;
function logError(err) {
    if (viteAlreadyLoggedError(err)) {
        return;
    }
    (0, utils_1.assertUsage)((0, utils_1.isObject)(err), 'Your source code threw a primitive value as error (this should never happen). Contact the `vite-plugin-ssr` maintainer to get help.');
    // Avoid logging error twice (not sure if this actually ever happens?)
    if (hasAlreadyLogged(err)) {
        return;
    }
    viteErrorCleanup(err);
    // We ensure we print a string; Cloudflare Workers doesn't seem to properly stringify `Error` objects.
    const errStr = ((0, utils_1.hasProp)(err, 'stack') && String(err.stack)) || String(err);
    console.error(errStr);
}
function viteAlreadyLoggedError(err) {
    const { viteDevServer, isProduction } = (0, ssrEnv_1.getSsrEnv)();
    if (isProduction) {
        return false;
    }
    if (viteDevServer && viteDevServer.config.logger.hasErrorLogged(err)) {
        return true;
    }
    return false;
}
function hasAlreadyLogged(err) {
    (0, utils_1.assert)((0, utils_1.isObject)(err));
    const key = '_wasAlreadyConsoleLogged';
    if (err[key]) {
        return true;
    }
    err[key] = true;
    return false;
}
function viteErrorCleanup(err) {
    const { viteDevServer } = (0, ssrEnv_1.getSsrEnv)();
    if (viteDevServer) {
        if ((0, utils_1.hasProp)(err, 'stack')) {
            // Apply source maps
            viteDevServer.ssrFixStacktrace(err);
        }
    }
}
function getBaseUrl() {
    const { baseUrl } = (0, ssrEnv_1.getSsrEnv)();
    return baseUrl;
}
//# sourceMappingURL=renderPage.js.map
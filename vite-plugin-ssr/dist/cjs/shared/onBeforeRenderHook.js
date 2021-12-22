"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUsageServerHooksCalled = exports.runOnBeforeRenderHooks = exports.getOnBeforeRenderHook = void 0;
const assertPageContextProvidedByUser_1 = require("./assertPageContextProvidedByUser");
const utils_1 = require("./utils");
function getOnBeforeRenderHook(fileExports, filePath, required) {
    if (required) {
        (0, utils_1.assertUsage)((0, utils_1.hasProp)(fileExports, 'onBeforeRender'), `${filePath} should \`export { onBeforeRender }\`.`);
    }
    else {
        if (!(0, utils_1.hasProp)(fileExports, 'onBeforeRender')) {
            return null;
        }
    }
    (0, utils_1.assertUsage)((0, utils_1.isCallable)(fileExports.onBeforeRender), `The \`export { onBeforeRender }\` of ${filePath} should be a function.`);
    const onBeforeRenderHook = {
        async callHook(pageContext) {
            (0, utils_1.assert)((0, utils_1.isCallable)(fileExports.onBeforeRender));
            const hookReturn = await fileExports.onBeforeRender(pageContext);
            if (hookReturn === undefined || hookReturn === null) {
                return { pageContext: {} };
            }
            (0, utils_1.assertUsage)((0, utils_1.hasProp)(hookReturn, 'pageContext'), `The \`onBeforeRender()\` hook exported by ${filePath} should return \`undefined\`, \`null\`, or \`{ pageContext: { /*...*/ }}\` (a JavaScript object with a single key \`pageContext\`).`);
            const pageContextProvidedByUser = hookReturn.pageContext;
            (0, assertPageContextProvidedByUser_1.assertPageContextProvidedByUser)(pageContextProvidedByUser, { hookName: 'onBeforeRender', hookFilePath: filePath });
            return { pageContext: pageContextProvidedByUser };
        },
    };
    return onBeforeRenderHook;
}
exports.getOnBeforeRenderHook = getOnBeforeRenderHook;
async function runOnBeforeRenderHooks(pageFile, defaultFile, pageContext) {
    (0, utils_1.assert)(defaultFile === null || defaultFile.filePath.includes('_default'));
    let pageHookWasCalled = false;
    let skipHook = false;
    const pageContextAddendum = {};
    if ((defaultFile === null || defaultFile === void 0 ? void 0 : defaultFile.onBeforeRenderHook) && !(pageFile === null || pageFile === void 0 ? void 0 : pageFile.fileExports.skipOnBeforeRenderDefaultHook)) {
        const hookReturn = await defaultFile.onBeforeRenderHook.callHook(Object.assign(Object.assign({}, pageContext), { runOnBeforeRenderPageHook,
            skipOnBeforeRenderPageHook }));
        Object.assign(pageContextAddendum, hookReturn.pageContext);
        if (pageFile === null || pageFile === void 0 ? void 0 : pageFile.onBeforeRenderHook) {
            (0, utils_1.assertUsage)(pageHookWasCalled || skipHook, [
                `The page \`${pageContext._pageId}\` has a \`onBeforeRender()\` hook defined in ${pageFile.filePath} as well as in ${defaultFile.filePath}.`,
                `Either \`export const skipOnBeforeRenderDefaultHook = true\` in ${pageFile.filePath}, or`,
                'call `pageContext.skipOnBeforeRenderPageHook()` or `pageContext.runOnBeforeRenderPageHook(pageContext)`',
                `in the \`onBeforeRender()\` hook defined in ${defaultFile.filePath} — see https://vite-plugin-ssr.com/onBeforeRender-multiple`,
            ].join(' '));
        }
    }
    else {
        if (pageFile === null || pageFile === void 0 ? void 0 : pageFile.onBeforeRenderHook) {
            const hookReturn = await runOnBeforeRenderPageHook(pageContext);
            Object.assign(pageContextAddendum, hookReturn.pageContext);
        }
    }
    (0, utils_1.assert)(!(pageFile === null || pageFile === void 0 ? void 0 : pageFile.onBeforeRenderHook) || pageHookWasCalled || skipHook);
    return pageContextAddendum;
    async function skipOnBeforeRenderPageHook() {
        (0, utils_1.assertUsage)(pageHookWasCalled === false, 'You cannot call `pageContext.skipOnBeforeRenderPageHook()` after having called `pageContext.runOnBeforeRenderPageHook()`.');
        skipHook = true;
    }
    async function runOnBeforeRenderPageHook(pageContextProvided) {
        (0, utils_1.assertUsage)(pageContextProvided, '[pageContext.runOnBeforeRenderPageHook(pageContext)] Missing argument `pageContext`.');
        (0, utils_1.assertUsage)(pageHookWasCalled === false, 'You already called `pageContext.runOnBeforeRenderPageHook()`; you cannot call it a second time.');
        (0, utils_1.assertUsage)(skipHook === false, 'You cannot call `pageContext.runOnBeforeRenderPageHook()` after having called `pageContext.skipOnBeforeRenderPageHook()`.');
        pageHookWasCalled = true;
        if (!(pageFile === null || pageFile === void 0 ? void 0 : pageFile.onBeforeRenderHook)) {
            return { pageContext: {} };
        }
        const hookReturn = await pageFile.onBeforeRenderHook.callHook(pageContextProvided || pageContext);
        return hookReturn;
    }
}
exports.runOnBeforeRenderHooks = runOnBeforeRenderHooks;
function assertUsageServerHooksCalled(args) {
    const hooksIsomorphic = args.hooksIsomorphic.filter(isFilePath);
    (0, utils_1.assert)(hooksIsomorphic.length > 0);
    const hooksServer = args.hooksServer.filter(isFilePath);
    [...hooksIsomorphic, ...hooksServer].forEach((filePath) => filePath.startsWith('/'));
    if (hooksServer.length > 0) {
        (0, utils_1.assertUsage)(args.serverHooksCalled, [
            `The page \`${args._pageId}\` has \`onBeforeRender()\` hooks defined in \`.page.js\` as well as in \`.page.server.js\` files:`,
            `\`export { onBeforeRender }\` in`,
            hooksIsomorphic[0],
            hooksIsomorphic[1] ? ` and ${hooksIsomorphic[1]}` : null,
            '(`.page.js`)',
            `as well as \`export { onBeforeRender }\` in`,
            hooksServer[0],
            hooksServer[1] ? ` and ${hooksServer[1]}` : null,
            '(`.page.server.js`).',
            'Either call `pageContext.skipOnBeforeRenderServerHooks()`',
            'or call `pageContext.runOnBeforeRenderServerHooks()` in the `onBeforeRender()` hook of',
            hooksIsomorphic[0],
            hooksIsomorphic[1] ? ` or ${hooksIsomorphic[1]}` : null,
            '— see https://vite-plugin-ssr.com/onBeforeRender-multiple',
        ]
            .filter(Boolean)
            .join(' '));
    }
    return;
    function isFilePath(v) {
        if (typeof v === 'string') {
            (0, utils_1.assert)(v.startsWith('/'));
            return true;
        }
        (0, utils_1.assert)(v === undefined || v === null);
        return false;
    }
}
exports.assertUsageServerHooksCalled = assertUsageServerHooksCalled;
//# sourceMappingURL=onBeforeRenderHook.js.map
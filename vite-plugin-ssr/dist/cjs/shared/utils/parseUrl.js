"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeBaseUrl = exports.assertUsageBaseUrl = exports.assertBaseUrl = exports.prependBaseUrl = exports.parseUrl = exports.getUrlFullWithoutHash = exports.getUrlPathname = exports.getUrlFull = void 0;
const slice_1 = require("./slice");
const assert_1 = require("./assert");
/**
 Returns `${pathname}${search}${hash}`. (Basically removes the origin.)
*/
function getUrlFull(url) {
    url = retrieveUrl(url);
    const { origin, searchString, hashString, pathnameWithoutBaseUrl: pathname } = parseUrl(url, '/'); // is Base URL missing?
    const urlFull = `${pathname}${searchString || ''}${hashString || ''}`;
    const urlRecreated = `${origin || ''}${urlFull}`;
    (0, assert_1.assert)(url === urlRecreated, { urlRecreated, url });
    return urlFull;
}
exports.getUrlFull = getUrlFull;
/**
 Returns `${pathname}`
*/
function getUrlPathname(url) {
    url = retrieveUrl(url);
    const urlPathname = parseUrl(url, '/').pathnameWithoutBaseUrl; // is Base URL missing?
    return urlPathname;
}
exports.getUrlPathname = getUrlPathname;
function parseUrl(url, baseUrl) {
    (0, assert_1.assert)(
    // These URLs should work out
    url.startsWith('/') ||
        url.startsWith('http') ||
        url.startsWith('.') ||
        url.startsWith('?') ||
        // Not sure about these URLs, but should work in principle
        url.startsWith('#') ||
        url === '', { url });
    (0, assert_1.assert)(baseUrl.startsWith('/'));
    // Hash
    const [urlWithoutHash, ...hashList] = url.split('#');
    (0, assert_1.assert)(urlWithoutHash !== undefined);
    const hashString = ['', ...hashList].join('#') || null;
    (0, assert_1.assert)(hashString === null || hashString.startsWith('#'));
    const hash = hashString === null ? '' : decodeURIComponent(hashString.slice(1));
    // Search
    const [urlWithoutSearch, ...searchList] = urlWithoutHash.split('?');
    (0, assert_1.assert)(urlWithoutSearch !== undefined);
    const searchString = ['', ...searchList].join('?') || null;
    (0, assert_1.assert)(searchString === null || searchString.startsWith('?'));
    const search = Object.fromEntries(Array.from(new URLSearchParams(searchString || '')));
    // Origin + pathname
    const { origin, pathname: pathnameWithBaseUrl } = parseWithNewUrl(urlWithoutSearch);
    (0, assert_1.assert)(pathnameWithBaseUrl.startsWith('/'));
    (0, assert_1.assert)(origin === null || url.startsWith(origin), { url });
    if (url.startsWith('/')) {
        (0, assert_1.assert)(pathnameWithBaseUrl === urlWithoutSearch.slice((origin || '').length), { url });
    }
    // Base URL
    const { pathnameWithoutBaseUrl, hasBaseUrl } = analyzeBaseUrl(pathnameWithBaseUrl, baseUrl);
    // Assert result
    if (url.startsWith('/') || url.startsWith('http')) {
        const urlRecreated = `${origin || ''}${pathnameWithBaseUrl}${searchString || ''}${hashString || ''}`;
        (0, assert_1.assert)(url === urlRecreated, { urlRecreated, url });
    }
    (0, assert_1.assert)(pathnameWithBaseUrl.startsWith('/'));
    (0, assert_1.assert)(pathnameWithoutBaseUrl.startsWith('/'));
    return { origin, pathnameWithoutBaseUrl, pathnameWithBaseUrl, hasBaseUrl, search, searchString, hash, hashString };
}
exports.parseUrl = parseUrl;
function getUrlFullWithoutHash(url) {
    const urlFull = getUrlFull(url);
    const urlFullWithoutHash = urlFull.split('#')[0];
    (0, assert_1.assert)(urlFullWithoutHash);
    return urlFullWithoutHash;
}
exports.getUrlFullWithoutHash = getUrlFullWithoutHash;
function retrieveUrl(url) {
    if (!url) {
        url = window.location.href;
    }
    return url;
}
function parseWithNewUrl(url) {
    var _a;
    let origin;
    let pathname;
    try {
        // `new URL(url)` throws an error if `url` doesn't have an origin
        const urlParsed = new URL(url);
        origin = urlParsed.origin;
        pathname = urlParsed.pathname;
    }
    catch (err) {
        // `url` has no origin
        origin = null;
        // In the browser, this is the Base URL of the current URL
        const currentBase = typeof window !== 'undefined' &&
            (
            // We need to access safely in case the user sets `window` in Node.js
            (_a = window === null || window === void 0 ? void 0 : window.document) === null || _a === void 0 ? void 0 : _a.baseURI);
        // We cannot resolve relative URLs in Node.js
        (0, assert_1.assert)(currentBase || !url.startsWith('.'));
        // Is there any other kind of URLs that vite-plugin-ssr should support?
        (0, assert_1.assert)(currentBase || url.startsWith('/') || url.startsWith('?'));
        const fakeBase = currentBase || 'http://fake-origin.example.org';
        // Supports:
        //  - `url === '/absolute/path'`
        //  - `url === './relative/path'`
        //  - `url === '?queryWithoutPath'`
        const urlParsed = new URL(url, fakeBase);
        pathname = urlParsed.pathname;
    }
    (0, assert_1.assert)(pathname.startsWith('/'), { url, pathname });
    // The URL pathname should be the URL without origin, query string, and hash.
    //  - https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname
    (0, assert_1.assert)(pathname === pathname.split('?')[0].split('#')[0], { pathname });
    return { origin, pathname };
}
function assertUsageBaseUrl(baseUrl, usageErrorMessagePrefix = '') {
    (0, assert_1.assertUsage)(baseUrl.startsWith('/'), usageErrorMessagePrefix + 'Wrong `base` value `' + baseUrl + '`; `base` should start with `/`.');
    assertBaseUrl(baseUrl);
}
exports.assertUsageBaseUrl = assertUsageBaseUrl;
function assertBaseUrl(baseUrl) {
    (0, assert_1.assert)(baseUrl.startsWith('/'));
}
exports.assertBaseUrl = assertBaseUrl;
function assertUrlPathname(urlPathname) {
    (0, assert_1.assert)(urlPathname.startsWith('/'));
    (0, assert_1.assert)(!urlPathname.includes('?'));
    (0, assert_1.assert)(!urlPathname.includes('#'));
}
function analyzeBaseUrl(urlPathnameWithBase, baseUrl) {
    assertUrlPathname(urlPathnameWithBase);
    assertBaseUrl(baseUrl);
    // Mutable
    let url = urlPathnameWithBase;
    (0, assert_1.assert)(url.startsWith('/'));
    (0, assert_1.assert)(baseUrl.startsWith('/'));
    if (baseUrl === '/') {
        const pathnameWithoutBaseUrl = urlPathnameWithBase;
        return { pathnameWithoutBaseUrl, hasBaseUrl: true };
    }
    // Support `url === '/some-base-url' && baseUrl === '/some-base-url/'`
    let baseUrlNormalized = baseUrl;
    let urlPathname = getUrlPathname(url);
    if (baseUrl.endsWith('/') && urlPathname === (0, slice_1.slice)(baseUrl, 0, -1)) {
        baseUrlNormalized = (0, slice_1.slice)(baseUrl, 0, -1);
        (0, assert_1.assert)(urlPathname === baseUrlNormalized);
    }
    if (!url.startsWith(baseUrlNormalized)) {
        const pathnameWithoutBaseUrl = urlPathnameWithBase;
        return { pathnameWithoutBaseUrl, hasBaseUrl: false };
    }
    (0, assert_1.assert)(url.startsWith('/') || url.startsWith('http'));
    (0, assert_1.assert)(url.startsWith(baseUrlNormalized));
    url = url.slice(baseUrlNormalized.length);
    /* url can actually start with `httpsome-pathname`
    assert(!url.startsWith('http'))
    */
    /* `handleUrlOrigin('some-pathname-without-leading-slash')` fails
    assert((handleUrlOrigin(url).urlOrigin===null))
    */
    if (!url.startsWith('/'))
        url = '/' + url;
    (0, assert_1.assert)(url.startsWith('/'));
    return { pathnameWithoutBaseUrl: url, hasBaseUrl: true };
}
function prependBaseUrl(url, baseUrl) {
    assertBaseUrl(baseUrl);
    const baseUrlNormalized = normalizeBaseUrl(baseUrl);
    if (baseUrlNormalized === '/')
        return url;
    (0, assert_1.assert)(!baseUrlNormalized.endsWith('/'));
    (0, assert_1.assert)(url.startsWith('/'));
    return `${baseUrlNormalized}${url}`;
}
exports.prependBaseUrl = prependBaseUrl;
function normalizeBaseUrl(baseUrl) {
    let baseUrlNormalized = baseUrl;
    if (baseUrlNormalized.endsWith('/') && baseUrlNormalized !== '/') {
        baseUrlNormalized = (0, slice_1.slice)(baseUrlNormalized, 0, -1);
    }
    // We can and should expect `baseUrl` to not contain `/` doublets.
    (0, assert_1.assert)(!baseUrlNormalized.endsWith('/') || baseUrlNormalized === '/');
    return baseUrlNormalized;
}
exports.normalizeBaseUrl = normalizeBaseUrl;
//# sourceMappingURL=parseUrl.js.map
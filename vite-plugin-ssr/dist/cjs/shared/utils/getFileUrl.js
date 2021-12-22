"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePageContextRequestSuffix = exports.getFileUrl = void 0;
const parseUrl_1 = require("./parseUrl");
const assert_1 = require("./assert");
const slice_1 = require("./slice");
const pageContextUrlSuffix = '.pageContext.json';
/**
 (`/`, `.html`) -> `/index.html`
 (`/`, `.pageContext`) -> `/index.pageContext.json`
 (`/about`, `.html`) -> `/about/index.html`
 (`/about/`, `.pageContext`) -> `/about/index.pageContext.json`
 (`/news/hello`, `.html`) -> `/news/hello/index.html`
 (`/product/42?review=true#reviews`, `.pageContext`) -> `/product/42/index.pageContext?review=true#reviews`
 ...
*/
function getFileUrl(url, fileExtension, doNotCreateExtraDirectory) {
    (0, assert_1.assert)(fileExtension !== '.pageContext.json' || doNotCreateExtraDirectory === true);
    const { pathnameWithoutBaseUrl, searchString, hashString } = (0, parseUrl_1.parseUrl)(url, '/'); // is Base URL missing?
    if (url.startsWith('/')) {
        (0, assert_1.assert)(url === `${pathnameWithoutBaseUrl}${searchString || ''}${hashString || ''}`, { url });
    }
    let pathnameModified = pathnameWithoutBaseUrl;
    if (doNotCreateExtraDirectory) {
        if (pathnameModified.endsWith('/')) {
            pathnameModified = (0, slice_1.slice)(pathnameModified, 0, -1);
        }
        (0, assert_1.assert)(!pathnameModified.endsWith('/'));
        if (pathnameModified === '') {
            pathnameModified = '/index';
        }
    }
    else {
        const trailingSlash = pathnameWithoutBaseUrl.endsWith('/') ? '' : '/';
        pathnameModified = pathnameModified + `${trailingSlash}index`;
    }
    const fileUrl = `${pathnameModified}${fileExtension}${searchString || ''}${hashString || ''}`;
    return fileUrl;
}
exports.getFileUrl = getFileUrl;
function handlePageContextRequestSuffix(url) {
    const pathname = (0, parseUrl_1.parseUrl)(url, '/').pathnameWithoutBaseUrl; // is Base URL missing?
    if (!pathname.endsWith(pageContextUrlSuffix)) {
        return { urlWithoutPageContextRequestSuffix: url, isPageContextRequest: false };
    }
    return { urlWithoutPageContextRequestSuffix: removePageContextUrlSuffix(url), isPageContextRequest: true };
}
exports.handlePageContextRequestSuffix = handlePageContextRequestSuffix;
function removePageContextUrlSuffix(url) {
    const urlParsed = (0, parseUrl_1.parseUrl)(url, '/'); // is Base URL missing?
    const { origin, searchString, hashString } = urlParsed;
    let pathname = urlParsed.pathnameWithoutBaseUrl;
    (0, assert_1.assert)(url === `${origin || ''}${pathname}${searchString || ''}${hashString || ''}`, { url });
    (0, assert_1.assert)(pathname.endsWith(pageContextUrlSuffix), { url });
    pathname = (0, slice_1.slice)(pathname, 0, -1 * pageContextUrlSuffix.length);
    if (pathname === '/index')
        pathname = '/';
    return `${origin || ''}${pathname}${searchString || ''}${hashString || ''}`;
}
//# sourceMappingURL=getFileUrl.js.map
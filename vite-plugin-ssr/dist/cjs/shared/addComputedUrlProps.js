"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addComputedUrlProps = void 0;
const utils_1 = require("./utils");
function addComputedUrlProps(pageContext) {
    var _a, _b;
    if ('urlPathname' in pageContext) {
        (0, utils_1.assert)(((_a = Object.getOwnPropertyDescriptor(pageContext, 'urlPathname')) === null || _a === void 0 ? void 0 : _a.get) === urlPathnameGetter);
        (0, utils_1.assert)(((_b = Object.getOwnPropertyDescriptor(pageContext, 'urlParsed')) === null || _b === void 0 ? void 0 : _b.get) === urlParsedGetter);
    }
    else {
        Object.defineProperty(pageContext, 'urlPathname', {
            get: urlPathnameGetter,
            enumerable: true,
            configurable: true,
        });
        Object.defineProperty(pageContext, 'urlParsed', {
            get: urlParsedGetter,
            enumerable: true,
            configurable: true,
        });
    }
}
exports.addComputedUrlProps = addComputedUrlProps;
function getUrlParsed(pageContext) {
    const { url, _baseUrl: baseUrl, _parseUrl } = pageContext;
    (0, utils_1.assert)(baseUrl.startsWith('/'));
    (0, utils_1.assert)(_parseUrl === null || (0, utils_1.isCallable)(pageContext._parseUrl));
    if (_parseUrl === null) {
        return (0, utils_1.parseUrl)(url, baseUrl);
    }
    else {
        return _parseUrl(url, baseUrl);
    }
}
function urlPathnameGetter() {
    const { pathnameWithoutBaseUrl } = getUrlParsed(this);
    const urlPathname = pathnameWithoutBaseUrl;
    (0, utils_1.assert)(urlPathname.startsWith('/'));
    return urlPathname;
}
function urlParsedGetter() {
    const urlParsedOriginal = getUrlParsed(this);
    const pathname = urlParsedOriginal.pathnameWithoutBaseUrl;
    const urlParsed = urlParsedOriginal;
    delete urlParsed.pathnameWithoutBaseUrl;
    (0, utils_1.objectAssign)(urlParsed, { pathname });
    (0, utils_1.assert)(urlParsed.pathname.startsWith('/'));
    (0, utils_1.assert)(!('pathnameWithoutBaseUrl' in urlParsed));
    return urlParsed;
}
//# sourceMappingURL=addComputedUrlProps.js.map
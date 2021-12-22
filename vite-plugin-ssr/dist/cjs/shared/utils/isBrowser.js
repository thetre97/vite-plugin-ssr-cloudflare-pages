"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBrowser = void 0;
function isBrowser() {
    // Using `typeof window !== 'undefined'` alone is not enough because some users use https://www.npmjs.com/package/ssr-window
    return typeof window !== 'undefined' && typeof window.scrollY === 'number';
}
exports.isBrowser = isBrowser;
//# sourceMappingURL=isBrowser.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inferMediaType = void 0;
const utils_1 = require("../../shared/utils");
function inferMediaType(href) {
    (0, utils_1.assert)(href.startsWith('/'));
    (0, utils_1.assert)(!href.startsWith('//'));
    // Basics
    if (href.endsWith('.css') || href.endsWith('.sass') || href.endsWith('.less') || href.endsWith('.scss')) {
        return { mediaType: 'text/css', preloadType: 'style' };
    }
    if (href.endsWith('.js')) {
        return { mediaType: 'text/javascript', preloadType: 'script' };
    }
    // Images
    if (href.endsWith('.png')) {
        return { preloadType: 'image', mediaType: 'image/png' };
    }
    if (href.endsWith('.webp')) {
        return { preloadType: 'image', mediaType: 'image/webp' };
    }
    if (href.endsWith('.jpg') || href.endsWith('.jpeg')) {
        return { preloadType: 'image', mediaType: 'image/jpeg' };
    }
    if (href.endsWith('.gif')) {
        return { preloadType: 'image', mediaType: 'image/gif' };
    }
    if (href.endsWith('.svg')) {
        return { preloadType: 'image', mediaType: 'image/svg+xml' };
    }
    // Fonts
    if (href.endsWith('.ttf')) {
        return { preloadType: 'font', mediaType: 'font/ttf' };
    }
    if (href.endsWith('.woff')) {
        return { preloadType: 'font', mediaType: 'font/woff' };
    }
    if (href.endsWith('.woff2')) {
        return { preloadType: 'font', mediaType: 'font/woff2' };
    }
    return null;
}
exports.inferMediaType = inferMediaType;
//# sourceMappingURL=inferMediaType.js.map
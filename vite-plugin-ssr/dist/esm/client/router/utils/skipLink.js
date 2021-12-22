import { parseUrl, assertBaseUrl } from '../../../shared/utils';
import { isExternalLink } from './isExternalLink';
export { skipLink };
function skipLink(linkTag) {
    const url = linkTag.getAttribute('href');
    if (url === null)
        return true;
    if (isExternalLink(url))
        return true;
    if (isNewTabLink(linkTag))
        return true;
    if (isHashUrl(url))
        return true;
    if (!hasBaseUrl(url)) {
        return true;
    }
    return false;
}
function isNewTabLink(linkTag) {
    const target = linkTag.getAttribute('target');
    const rel = linkTag.getAttribute('rel');
    return target === '_blank' || target === '_external' || rel === 'external' || linkTag.hasAttribute('download');
}
function isHashUrl(url) {
    if (url.startsWith('#')) {
        return true;
    }
    const removeHash = (url) => url.split('#')[0];
    if (url.includes('#') && removeHash(url) === removeHash(window.location.href)) {
        return true;
    }
    return false;
}
function hasBaseUrl(url) {
    const baseUrl = import.meta.env.BASE_URL;
    assertBaseUrl(baseUrl);
    const { hasBaseUrl } = parseUrl(url, baseUrl);
    return hasBaseUrl;
}
//# sourceMappingURL=skipLink.js.map
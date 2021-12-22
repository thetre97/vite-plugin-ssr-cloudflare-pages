export { getUrlFull };
export { getUrlPathname };
export { getUrlFullWithoutHash };
export { parseUrl };
export { prependBaseUrl };
export { assertBaseUrl };
export { assertUsageBaseUrl };
export { normalizeBaseUrl };
/**
 Returns `${pathname}${search}${hash}`. (Basically removes the origin.)
*/
declare function getUrlFull(url?: string): string;
/**
 Returns `${pathname}`
*/
declare function getUrlPathname(url?: string): string;
declare function parseUrl(url: string, baseUrl: string): {
    origin: null | string;
    pathnameWithoutBaseUrl: string;
    pathnameWithBaseUrl: string;
    hasBaseUrl: boolean;
    search: Record<string, string>;
    searchString: null | string;
    hash: string;
    hashString: null | string;
};
declare function getUrlFullWithoutHash(url?: string): string;
declare function assertUsageBaseUrl(baseUrl: string, usageErrorMessagePrefix?: string): void;
declare function assertBaseUrl(baseUrl: string): void;
declare function prependBaseUrl(url: string, baseUrl: string): string;
declare function normalizeBaseUrl(baseUrl: string): string;
//# sourceMappingURL=parseUrl.d.ts.map
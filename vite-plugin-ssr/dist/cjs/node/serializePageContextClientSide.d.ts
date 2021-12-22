export { serializePageContextClientSide };
export { addIs404ToPageProps };
declare function serializePageContextClientSide(pageContext: {
    _pageId: string;
    _passToClient: string[];
    is404?: boolean;
    pageProps?: Record<string, unknown>;
}): string;
declare function addIs404ToPageProps(pageContext: {
    is404: boolean;
    pageProps?: Record<string, unknown>;
}): void;
//# sourceMappingURL=serializePageContextClientSide.d.ts.map
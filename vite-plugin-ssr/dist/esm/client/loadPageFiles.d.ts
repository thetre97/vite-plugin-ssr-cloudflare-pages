export { loadPageFiles };
declare function loadPageFiles(pageContext: {
    _pageId: string;
}): Promise<{
    _allPageFiles: import("../shared/getPageFiles").AllPageFiles;
} & {
    Page: unknown;
    pageExports: Record<string, unknown>;
    _pageIsomorphicFile: import("../shared/loadPageIsomorphicFiles").PageIsomorphicFile;
    _pageIsomorphicFileDefault: import("../shared/loadPageIsomorphicFiles").PageIsomorphicFileDefault;
}>;
//# sourceMappingURL=loadPageFiles.d.ts.map
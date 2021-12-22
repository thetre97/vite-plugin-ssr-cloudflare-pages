export { resolveFilesystemRoute };
export { getFilesystemRoute };
declare function resolveFilesystemRoute(filesystemRoute: string, urlPathname: string): null | {
    routeParams: Record<string, string>;
};
declare function getFilesystemRoute(pageId: string, filesystemRoots: {
    rootPath: string;
    rootValue: string;
}[]): string;
//# sourceMappingURL=resolveFilesystemRoute.d.ts.map
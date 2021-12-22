export { getOnBeforeRenderHook };
export { runOnBeforeRenderHooks };
export { assertUsageServerHooksCalled };
export type { OnBeforeRenderHook };
declare type OnBeforeRenderHook = {
    callHook: (pageContext: Record<string, unknown>) => Promise<{
        pageContext: Record<string, unknown>;
    }>;
};
declare function getOnBeforeRenderHook(fileExports: Record<string, unknown>, filePath: string, required: true): OnBeforeRenderHook;
declare function getOnBeforeRenderHook(fileExports: Record<string, unknown>, filePath: string): null | OnBeforeRenderHook;
declare function runOnBeforeRenderHooks(pageFile: null | {
    filePath: string;
    onBeforeRenderHook: null | OnBeforeRenderHook;
    fileExports: {
        skipOnBeforeRenderDefaultHook?: boolean;
    };
}, defaultFile: null | {
    filePath: string;
    onBeforeRenderHook: null | OnBeforeRenderHook;
}, pageContext: {
    _pageId: string;
} & Record<string, unknown>): Promise<Record<string, unknown>>;
declare function assertUsageServerHooksCalled(args: {
    hooksServer: (string | null | undefined)[];
    hooksIsomorphic: (string | null | undefined)[];
    serverHooksCalled: boolean;
    _pageId: string;
}): void;
//# sourceMappingURL=onBeforeRenderHook.d.ts.map
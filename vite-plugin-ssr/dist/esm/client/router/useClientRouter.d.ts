export { useClientRouter };
export { navigate };
declare function useClientRouter({ render, ensureHydration, onTransitionStart, onTransitionEnd, prefetchLinks, }: {
    render: (pageContext: any) => Promise<void> | void;
    onTransitionStart?: () => void;
    onTransitionEnd?: () => void;
    ensureHydration?: boolean;
    prefetchLinks?: boolean;
}): {
    hydrationPromise: Promise<void>;
};
declare function navigate(url: string, { keepScrollPosition }?: {
    keepScrollPosition?: boolean | undefined;
}): Promise<void>;
declare global {
    interface Window {
        __VUE__?: true;
    }
}
//# sourceMappingURL=useClientRouter.d.ts.map
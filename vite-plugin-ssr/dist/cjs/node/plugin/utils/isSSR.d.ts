export { isSSR_config };
export { isSSR_options };
declare function isSSR_config(config: {
    build?: {
        ssr?: boolean | string;
    };
}): boolean;
declare function isSSR_options(options: undefined | boolean | {
    ssr?: boolean;
}): boolean;
//# sourceMappingURL=isSSR.d.ts.map
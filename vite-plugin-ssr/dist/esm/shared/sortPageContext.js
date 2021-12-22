import { compareString } from './utils';
export { sortPageContext };
// Sort `pageContext` keys alphabetically, in order to make reading `console.log(pageContext)` easier
function sortPageContext(pageContext) {
    const entries = Object.entries(pageContext);
    for (const key in pageContext) {
        delete pageContext[key];
    }
    entries
        .sort(([key1], [key2]) => compareString(key1, key2))
        .forEach(([key, val]) => {
        pageContext[key] = val;
    });
}
//# sourceMappingURL=sortPageContext.js.map
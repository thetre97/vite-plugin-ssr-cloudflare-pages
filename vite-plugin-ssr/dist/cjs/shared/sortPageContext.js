"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortPageContext = void 0;
const utils_1 = require("./utils");
// Sort `pageContext` keys alphabetically, in order to make reading `console.log(pageContext)` easier
function sortPageContext(pageContext) {
    const entries = Object.entries(pageContext);
    for (const key in pageContext) {
        delete pageContext[key];
    }
    entries
        .sort(([key1], [key2]) => (0, utils_1.compareString)(key1, key2))
        .forEach(([key, val]) => {
        pageContext[key] = val;
    });
}
exports.sortPageContext = sortPageContext;
//# sourceMappingURL=sortPageContext.js.map
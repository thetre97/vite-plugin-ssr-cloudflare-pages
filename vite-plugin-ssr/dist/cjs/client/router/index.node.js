"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigate = void 0;
const utils_1 = require("../../shared/utils");
function navigate() {
    (0, utils_1.assertUsage)(!(0, utils_1.isBrowser)(), '[`navigate(url)`] Something is wrong with your environement (it loads the wrong `vite-plugin-ssr/client/router` entry). This may be happening if you use Jest or Babel. Open a new GitHub issue so we can discuss a solution.');
    (0, utils_1.assertUsage)(false, '[`navigate(url)`] The `navigate(url)` function is only callable in the browser but you are calling it in Node.js.');
}
exports.navigate = navigate;
//# sourceMappingURL=index.node.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cac_1 = require("cac");
const path_1 = require("path");
const prerender_1 = require("../prerender");
const utils_1 = require("../../shared/utils");
const cli = (0, cac_1.cac)(utils_1.projectInfo.projectName);
cli
    .command('prerender', 'Pre-render the HTML of your pages', { allowUnknownOptions: true })
    .option('--partial', 'Allow only a subset of pages to be pre-rendered')
    .option('--noExtraDir', 'Do not create a new directory for each page, e.g. generate `dist/client/about.html` instead of `dist/client/about/index.html`')
    .option('--root <path>', '[string] The root directory of your project (where `vite.config.js` live) (default: `process.cwd()`)')
    .option('--outDir <path>', '[string] The build directory of your project (default: `dist`)')
    .option('--base <path>', '[string] Public base path (default: /)')
    .option('--parallel <numberOfJobs>', '[number] Number of jobs running in parallel. Default: `os.cpus().length`. Set to `1` to disable concurrency.')
    .action(async (options) => {
    assertOptions();
    const { partial, noExtraDir, clientRouter, base, parallel, outDir } = options;
    const root = options.root && (0, path_1.resolve)(options.root);
    await (0, prerender_1.prerender)({ partial, noExtraDir, clientRouter, base, root, parallel, outDir });
});
function assertOptions() {
    // We use `rawOptions` because `cac` maps option names to camelCase
    const rawOptions = process.argv.slice(3);
    (0, utils_1.assertUsage)(!rawOptions.includes('--no-extra-dir'), '`--no-extra-dir` has been renamed: use `--noExtraDir` instead.');
    Object.values(rawOptions).forEach((option) => {
        (0, utils_1.assertUsage)(!option.startsWith('--') ||
            ['--root', '--partial', '--noExtraDir', '--clientRouter', '--base', '--parallel', '--outDir'].includes(option), 'Unknown option: ' + option);
    });
}
// Listen to unknown commands
cli.on('command:*', () => {
    (0, utils_1.assertUsage)(false, 'Unknown command: ' + cli.args.join(' '));
});
cli.help();
cli.version(utils_1.projectInfo.projectVersion);
cli.parse(process.argv.length === 2 ? [...process.argv, '--help'] : process.argv);
process.on('unhandledRejection', (rejectValue) => {
    throw rejectValue;
});
//# sourceMappingURL=bin.js.map
import path from "node:path";
import { clearCacheFolder } from "./cache";
import { log, ansiFormat, error, verbose, fmt1$ } from "./cli.output";
import { registerFlag, parseCommandLine } from "./cli.parse_flags";
import { loadConfig, loadConfigFile } from "./config";

function splash() {
    log("Testing via " + ansiFormat("Tesuto", "cyan", "black", "normal"));
}

function initGlobalThis() {
    globalThis.cmdConfig = {
        verboseMode: false,
        root: process.cwd(),
        bail: 0,
        only: false,
    };
    globalThis.absRoot = "<NOT_DEFINED>";
}

function registerCliFlags() {
    registerFlag("verbose", "boolean", () => {
        globalThis.cmdConfig.verboseMode = true;
    });
    registerFlag("root", "string", (arg) => {
        globalThis.cmdConfig.root = arg;
    });
    registerFlag("bail", "integer", (arg) => {
        globalThis.cmdConfig.bail = arg;
    });
    registerFlag("clear-cache", "boolean", (arg) => {
        if (arg) clearCacheFolder();
    });
}

function chroot() {
    try {
        process.chdir(globalThis.cmdConfig.root);
    } catch (e) {
        error("Invalid root directory.");
        process.exit(1);
    }
    absRoot = path.resolve(".");
}


async function init() {
    initGlobalThis();
    registerCliFlags();

    let testParams = parseCommandLine(process.argv.slice(2));
    loadConfig(await loadConfigFile());
    chroot();

    splash();
    verbose("Verbose mode enabled, and I'll be more chatty :)");
    verbose(`Root directory set to ${fmt1$(cmdConfig.root)}.`);

    return testParams;
}

export { init };

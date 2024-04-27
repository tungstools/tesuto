
import { readFileSync } from "fs";
import { __DEFAULT_CONFIG, __DEFAULT_CONFIG_FILE } from "./constants";
import * as esbuild from "esbuild";
import { rawToData } from "./utils";

const banner = `;(() =>{globalThis.defineTesutoConfig=function(any){return any;};})();`;

async function loadConfigFile(file?: string) {
    file ??= __DEFAULT_CONFIG_FILE;
    let content = readFileSync(file).toString("utf-8");
    let code = "";
    if (file.endsWith(".ts")) {
        code = esbuild.transformSync(content, { loader: "ts", banner: banner }).code;
    } else {
        code = banner + content;
    }
    const c: { default: TesutoConfig } = await import(rawToData(code, "text/javascript"));
    return c;
}

function loadConfig(config: { default: TesutoConfig }) {
    globalThis.config = __DEFAULT_CONFIG;
    Object.entries(config.default).forEach(([key, value]) => {
        globalThis.config[key] = value;
    })
    // TODO(tl): merge config input by command line and config file. looking for a solution like antfu/unconfig
}

export { loadConfigFile, loadConfig };

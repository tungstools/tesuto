
import { statSync, readFileSync, existsSync } from "fs";
import { __DEFAULT_CONFIG, __DEFAULT_CONFIG_FILE } from "./constants";
import * as esbuild from "esbuild";
import { rawToData } from "./utils";
import { verbose } from "./cli.output";

const banner = `;(() =>{globalThis.defineTesutoConfig=function(any){return any;};})();`;

async function loadConfigFile(file?: string) {
    file ??= __DEFAULT_CONFIG_FILE.find((f) => existsSync(f) && statSync(f).isFile);
    if (!file) {
        verbose("No config file found. Using default config.");
        return { default: {} };
    }

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
    // TODO(tl): merge config input by command line and config file, even multiple config file. looking for a solution like antfu/unconfig
    // but first, define what should be in config
}

export { loadConfigFile, loadConfig };


import * as esbuild from "esbuild";
import path from "node:path";
import { TEMP_FOLDER } from "./constants";

const replaceImportPlugin = (relative: string) => {
    return {
        name: "replace-import",
        setup(build: esbuild.PluginBuild) {
            build.onResolve({ filter: /.*/, namespace: "file" }, async (args) => {
                console.log("request", args);
                console.log(relative);
                let result = await build.resolve(args.path, { kind: args.kind, resolveDir: path.join(absRoot, relative) });
                console.log("result", result);
                return result;
            });
        }
    }
}

async function buildTestFile(entry: string, relativeDir: string) {
    await esbuild.build({
        entryPoints: [path.join(absRoot, TEMP_FOLDER, entry)],
        bundle: true,
        outfile: path.join(absRoot, TEMP_FOLDER, `bundled.${entry}`),
        absWorkingDir: absRoot,
        plugins: [
            replaceImportPlugin(relativeDir)
        ]
    });
}

export { buildTestFile }


import * as esbuild from "esbuild";
import path from "node:path";
import { TEMP_FOLDER } from "./constants";

async function buildTestFile(entry: string) {
    await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        outfile: path.join(absRoot, TEMP_FOLDER, `bundled.${entry}`),
        plugins: [
            {
                name: "replace-import",
                setup(build) {
                    build.onResolve({ filter: /.*/ }, (args) => {
                        console.log(args);
                        if (args.kind == "entry-point") return { path: path.join(absRoot, TEMP_FOLDER, args.path) };
                        // FIXME(tl): looking for esbuild resolve algorithm
                        if (args.kind == "import-statement") return { path: path.join(absRoot, args.path + ".ts")};
                    });
                }
            }
        ]
    });
}

export { buildTestFile }

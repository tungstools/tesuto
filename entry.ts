#!/usr/bin/env node

/// <reference path="d.ts" />

import { verbose, ansiFormat, fmt1$ } from "./cli.output";
import { findTestFiles } from "./entry.find_file";
import { readFileSync, writeFileSync } from "node:fs";
import * as esbuild from "esbuild";

import path from "node:path";
import { getFileCacheHash, writeToCacheMap } from "./cache";

import { describe, test, it } from "./runtime";
import { CACHE_FOLDER } from "./constants";
import { buildTestFile } from "./entry.import_handler";
import { init } from "./entry.init";

function transpileTypescriptFile(file: string) {
    const content = readFileSync(file, "utf-8");
    const transformed = esbuild.transformSync(content, { loader: "ts" });
    return transformed.code;
};

function trimFileName(file: string) {
    return path.basename(file);
}

function fileShallTranspile(file: string) {
    return file.endsWith(".ts");
}

async function entry() {
    let testParams = await init();
    if (testParams.length == 0) {
        verbose("No files provided by command line, searching for test files...");
        testParams = findTestFiles();
    } else {
        verbose("Using files provided by command line.");
    }

    let contents: { file: string, content: string }[] = [];


    if (testParams.length > 0) {
        testParams.forEach((f) => {
            if (fileShallTranspile(f)) {
                verbose(`Transforming file ${ansiFormat(f, "cyan", "black", "normal")}.`);
                let content = transpileTypescriptFile(f);
                contents.push({ file: path.resolve(f), content: content });
            }
        })
        verbose(`Transformed ${fmt1$(contents.length.toString())} files. Creating cache...`);
    } else {
        verbose("No test entries found - Tesuto will exit now.");
        return;
    }

    let cacheMap = new Map<string, string>();
    contents.forEach((c) => {
        const hash = getFileCacheHash({ originalPath: c.file, content: c.content });
        const cacheName = `${trimFileName(c.file)}.${hash}.js`;
        cacheMap.set(c.file, "partial/" + cacheName);
        writeFileSync(path.join(CACHE_FOLDER, "partial", cacheName), c.content, { encoding: "utf-8", flag: "w" });
    });

    writeToCacheMap(cacheMap);

    verbose(`Cache created. Running tests...`);

    for (const [file, cache] of cacheMap) {
        verbose('Building test file ' + ansiFormat(file, "cyan", "black", "normal"));
        const relativeDir = path.dirname(path.relative(absRoot, file));
        buildTestFile(cache, relativeDir);
    }

}

entry();

export { type describe, type test, type it };
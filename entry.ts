#!/usr/bin/env node

import { log, error, verbose, ansiFormat, fmt1$ } from "./cli.output";
import { loadConfig, parseCommandLine, registerFlag } from "./cli";
import { directoryWalker, findTestFiles } from "./entry.find_file";
import { loadConfigFile } from "./config";
import { readFileSync } from "node:fs";
import * as esbuild from "esbuild";

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
}

function registerCli() {
    registerFlag("verbose", "boolean", () => {
        globalThis.cmdConfig.verboseMode = true;
    });
    registerFlag("root", "string", (arg) => {
        globalThis.cmdConfig.root = arg;
    });
    registerFlag("bail", "integer", (arg) => {
        globalThis.cmdConfig.bail = arg;
    });
    registerFlag("only", "boolean", () => {
        globalThis.cmdConfig.only = true;
    });
}

function runTest() {

}

function injectTest() {

}

async function entry() {
    initGlobalThis();
    registerCli();

    let files = parseCommandLine(process.argv.slice(2));
    try {
        process.chdir(globalThis.cmdConfig.root);
    } catch (e) {
        error("Invalid root directory.");
        process.exit(1);
    }

    loadConfig(await loadConfigFile());

    splash();
    verbose("Verbose mode enabled, and I'll be more chatty :)");
    verbose(`Root directory set to ${fmt1$(cmdConfig.root)}.`);

    if (files.length == 0) {
        verbose("No files provided by command line, searching for test files...");
        files = findTestFiles();
    } else {
        verbose("Using files provided by command line.");
    }

    let contents: { file: string, content: string }[] = [];
    files.forEach((f) => {
        if (f.endsWith(".ts")) {
            verbose(`Transforming file ${ansiFormat(f, "cyan", "black", "normal")}.`);
            let content = readFileSync(f, "utf-8");
            contents.push({ file: f, content: esbuild.transformSync(content, { loader: "ts" }).code });
        }
    })
    verbose(`Transformed ${fmt1$(contents.length.toString())} files. Pending to run...`);
    console.log(contents);

}

entry();

#!/usr/bin/env node

import { log, error } from "./cli.output";
import { parseCommandLine, registerFlag } from "./cli";

function splash() {
    log("Tesuto", "green");
}

export function entry() {
    let root = ".";
    registerFlag("root", "string", (arg) => {
        root = arg;
    });

    let files = parseCommandLine(process.argv.slice(2));
    (() => {
        try {
            process.chdir(root);
        } catch (e) {
            error("Invalid root directory.");
            process.exit(1);
        }
    })();

    console.log(process.cwd());
    console.log(files);
}

entry();

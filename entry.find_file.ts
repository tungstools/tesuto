import fs from "fs";
import path from "path";
import { fmt1$, verbose } from "./cli.output";

function directoryWalker(root: string, onFile: (file: string) => void = () => { }, onFolder: (folder: string) => /* skipWalkingOrNot: */ boolean = () => true, currentPath?: string) {
    currentPath ??= root;
    const files = fs.readdirSync(currentPath);

    for (const file of files) {
        const filePath = path.join(currentPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            onFolder(filePath) ? directoryWalker(root, onFile, onFolder, filePath) : void 0;
        } else if (stats.isFile()) {
            onFile(filePath);
        }
    }
}

function isTestFile(file: string) {
    return file.endsWith(".test.ts") || file.endsWith(".test.js");
}

function findTestFiles() {
    let result: string[] = [];

    const onFile = (file: string) => {
        if (isTestFile(path.basename(file))) {
            result.push(file);
        }
    }
    directoryWalker(".", onFile);
    if (result.length == 0) {
        verbose(`No test files found.`);
    } else {
        verbose(`Found ${fmt1$(result.length.toString())} test files. Pending to run...`);
    }
    return result;
}

export { directoryWalker, findTestFiles }
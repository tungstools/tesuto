import fs from "fs";
import path from "path";
import { fmt1$, verbose } from "./cli.output";
import { __DEFAULT_IS_TEST_FILES } from "./constants";

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
    if ("isTestFile" in globalThis.config && typeof globalThis.config.isTestFile === "function") {
        return globalThis.config.isTestFile(file);
    } else if ("testFileExtensions" in globalThis.config && globalThis.config.testFileExtensions instanceof Array) {
        return globalThis.config.testFileExtensions.some((ext) => file.endsWith(ext));
    } else {
        return __DEFAULT_IS_TEST_FILES(file);
    }
}

function findTestFiles() {
    let result: string[] = [];

    const onFile = (file: string) => {
        if (isTestFile(path.basename(file))) {
            result.push(file);
        }
    }

    const onFolder = (folder: string) => {
        if ("ignoredFolders" in globalThis.config
            && globalThis.config.ignoredFolders instanceof Array
            && globalThis.config.ignoredFolders.includes(path.basename(folder))) {
            return false;
        }
        return true;
    }

    directoryWalker(".", onFile, onFolder);

    if (result.length == 0) {
        verbose(`No test files found.`);
    } else {
        verbose(`Found ${fmt1$(result.length.toString())} test files. Pending to run...`);
    }
    return result;
}

export { directoryWalker, findTestFiles }
import fs from "fs";
import path from "path";
import { __DEFAULT_IGNORED_FOLDERS, __DEFAULT_TEST_FILE_EXTENSIONS } from "./constants";

function directoryWalker(root: string = ".", onFile: (file: string) => void = () => { }, onFolder: (folder: string) => /* skipWalkingOrNot: */ boolean = () => true, currentPath?: string) {
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

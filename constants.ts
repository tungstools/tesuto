
export const __DEFAULT_CONFIG_FILE = ["tesuto.config.ts", "tesuto.config.js"];

const __DEFAULT_TEST_FILE_EXTENSIONS = [".test.ts", ".test.js", ".spec.ts", ".spec.js"];
const __DEFAULT_IGNORED_FOLDERS = ["node_modules", ".git", ".vscode", "dist", "build", "coverage"];

const __TEMP_FOLDER = ".tesuto";

export const __DEFAULT_CONFIG: TesutoConfig = {
    testFileExtensions: __DEFAULT_TEST_FILE_EXTENSIONS,
    ignoredFolders: __DEFAULT_IGNORED_FOLDERS,
    // tempFolder: __DEFAULT_TEMP_FOLDER        // this shouldn't be configurable 
}

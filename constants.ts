
export const __DEFAULT_CONFIG_FILE = ["tesuto.config.ts", "tesuto.config.js"];

const __DEFAULT_TEST_FILE_EXTENSIONS = [".test.ts", ".test.js", ".spec.ts", ".spec.js"];
const __DEFAULT_IGNORED_FOLDERS = ["node_modules", ".git", ".vscode", "dist", "build", "coverage", ".tesuto"];

export const __DEFAULT_IS_TEST_FILES = (filename: string) => {
    return __DEFAULT_TEST_FILE_EXTENSIONS.some(ext => filename.endsWith(ext));
}

export const CACHE_FOLDER = ".tesuto";
export const CACHE_MAP_FILE = `${CACHE_FOLDER}/cache.map.json`;

export const __DEFAULT_CONFIG: TesutoConfig = {
    testFileExtensions: __DEFAULT_TEST_FILE_EXTENSIONS,
    ignoredFolders: __DEFAULT_IGNORED_FOLDERS
}

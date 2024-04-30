
type TesutoConfig = {
    /** The file extensions that Tesuto should consider as test files. */
    testFileExtensions?: string[];
    /** A function that returns whether a file is a test file. If this function is specified, `testFileExtensions` will be ignored. */
    isTestFile?: (file: string) => boolean;
    /** The folders that Tesuto should ignore when searching for test files. */
    ignoredFolders?: string[];
    /** A function that returns whether a folder should be included in the search for test files. If this function is specified,
     *  `ignoredFolders` will be ignored. */
    isWorkspaceFolder?: (folder: string) => boolean;
    /** A object of two functions, to let Tesuto (and VSCode extension) know how to pair test files with source files. */
    pairingFunction?: {
        srcToTest: (str: string) => string;
        testToSrc: (str: string) => string;
    }
}

declare function defineTesutoConfig(config: TesutoConfig): TesutoConfig;
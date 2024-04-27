
type TesutoConfig = {
    /** The folder that store the test files. You can either provide an array of routes, or a function that directly returns
     *  whether a folder shall be included or not.
     */
    workspaces?: {
        include?: string[],
        exclude?: string[],
    } | ((currentRoute: string) => boolean);
    /** The entry files of the test suite. You can either provide a object with the test files to include and exclude, 
     * or a function that directly returns the test files. The applies after the workspaces are resolved.
     */
    testFiles?: {
        include?: string[],
        exclude?: string[],
    } | ((currentRoute: string) => boolean);
    /** A object of two functions, to let Tesuto know how to pair test files with source files. */
    pairingFunction?: {
        srcToTest: (str: string) => string;
        testToSrc: (str: string) => string;
    },
    /** The temporary folder to store the bundled files, snapshots, etc. */
    tempFolder?: string
}

declare function defineTesutoConfig(config: TesutoConfig): TesutoConfig;
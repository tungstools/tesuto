
declare global {
    var cmdConfig: {
        verboseMode: boolean;
        root: string;
        bail: number;
        only: boolean;
    }
    var config: TesutoConfig;
    var absRoot: string;
    var testFileExtensions: string[];
}

export {}
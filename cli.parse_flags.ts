import { error } from "./cli.output";

let __REGISTERED_FLAGS = new Map();

// TODO(tl): add advanced command line features.
type FlagOptions = {
    standalone?: boolean,
    mustBeWith?: string,
}

function registerFlag<T extends "boolean" | "string" | "float" | "integer",
    U = T extends "boolean" ? boolean : T extends "string" ? string : number>(flagname: string, type: T, handler: (arg: U) => void, options?: FlagOptions) {
    __REGISTERED_FLAGS.set(flagname, { type, handler, options });
}

function parseCommandLineValue(value: string, type: "boolean" | "string" | "float" | "integer" = "string") {
    let parsedValue;
    switch (type) {
        case "boolean":
            parsedValue = value === "" ? true : value === "true";
            break;
        case "integer": 
            parsedValue = parseInt(value);
            break;
        case "float":
            parsedValue = parseFloat(value);
            break;
        case "string":
        default:
            parsedValue = value;
            break;
    }
    return parsedValue;
}

function parseCommandLine(args: string[]) {
    const flagParser = /--([\w-]+)=*(.*)/gm;
    let files: string[] = [];

    args.forEach(arg => {
        const matches = flagParser.exec(arg);
        if (matches) {
            const [, flagname, value] = matches;
            const registeredFlag = __REGISTERED_FLAGS.get(flagname);
            if (registeredFlag) {
                let parsedValue = parseCommandLineValue(value, registeredFlag.type);
                registeredFlag.handler(parsedValue);
            } else {
                error(`Unregistered flag: ${flagname}`);
            }
        } else {
            files.push(arg);
        }
        flagParser.lastIndex = 0;
    });

    return files;
}

export { registerFlag, parseCommandLine };
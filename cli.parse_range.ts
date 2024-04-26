
function parseCommandLineRange(rangeParams: string) {
    let result;
    try {
        result = flattenCommandLineRangeInput(parseCommandLineRangeObject(expand2(expand(removeWhitespace(rangeParams)))));
    } catch (e) {
        throw new Error("Invalid parameters.");
    }
    return result;
}

function removeWhitespace(toBeRemoved: string) {
    return toBeRemoved.replace(/\s/g, "");
}

// {1-4} => {1,2,3,4}
function expand(orig: string) {
    if (!orig.includes("-")) return orig;

    const pattern = /(\d*-\d*)/gm;

    return orig.replace(pattern, (match) => {
        const [start, end] = match.split("-").map(Number);
        return Array(end - start + 1).fill(0).map((_, i) => i + start).join(",");
    });
}

// {1:{2},3} => {"1": {"2": null}, "3": null}
function expand2(orig: string) {
    const matcher1 = /(\d+),/gm;    // {1, => {"1":null,
    const matcher2 = /(\d+)}/gm;    // 3} => "3":null}
    const matcher3 = /(\d+):{/gm;   // 1:{ => "1":{

    return orig.replace(matcher1, `"$1":null,`).replace(matcher2, `"$1":null}`).replace(matcher3, `"$1":{`);
}

type ParsedCommandLineObject = {
    [key: number]: ParsedCommandLineObject | null;
}

function isParsed(obj: any): obj is ParsedCommandLineObject {
    return typeof obj === "object" && obj !== null && Object.keys(obj).every(k => !isNaN(Number(k)));
}

function parseCommandLineRangeObject(orig: string) {
    return JSON.parse(orig) as ParsedCommandLineObject;
}

// {1: {2: null}, 3: null} => [[1, 2], [3]]
function flattenCommandLineRangeInput(parsed: ParsedCommandLineObject | null): number[][] {
    let result: number[][] = [];
    if (parsed === null) return result;
    const keys = Object.keys(parsed).map(Number);
    for (const key of keys) {
        const value = parsed[key];
        if (isParsed(value)) {
            const subResult = flattenCommandLineRangeInput(value);
            for (const sub of subResult) {
                result.push([key, ...sub]);
            }
        } else {
            result.push([key]);
        }
    }
    return result;
}

export { parseCommandLineRange };
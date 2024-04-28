
import fs from "node:fs";

// UPDATE: no longer store column and line number in label. If needed by source-map it can be recalculated from the offset.
type TestBlock = {
    label: string,
    start: number,
    end: number,
    innerStart: number,
    innerEnd: number
}

type UnblockedCode = {
    start: number,
    end: number
}

type TestSourceCode = {
    file: string,
    blocks: (TestBlock | UnblockedCode)[]
}

// Test blocks are top-level labels followed by a colon, and then a block of code. Rather than parsing the code, we just extract the block - 
// which means we basically just looking for paired braces, ignoring those inside strings or regexes or comments. When bundling, we will just 
// use the drop labels feature of esbuild (https://esbuild.github.io/api/#drop-labels) to remove everything we don't need.
function retriveTestBlocks(file: string) {
    const fileContent = fs.readFileSync(file, "utf-8");
    const blocks = getBlocks(fileContent);
    return blocks;
}

function getIdentifierBehind(str: string, index: number): [identifier: string, identifierPos: number] | false {
    let identifier = "";

    const enum Status {
        BeforeColon,
        BeforeIdentifier,
        Identifier
    }

    let status: Status = Status.BeforeColon;

    for (let i = index; i >= 0; i--) {
        const char = str[i];
        switch (status) {
            case Status.BeforeColon: {
                if (char === " ") {
                    continue;
                } else if (char === ":") {
                    status = Status.BeforeIdentifier;
                    continue;
                } else {
                    return false;
                }
            }
            case Status.BeforeIdentifier: {
                if (char === " ") {
                    continue;
                } else {
                    status = Status.Identifier;
                    identifier += char;
                }
                break;
            }
            case Status.Identifier: {
                if (char.match(/[a-zA-Z0-9_\$]/)) {
                    identifier += char;
                } else {
                    return [identifier.split("").reverse().join(""), i];
                }
                break;
            }
        }
    }

    return identifier.length > 0 ? [identifier, index] : false;
}

function getBlocks(str: string) {
    const enum CursorStatus {
        Else = " ",
        InsideBlockComment = "b",
        InsideLineComment = "l",
        InsideDoubleQuotedString = "d",
        InsideSingleQuotedString = "s",
        InsideTemplateString = "t",
        InsideRegex = "r"
    }

    type CursorContext = {
        lookAhead: (n?: number) => string | null,
        lookBehind: (n?: number) => string | null
    }

    let i = 0;
    let status: any = CursorStatus.Else;
    let currentLevel = 0;
    let lastLevel = 0;

    let startOffsets: { label: [identifier: string, identifierPos: number] | false, offset: number }[] = [];
    let endOffsets: number[] = [];

    const statusMap = {
        [CursorStatus.Else](char: string, ctx: CursorContext) {
            const { lookAhead, lookBehind } = ctx;
            switch (char) {
                case "/": {
                    if (lookAhead() === "/") {
                        return CursorStatus.InsideLineComment;
                    } else if (lookAhead() === "*") {
                        return CursorStatus.InsideBlockComment;
                    } else if (lookBehind() !== "*") {
                        return CursorStatus.InsideRegex;
                    } else {
                        return CursorStatus.Else;
                    }
                };
                case "'": {
                    return CursorStatus.InsideSingleQuotedString;
                }
                case '"': {
                    return CursorStatus.InsideDoubleQuotedString;
                }
                case "`": {
                    return CursorStatus.InsideTemplateString;
                };
                default: {
                    if (char === "{") { currentLevel++; }
                    if (char === "}") { currentLevel--; }
                    return CursorStatus.Else;
                }
            }
        },
        [CursorStatus.InsideBlockComment](char: string, ctx: CursorContext) {
            if (char === "*" && ctx.lookAhead() === "/") {
                return CursorStatus.Else;
            } else {
                return CursorStatus.InsideBlockComment;
            }
        },
        [CursorStatus.InsideLineComment](char: string) {
            if (char === "\n") {
                return CursorStatus.Else;
            } else {
                return CursorStatus.InsideLineComment;
            }
        },
        [CursorStatus.InsideDoubleQuotedString](char: string, ctx: CursorContext) {
            if (char === '"' && ctx.lookBehind() !== "\\") {
                return CursorStatus.Else;
            } else {
                return CursorStatus.InsideDoubleQuotedString;
            }
        },
        [CursorStatus.InsideSingleQuotedString](char: string, ctx: CursorContext) {
            if (char === "'" && ctx.lookBehind() !== "\\") {
                return CursorStatus.Else;
            } else {
                return CursorStatus.InsideSingleQuotedString;
            }
        },
        [CursorStatus.InsideTemplateString](char: string, ctx: CursorContext) {
            if (char === "`" && ctx.lookBehind() !== "\\") {
                return CursorStatus.Else;
            } else {
                return CursorStatus.InsideTemplateString;
            }
        },
        [CursorStatus.InsideRegex](char: string, ctx: CursorContext) {
            if (char === "/" && ctx.lookBehind() !== "\\") {
                // NOTE(tl): we don't even cares about the regex flags, since it won't affect the parsing
                return CursorStatus.Else;
            } else {
                return CursorStatus.InsideRegex;
            }
        }
    }

    function newState(status: CursorStatus, char: string, ctx: CursorContext, map: Record<string, (char: string, ctx: CursorContext) => CursorStatus>) {
        return map[status](char, ctx);
    }

    const lookAhead = (n?: number) => { n ??= 1; if (i + n >= str.length) { return null; } else { return str[i + n] } };
    const lookBehind = (n?: number) => { n ??= 1; if (i - n < 0) { return null; } else { return str[i - n] } };
    const cctx: CursorContext = { lookAhead, lookBehind };

    // TODO: 1. refactor this loop to a reduce function based on generators, localize currentLevel and lastLevel using reducer
    //       2. make a general purpose state machine library without sacrificing (too much) performance
    // NOTE(tl): won't do it now since it will not increase performance

    while (i < str.length) {
        const char = str[i];

        status = newState(status, char, cctx, statusMap);

        if (lastLevel == 0 && currentLevel == 1) {
            let label = getIdentifierBehind(str, i - 1);
            startOffsets.push({ label: label, offset: i });
        }

        if (lastLevel == 1 && currentLevel == 0) {
            endOffsets.push(i + 1);
        }

        lastLevel = currentLevel;
        i++;
    }

    let result: TestBlock[] = [];

    for (let index = 0; index < startOffsets.length; index++) {
        const label = startOffsets[index].label;
        if (!label) {
            continue;
        } else {
            result.push({
                label: label[0],
                start: label[1] + 1,
                end: endOffsets[index],
                innerStart: startOffsets[index].offset + 1,
                innerEnd: endOffsets[index] - 1,
            });
        }
    }

    return result;
}

function getUnblockedCode(src: string, blocks: TestBlock[]) {
    let result: (TestBlock | UnblockedCode)[] = [];
    let lastEnd = 0;

    blocks.forEach((block) => {
        result.push({ start: lastEnd, end: block.start });
        result.push(block);
        lastEnd = block.end;
    });

    result.push({ start: lastEnd, end: src.length });

    return result;
}

export { retriveTestBlocks };

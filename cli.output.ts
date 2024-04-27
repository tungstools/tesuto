// -- Formatted output --

const __HAS_COLOR__ = process.stdout.hasColors();

const __TEXT_COLOR_MAP__ = {
    black: 30,
    red: 31,
    green: 32,
    yellow: 33,
    blue: 34,
    magenta: 35,
    cyan: 36,
    white: 37,
    gray: 90
};

const __BACKGROUND_COLOR_MAP__ = {
    black: 40,
    red: 41,
    green: 42,
    yellow: 43,
    blue: 44,
    magenta: 45,
    cyan: 46,
    white: 47
};

const __TEXT_STYLE_MAP__ = {
    normal: 22,
    bold: 1,
    italic: 3,
    underline: 4,
    blink: 5,
    rapidBlink: 6,
    rapidblink: 6,  // for compatibility
    inverse: 7,
    hidden: 8
};

const __RESET__ = "\x1b[0m";

function ansiFormat(text: string, color: keyof typeof __TEXT_COLOR_MAP__, background: keyof typeof __BACKGROUND_COLOR_MAP__, style: keyof typeof __TEXT_STYLE_MAP__) {
    if (!__HAS_COLOR__) return text;
    return `\x1b[${__TEXT_COLOR_MAP__[color]};${__BACKGROUND_COLOR_MAP__[background]};${__TEXT_STYLE_MAP__[style]}m${text}${__RESET__}`;
}

function log(text: string, color?: keyof typeof __TEXT_COLOR_MAP__, background?: keyof typeof __BACKGROUND_COLOR_MAP__, style?: keyof typeof __TEXT_STYLE_MAP__) {
    console.log(ansiFormat(text, color ?? "white", background ?? "black", style ?? "normal"));
}

function error(text: string, color?: keyof typeof __TEXT_COLOR_MAP__, background?: keyof typeof __BACKGROUND_COLOR_MAP__, style?: keyof typeof __TEXT_STYLE_MAP__) {
    console.error(ansiFormat(text, color ?? "red", background ?? "black", style ?? "normal"));
}

// - Progress bar -

let __currentProgressBarInstances: ProgressBar[] = [];

type ProgressBar = {
    progress: number,
    message: string,
    start: () => void,
    stop: () => void,
    finish: () => void,
    setProgress: (progress: number) => void,
    log: (message: string) => void,
}

function createProgressBar() {
    let bar: ProgressBar = {
        progress: 0,
        message: "",
        start: () => {
            __currentProgressBarInstances.push(bar);
        },
        stop: () => {
            __currentProgressBarInstances = __currentProgressBarInstances.filter(b => b !== bar);
            process.stdout.write("\n");
        },
        finish: () => {
            bar.setProgress(1);
            bar.stop();
        },
        setProgress: (progress: number) => {
            bar.progress = progress;
            rerender();
        },
        log: (message: string) => {
            bar.message = message;
            rerender();
        }
    };
    return bar;
}

export function rerender() {
    __currentProgressBarInstances.forEach(renderProgressBar);
    process.stdout.moveCursor(0, -__currentProgressBarInstances.length);
}

function renderProgressBar(bar: ProgressBar) {
    function inverse(str: string) {
        return `\x1b[7m${str}\x1b[0m`;
    }

    const width = process.stdout.columns;
    const num = bar.progress > 1 ? 1 : bar.progress;
    const progress = Math.floor(num * width);
    const message = ` ${bar.message} ${(num * 100).toFixed(1)} %`;
    const messageInversed = inverse(message.slice(0, progress).padEnd(progress - 1, " "));
    const messageRemaining = message.slice(progress);
    process.stdout.write(`\r${messageInversed}${messageRemaining}\n`);
}

function leaveProgressBarArea() {
    __currentProgressBarInstances.forEach(() => process.stdout.write("\n"));
}

// - Verbose Mode -

function verbose(text: string, color?: keyof typeof __TEXT_COLOR_MAP__, background?: keyof typeof __BACKGROUND_COLOR_MAP__, style?: keyof typeof __TEXT_STYLE_MAP__) {
    if (process.env.VERBOSE || (globalThis.cmdConfig.verboseMode)) {
        log("[VERBOSE] " + text, color ?? "gray", background, style);
    }
}

function fmt1$(text: string) {
    return ansiFormat(text, "cyan", "black", "normal");
}

function fmt2$(text: string) {
    return ansiFormat(text, "red", "black", "normal");
}

export { ansiFormat, log, error, createProgressBar, leaveProgressBarArea, verbose, fmt1$, fmt2$ };
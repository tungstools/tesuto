
type Test = { desc: string, testFn: () => any };
type TestGroup = { desc: string, tests: (Test | TestGroup)[] };

var currentTests: (Test | TestGroup)[] = []
var currentTestsStack: (typeof currentTests)[] = []

function describe(desc: string, testFn: () => any) {
    currentTestsStack.push(currentTests);
    currentTests = [];
    testFn();
    const tests = currentTests;
    currentTests = currentTestsStack.pop()!;
    currentTests.push({ desc, tests });
}

function test(testContentFunction: () => any): void;
function test(description: string, testContentFunction: () => any): void;
function test(arg1: string | (() => any), arg2?: () => any) {
    let desc: string;
    let testFn: () => any;
    if (typeof arg1 === "string") {
        desc = arg1;
        testFn = arg2!;
    } else {
        desc = "!unnamed_test"
        testFn = arg1;
    }
    currentTests.push({ desc, testFn });
}

function collectTests() {
    return currentTests;
}

function clearTests() {
    currentTests = [];
}

const it = test;

export { describe, test, it, collectTests, clearTests };
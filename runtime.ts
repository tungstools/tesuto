
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

function test(desc: string, testFn: () => any) {
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
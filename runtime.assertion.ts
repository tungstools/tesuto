
class TesutoAssertionMismatch {
    public expected: any;
    public actual: any;
    constructor(expected: any, actual: any) {
        this.expected = expected;
        this.actual = actual;
    }
}

namespace Matcher {
    export function toBe<T>(expected: T, actual: T) {
        if(expected == actual) {
            return;
        } else {
            throw new TesutoAssertionMismatch(expected, actual);
        }
    }

    export function toBeTruthy(actual: any) {
        if(actual) {
            return;
        } else {
            throw new TesutoAssertionMismatch(true, actual);
        }
    }
}

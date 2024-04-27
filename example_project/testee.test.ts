
import { add } from './testee';

add: {
    test('add', () => {
        expect(add(1, 2)).toBe(3);
    });
}

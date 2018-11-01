const shouldShow = require('../tFunc');

test('fake test',() => {
    expect(shouldShow([1,2,3,4],[1,4])).toBeTruthy();
})

test('fake test',() => {
    expect(shouldShow([1,2,3,4],[1,4,5])).toBe(false);
})

test('fake test',() => {
    expect(shouldShow([1,4],[1,4])).toBe(true);
})
import { assert } from './assert';
export { slice };
function slice(thing, from, to) {
    if (typeof thing === 'string') {
        return sliceArray(thing.split(''), from, to).join('');
    }
    else {
        return sliceArray(thing, from, to);
    }
}
function sliceArray(list, from, to) {
    const listSlice = [];
    let start = from >= 0 ? from : list.length + from;
    assert(start >= 0 && start <= list.length);
    let end = to >= 0 ? to : list.length + to;
    assert(end >= 0 && end <= list.length);
    while (true) {
        if (start === end) {
            break;
        }
        if (start === list.length) {
            start = 0;
        }
        if (start === end) {
            break;
        }
        const el = list[start];
        assert(el !== undefined);
        listSlice.push(el);
        start++;
    }
    return listSlice;
}
//# sourceMappingURL=slice.js.map
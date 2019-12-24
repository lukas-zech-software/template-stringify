"use strict";
module.exports = function isCyclic(obj) {
    const keys = [];
    const stack = [];
    const stackSet = new Set();
    let detected = false;
    function detect(obj, key) {
        if (obj && typeof obj != 'object') {
            return;
        }
        if (stackSet.has(obj)) { // it's cyclic! Print the object and its locations.
            const oldindex = stack.indexOf(obj);
            detected = true;
            return;
        }
        keys.push(key);
        stack.push(obj);
        stackSet.add(obj);
        for (const k in obj) { //dive on the object's children
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
                detect(obj[k], k);
            }
        }
        keys.pop();
        stack.pop();
        stackSet.delete(obj);
        return;
    }
    detect(obj, 'obj');
    return detected;
};
//# sourceMappingURL=isCyclic.js.map
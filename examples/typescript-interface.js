"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TsInferfaceParser_1 = require("../src/TsInferfaceParser");
const JsonTemplate_1 = require("../src/JsonTemplate");
const isEqual = require("lodash.isequal");
const { inspect } = require('util');
const parser = new TsInferfaceParser_1.TsInferfaceParser('./interface.ts');
const interfaceInput = parser.create();
console.log('!!!!', inspect(interfaceInput, { showHidden: false, depth: null }));
;
console.log('!!!!');
const testData = {
    a: 123,
    b: {
        bb1: false,
        bb2: 'foobar'
    },
    c: [1, 2, 3],
    c2: [
        { cc2: 'bla' },
        { cc2: 'blub' },
        { cc2: 'blob' },
    ],
    d: [
        { dd1: 'hello void' },
        { dd2: true },
    ],
    e: {
        ee1: [
            { eee1: 42 },
        ],
        ee2: {
            eee2: [
                { eeee2: 1 },
                { eeee2: 2 },
                { eeee2: 3 },
            ]
        }
    },
};
const a = {
    a: 0,
    b: { bb1: true, bb2: 'foo' },
    c: [0],
    c2: [{ cc2: 'foo' }],
    d: [{ dd1: 'foo' }, { dd2: true }],
    e: { ee1: [{ eee1: 0 }], ee2: { eee2: [{ eeee2: 0 }] } }
};
const template = new JsonTemplate_1.JsonTemplate();
template.build(a);
let stringify = template.stringify(testData);
//let stringify2 = JSON.stringify(interfaceInput);
console.log('template.stringify(a);', stringify, stringify.length, Buffer.from(stringify).byteLength);
//console.log('JSON.stringify(a)', stringify2, stringify2.length, Buffer.from(stringify2).byteLength);
console.log('template(a).parse', inspect(template.parse(stringify), { compact: false, depth: null, breakLength: 80 }));
console.log('isEqual', isEqual(testData, template.parse(stringify)));
//# sourceMappingURL=typescript-interface.js.map
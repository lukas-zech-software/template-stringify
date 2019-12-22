import { TestInterface } from './interface';
import { TsInferfaceParser } from '../src/TsInferfaceParser';
import { JsonTemplate } from '../src/JsonTemplate';
import * as isEqual from 'lodash.isequal'

const {inspect} = require('util');

const parser = new TsInferfaceParser<TestInterface>('./interface.ts');
const interfaceInput = parser.create();

const testData: TestInterface = {
    a: 123,
    b: {
        bb1: false,
        bb2: 'foobar'
    },
    c: [1, 2, 3],
    c2: [
        {cc2: 'bla'},
        {cc2: 'blub'},
        {cc2: 'blob'},
    ],
    d: [
        {dd1: 'hello void'},
        {dd2: true},
    ],
    e: {
        ee1: [
            {eee1: 42},
        ],
        ee2: {
            eee2: [
                {eeee2: 1},
                {eeee2: 2},
                {eeee2: 3},
            ]
        }
    },
};


const template = new JsonTemplate<TestInterface>();
template.build(interfaceInput);
let stringify = template.stringify(testData);
//let stringify2 = JSON.stringify(interfaceInput);

console.log('template.stringify(a);', stringify, stringify.length, Buffer.from(stringify).byteLength);
//console.log('JSON.stringify(a)', stringify2, stringify2.length, Buffer.from(stringify2).byteLength);

console.log('template(a).parse', inspect(template.parse(stringify), {compact: false, depth: null, breakLength: 80}));


console.log('isEqual', isEqual(testData, template.parse(stringify)));

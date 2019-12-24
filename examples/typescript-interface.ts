import { TestInterface } from './interface';
import { TsInferfaceParser } from '../src/TsInferfaceParser';
import { JsonTemplate } from '../src/JsonTemplate';
import { isEqual } from 'lodash'
import { testActualData } from '../spec/testData';

const {resolve} = require('path');
const {inspect} = require('util');

const parser = new TsInferfaceParser<TestInterface>(resolve(__dirname, '../../examples/interface.ts'));
const interfaceInput = parser.create();

const template = new JsonTemplate<TestInterface>(interfaceInput);
let stringify = template.stringify(testActualData);
//let stringify2 = JSON.stringify(interfaceInput);

console.log('template.stringify(a);', stringify, stringify.length, Buffer.from(stringify).byteLength);
//console.log('JSON.stringify(a)', stringify2, stringify2.length, Buffer.from(stringify2).byteLength);

console.log('template(a).parse', inspect(template.parse(stringify), {compact: false, depth: null, breakLength: 80}));


console.log('isEqual', isEqual(testActualData, template.parse(stringify)));

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TsInferfaceParser_1 = require("../src/TsInferfaceParser");
const JsonTemplate_1 = require("../src/JsonTemplate");
const lodash_1 = require("lodash");
const testData_1 = require("../spec/testData");
const { resolve } = require('path');
const { inspect } = require('util');
const parser = new TsInferfaceParser_1.TsInferfaceParser(resolve(__dirname, '../../examples/interface.ts'));
const interfaceInput = parser.create();
const template = new JsonTemplate_1.JsonTemplate(interfaceInput);
let stringify = template.stringify(testData_1.testActualData);
//let stringify2 = JSON.stringify(interfaceInput);
console.log('template.stringify(a);', stringify, stringify.length, Buffer.from(stringify).byteLength);
//console.log('JSON.stringify(a)', stringify2, stringify2.length, Buffer.from(stringify2).byteLength);
console.log('template(a).parse', inspect(template.parse(stringify), { compact: false, depth: null, breakLength: 80 }));
console.log('isEqual', lodash_1.isEqual(testData_1.testActualData, template.parse(stringify)));
//# sourceMappingURL=typescript-interface.js.map
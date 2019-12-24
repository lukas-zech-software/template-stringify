import { inspect } from 'util';
import { JsonTemplate } from '../src/JsonTemplate';
import { isEqual } from 'lodash';
import { testActualData, testTemplateData } from '../spec/testData';

const template = new JsonTemplate(testTemplateData);

let stringify = template.stringify(testActualData);

console.log('template.getTemplate()', template.getTemplate());
//console.log('stringify', stringify);
//let stringify2 = JSON.stringify(a);

//console.log('template.stringify(a);', stringify, stringify.length, Buffer.from(stringify).byteLength);
//console.log('JSON.stringify(a)', stringify2, stringify2.length, Buffer.from(stringify2).byteLength);

console.log('template(a).parse', inspect(template.parse(stringify), {compact: false, depth: null, breakLength: 80}));

console.log('isEqual', isEqual(testActualData, template.parse(stringify)));

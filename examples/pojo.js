const {inspect} = require('util');
const {JsonTemplate} = require('../src/JsonTemplate');
const isEqual = require('lodash.isequal');

const testData = {
  a: 0,
  aa: 'aa',
  b: {
    bb1: false,
    bb2: 'mmm',
    bb3: {
      bbb1: null,
      bbb2: ' '
    }
  },
  c: [100, 200, 300],
  c2: [
    {
      array1: [1],
      cc2: 'bla',
      cc3: 1,
      cc4: true,

       ooo: {ooo9: 'bla', ooo1: 1, ooo2: true, xxx: {yyy: 1, ggg: [{hhh: 'hhh'}]}}

    },
  ],
  d: [
    {dd1: 'xx', dd2: null},
    {dd2: true, dd1: null},
  ],
  e: {
    ee1: [
      {eee1: 13333337},
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

const a = {
  a: 1986,
  aa: 'string1',
  b: {
    bb1: true, bb2: 'foo',
    bb3: {
      bbb1: true,
      bbb2: 'deep1'
    }
  },
  c: [123, 679, 345],
  c2: [
    {
      cc2: 'foo', cc3: 12, cc4: true,
      array1: [1, 2, 3],

      ooo: {ooo9: 'fooXXX', ooo1: 1212, ooo2: true, xxx: {yyy: 10000, ggg: [{hhh: 'deep1'}, {hhh: 'deep2'}]}}

    },
    {
      cc2: 'bar', cc3: 13, cc4: false,
      array1: [4, 5, 6],

      ooo: {ooo9: 'barCCC', ooo1: 1313, ooo2: null, xxx: {yyy: 20000, ggg: [{hhh: 'deep3'}]}}

    },
    {
      cc2: 'xxx', cc3: 41, cc4: null,
      array1: [7, 8, 9],

      ooo: {
        ooo9: 'xxxYYY',
        ooo1: 4141,
        ooo2: false,
        xxx: {yyy: 30000, ggg: [{hhh: 'deep5'}, {hhh: 'deep6'}, {hhh: 'deep7'}]}
      }

    }
  ],
  d: [
    {dd1: 'hello void / real deal', dd2: null},
    {dd1: '', dd2: true},
  ],
  e: {
    ee1: [
      {eee1: 424242},
      {eee1: 565656},
    ],
    ee2: {
      eee2: [
        {eeee2: 111},
        {eeee2: 222},
        {eeee2: 333},
      ]
    }
  },
};

const template = new JsonTemplate();
template.build(testData);

let stringify = template.stringify(a);

console.log('template.getTemplate()', template.getTemplate());
//console.log('stringify', stringify);
//let stringify2 = JSON.stringify(a);

//console.log('template.stringify(a);', stringify, stringify.length, Buffer.from(stringify).byteLength);
//console.log('JSON.stringify(a)', stringify2, stringify2.length, Buffer.from(stringify2).byteLength);

console.log('template(a).parse', inspect(template.parse(stringify), {compact: false, depth: null, breakLength: 80}));

console.log('isEqual', isEqual(a, template.parse(stringify)));

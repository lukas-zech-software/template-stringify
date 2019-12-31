![](https://github.com/lukas-zech-software/template-stringify/workflows/Build/badge.svg)

# template-stringify v0.0.1-alpha

An new approach to an old problem. Serialization of JS objects

```bash
Example benchmark on MacBook Pro (15-inch, 2017) 3,1 GHz Intel Core i7
imple object
utils.inspect     x 334,038 ops/sec ±1.29% (88 runs sampled)
JSON.stringify    x 1,083,229 ops/sec ±0.73% (95 runs sampled)
fastSafeStringify x 884,582 ops/sec ±0.79% (93 runs sampled)
jsonStrify        x 80,779,773 ops/sec ±0.54% (95 runs sampled)
templateStringify x 2,991,049 ops/sec ±0.87% (96 runs sampled)
Fastest for "Simple object" is jsonStrify
Complex object
utils.inspect     x 33,721 ops/sec ±1.08% (94 runs sampled)
JSON.stringify    x 164,144 ops/sec ±0.65% (93 runs sampled)
fastSafeStringify x 129,162 ops/sec ±0.63% (93 runs sampled)
jsonStrify        x 80,082,387 ops/sec ±0.53% (93 runs sampled)
templateStringify x 4,064,185 ops/sec ±0.69% (95 runs sampled)
Fastest for "Complex object" is jsonStrify
Object array
utils.inspect     x 10,904 ops/sec ±1.17% (94 runs sampled)
JSON.stringify    x 56,599 ops/sec ±0.57% (92 runs sampled)
fastSafeStringify x 44,526 ops/sec ±0.63% (92 runs sampled)
jsonStrify        x 79,260,752 ops/sec ±0.58% (91 runs sampled)
templateStringify x 98,046,601 ops/sec ±0.51% (92 runs sampled)
Fastest for "Object array" is templateStringify

Deep object
utils.inspect     x 17,558 ops/sec ±0.65% (96 runs sampled)
JSON.stringify    x 63,036 ops/sec ±0.68% (93 runs sampled)
fastSafeStringify x 50,384 ops/sec ±0.64% (92 runs sampled)
templateStringify x 390,228 ops/sec ±0.75% (93 runs sampled)
Fastest for "Deep object" is templateStringify
```

Run `npm run benchmarks` for details

## Installation

```shell
$ npm install --save lukas-zech-software/template-stringify
# No npm package yet. Will be released one it leaves alpha stage
```

## Usage

You need to construct a new instance of `JsonTemplate` and pass in an object that looks exactly like
the objects you want to stringify with this template, this is called the `TemplateObject`. One `JsonTemplate` can handle only one object type!
You will need to construct one template for each type you want to handle.

This is best used e.g. on REST routes where one API endpoint always serves objects of the same type

*NOTE: All arrays may contain only one type of elements, different objects or types within one array may lead to problems*
*NOTE: If your objects has optional properties, make sure the `TemplateObject` contains all possible properties*

### TypeScript Interface as `TemplateObject`
It is possible to use a TS interface instead of some test object with actual data.
Currently it supports only one interface per file and no type reference from other files.

Usage example:

```typescript
// interface.ts
export interface TestInterface {
    a: number,
    aa: string;
    b: {
        bb1: boolean
        bb2: string
        bb3: {
            bbb1: boolean,
            bbb2: string
        }
    },
}
```

```js
// TS interface as template
const parser = new TsInferfaceParser<TestInterface>('./interface.ts');
const interfaceInput = parser.create();

const testData:TestInterface = {
    a: 123,
    aa: 'foo',
    b: {
        bb1: true,
        bb2: 'bar',
        bb3: {
            bbb1: false,
            bbb2: 'boo'
        }
    },
};

const template = new JsonTemplate<TestInterface>(interfaceInput);
const stringify = template.stringify(testActualData);
expect(JSON.parse(JSON.stringify(testActualData))).toEqual(template.parse(stringify))



// Plain JS object as template
const testTemplateDataData = {
  //  .. 
  //  some example data
  // The `TemplateObject` should contain all properties, that could be contained
  // in the object that will be serialized through this template 
};

const realData = {
  //  object of the same type as the `TemplateObject` but with real data
};

const template = new JsonTemplate(testTemplateDataData);

const stringify = template.stringify(realData);

expect(JSON.parse(JSON.stringify(realData))).toEqual(template.parse(stringify))
```

## Tests

```shell
$ npm run build
$ npm run benchmark
$ npm run test
```

## Know issues:
* TsInterfaceParser: does not support type references (using another interface/type for a property)
* TsInterfaceParser: [Advanced Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html) are not supported
* TsInterfaceParser: `Array<number>` syntax, use `number[]` instead. `any` use `{}` instead




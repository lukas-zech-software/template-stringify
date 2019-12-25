![](https://github.com/lukas-zech-software/template-stringify/workflows/Build/badge.svg)

# template-stringify v0.0.1-alpha

An new approach to an old problem. Serialization of JS objects

This library is faster than other libraries
* up to 110x times faster than [utils.inspect](https://nodejs.org/api/util.html#util_util_inspect_object_options)
* up to 30x times faster than [fast-safe-stringify](https://www.npmjs.com/package/fast-safe-stringify)

```bash
Example benchmark on MacBook Pro (15-inch, 2017) 3,1 GHz Intel Core i7
Simple object
utils.inspect x     291,783 ops/sec ±3.19% (79 runs sampled)
JSON.stringify x    828,393 ops/sec ±10.54% (73 runs sampled)
fastSafeStringify x 687,957 ops/sec ±8.17% (75 runs sampled)
templateStringify x 2,782,517 ops/sec ±1.83% (89 runs sampled)
Fastest for "Simple object" is templateStringify

Complex object
utils.inspect x     32,397 ops/sec ±0.51% (93 runs sampled)
JSON.stringify x    161,784 ops/sec ±0.73% (93 runs sampled)
fastSafeStringify x 127,159 ops/sec ±1.15% (94 runs sampled)
templateStringify x 3,845,886 ops/sec ±1.43% (92 runs sampled)
Fastest for "Complex object" is templateStringify

Object array
utils.inspect x     95,573 ops/sec ±0.49% (86 runs sampled)
JSON.stringify x    393,325 ops/sec ±1.06% (91 runs sampled)
fastSafeStringify x 327,904 ops/sec ±0.86% (94 runs sampled)
templateStringify x 95,214,894 ops/sec ±0.45% (90 runs sampled)
Fastest for "Object array" is templateStringify

Deep object
utils.inspect x     20,514 ops/sec ±0.73% (95 runs sampled)
JSON.stringify x    74,346 ops/sec ±0.95% (92 runs sampled)
fastSafeStringify x 59,594 ops/sec ±0.37% (97 runs sampled)
templateStringify x 453,741 ops/sec ±0.71% (90 runs sampled)
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




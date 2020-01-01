![](https://github.com/lukas-zech-software/template-stringify/workflows/Build/badge.svg)

# template-stringify v0.0.1-alpha

An new approach to an old problem. Serialization of JS objects with pre compiled string templates.

```bash
Example benchmark on MacBook Pro (15-inch, 2017) 3,1 GHz Intel Core i7
Simple object
utils.inspect     x 220,327 ops/sec ±22.63% (83 runs sampled)
JSON.stringify    x 808,387 ops/sec ±0.89% (91 runs sampled)
fastSafeStringify x 685,979 ops/sec ±0.78% (92 runs sampled)
jsonStrify        x 1,200,198 ops/sec ±0.82% (93 runs sampled)
templateStringify x 2,241,858 ops/sec ±0.60% (90 runs sampled)
Fastest for "Simple object" is templateStringify

Complex object
utils.inspect     x 29,280 ops/sec ±1.34% (92 runs sampled)
JSON.stringify    x 92,787 ops/sec ±0.62% (92 runs sampled)
fastSafeStringify x 75,124 ops/sec ±0.95% (93 runs sampled)
jsonStrify        x 4,957,512 ops/sec ±3.62% (83 runs sampled)
templateStringify x 2,891,903 ops/sec ±3.23% (85 runs sampled)
Fastest for "Complex object" is jsonStrify

Object array
utils.inspect     x 241 ops/sec ±4.78% (78 runs sampled)
JSON.stringify    x 887 ops/sec ±2.50% (88 runs sampled)
fastSafeStringify x 678 ops/sec ±3.95% (84 runs sampled)
jsonStrify        x 63,567,726 ops/sec ±2.69% (84 runs sampled)
templateStringify x 177,941,036 ops/sec ±1.06% (88 runs sampled)
Fastest for "Object array" is templateStringify

Deep object
utils.inspect     x 15,065 ops/sec ±3.49% (83 runs sampled)
JSON.stringify    x 61,767 ops/sec ±0.99% (90 runs sampled)
fastSafeStringify x 47,574 ops/sec ±1.08% (93 runs sampled)
// jsonStrify does notsupport circular references
templateStr       ingify x 390,055 ops/sec ±0.92% (91 runs sampled)
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




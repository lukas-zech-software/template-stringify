![](https://github.com/actions/lukas-zech-software/template-stringify/Build/badge.svg)

# template-stringify v0.0.1-alpha

An new approach to an old problem. Serialization of JS objects

This library is faster than other libraries
* up to 110x times faster than [utils.inspect](https://nodejs.org/api/util.html#util_util_inspect_object_options)
* up to 30x times faster than [fast-safe-stringify](https://www.npmjs.com/package/fast-safe-stringify)

```bash
Example benchmark on MacBook Pro (15-inch, 2017) 3,1 GHz Intel Core i7
         util.inspect
         316,521 op/s » util.inspect:          simple object
          31,814 op/s » util.inspect:          complex object
          95,756 op/s » util.inspect:          object arrays
         155,845 op/s » util.inspect:          circular
         156,027 op/s » util.inspect:          circular getters
          20,865 op/s » util.inspect:          deep
          19,731 op/s » util.inspect:          deep circular
          11,169 op/s » util.inspect:          large deep circular getters
          21,426 op/s » util.inspect:          deep non-conf circular getters

         fast-safe-stringify
         903,967 op/s » fast-safe-stringify:   simple object
         126,113 op/s » fast-safe-stringify:   complex object
         336,605 op/s » fast-safe-stringify:   object arrays
         492,251 op/s » fast-safe-stringify:   circular
         565,351 op/s » fast-safe-stringify:   circular getters
          61,495 op/s » fast-safe-stringify:   deep
          58,462 op/s » fast-safe-stringify:   deep circular
           2,346 op/s » fast-safe-stringify:   large deep circular getters
          30,255 op/s » fast-safe-stringify:   deep non-conf circular getters

          templateStringify
       2,236,836 op/s » template-tringify:   simple object
       3,723,752 op/s » templateStringify:   complex object
      86,913,523 op/s » templateStringify:   object array
         502,633 op/s » templateStringify:   circular
         516,284 op/s » templateStringify:   circular getters
         455,901 op/s » templateStringify:   deep
         158,620 op/s » templateStringify:   deep circular
          41,498 op/s » templateStringify:   large deep circular getters
          71,182 op/s » templateStringify:   deep non-conf circular getters
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




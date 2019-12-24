# template-json.js v0.0.1-alpha

An new edge to an old problem. Serialization of JS objects

This library is faster than other libraries
* up to 110x times faster than [utils.inspect](https://nodejs.org/api/util.html#util_util_inspect_object_options)
* up to 30x times faster than [fast-safe-stringify](https://www.npmjs.com/package/fast-safe-stringify)

```bash
Example benchmark on MacBook MacBook Pro (15-inch, 2017) 3,1 GHz Intel Core i7

         302,426 op/s » util.inspect:          simple object                 
          31,014 op/s » util.inspect:          complex object                 
         125,261 op/s » util.inspect:          circular                      
         148,545 op/s » util.inspect:          circular getters              
          12,006 op/s » util.inspect:          deep                          
          11,680 op/s » util.inspect:          deep circular                 
           8,024 op/s » util.inspect:          large deep circular getters   
          18,935 op/s » util.inspect:          deep non-conf circular getters

                      fast-safe-stringify
         805,689 op/s » fast-safe-stringify:   simple object                 
         113,909 op/s » fast-safe-stringify:   complex object                 
         481,281 op/s » fast-safe-stringify:   circular                      
         561,942 op/s » fast-safe-stringify:   circular getters              
          59,592 op/s » fast-safe-stringify:   deep                          
          57,689 op/s » fast-safe-stringify:   deep circular                 
           2,064 op/s » fast-safe-stringify:   large deep circular getters   
          29,499 op/s » fast-safe-stringify:   deep non-conf circular getters

                      templateStringify
       2,247,645 op/s » template-tringify:   simple object                 
       3,429,678 op/s » templateStringify:   complex object                 
         485,369 op/s » templateStringify:   circular                      
         505,866 op/s » templateStringify:   circular getters              
         451,791 op/s » templateStringify:   deep                          
         152,663 op/s » templateStringify:   deep circular                 
          40,882 op/s » templateStringify:   large deep circular getters   
          69,269 op/s » templateStringify:   deep non-conf circular getters
```

run `npm run benchmarks` for details

## Installation

```shell
$ npm install --save lukas-zech-software/template-stringify
# No npm package yet. Will be released one it leaves alpha stage
```

## Usage

You need to construct a new instance of `JsonTemplate` and pass in an object that looks exactly like
the objects you want to stringify with this template, this is called the `TemplateObject`. One `JsonTemplate` can handle only one object type!
You will need to construct one template for each object you want to handle.

This is best used e.g. on REST routes where one API endpoint always serves objects of the same type

*NOTE: If your objects has optional properties, make sure the `TemplateObject` contains all possible properties*

### TypeScript Interface as `TemplateObject`
It is possible to use a TS interface instead of some test object with actual data.
Currently it supports only one interface per file and no type reference from other files.

Usage example:

```js
// TS interface as template
const parser = new TsInferfaceParser<TestInterface>('./interface.ts');
const interfaceInput = parser.create();

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
* Arrays as top level not yet supported, only objects
* Arrays of Arrays of primitive value not rendered correctly, Arrays of objects work
* TsInterfaceParser: does not support type references (using another interface/type for a property)
* TsInterfaceParser: [Advanced Types](https://www.typescriptlang.org/docs/handbook/advanced-types.html) are not supported
* TsInterfaceParser: `Array<number>` syntax, use `number[]` instead. `any` use `{}` instead




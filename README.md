# template-json.js v0.0.1

An new edge to an old problem. Serialization of JS objects>

This library is currently (%) faster than (util_inspect)
* up to 820% than [utils.inspect](https://nodejs.org/api/util.html#util_util_inspect_object_options)
* up to 580% than [fast-safe-stringify](https://www.npmjs.com/package/fast-safe-stringify)

## Documentation

* [API Documentation](https://benchmarkjs.com/docs)

## Installation

```shell
$ npm i --save fast-templatify
```

Usage example:

```js
const testData = {
  //  .. 
  //  some example data
  // this object should contain all properties, that could be contained
  // in the object that will be serialized through this template 
};

const realData = {
  //  .. 
};

const template = new JsonTemplate();
template.build(testData);

let stringify = template.stringify(realData);

expect(JSON.parse(JSON.stringify(realData))).toEqual(template.parse(stringify))
```

## Tests

```shell
$ npm run build
$ npm run benchmark
```


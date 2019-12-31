'use strict';

// Benchmark copied from https://github.com/fastify/fast-json-stringify

import * as Benchmark from 'benchmark';
import { JsonTemplate } from '../src/JsonTemplate';


const schema = {
    title: 'Example Schema',
    type: 'object',
    properties: {
        firstName: {
            type: 'string'
        },
        lastName: {
            type: ['string', 'null']
        },
        age: {
            description: 'Age in years',
            type: 'integer',
            minimum: 0
        }
    }
};
const schemaCJS = {
    title: 'Example Schema',
    type: 'object',
    properties: {
        firstName: {
            type: 'string'
        },
        lastName: {
            type: ['string', 'null']
        },
        age: {
            description: 'Age in years',
            type: 'number',
            minimum: 0
        }
    }
}

const arraySchema = {
    title: 'array schema',
    type: 'array',
    items: schema
}

const arraySchemaCJS = {
    title: 'array schema',
    type: 'array',
    items: schemaCJS
}

const obj = {
    firstName: 'Lukas',
    lastName: 'Zech',
    age: 32
}

const multiArray: any[] = []

const JSTR = require('json-strify')
const JSTRStringify = JSTR(schemaCJS)
const JSTRArray = JSTR(arraySchemaCJS)
const JSTRInstance = JSTR()

const CJS = require('compile-json-stringify')
const CJSStringify = CJS(schemaCJS)
const CJSStringifyArray = CJS(arraySchemaCJS)
const CJSStringifyString = CJS({type: 'string'})

const FJS = require('fast-json-stringify')
const stringify = FJS(schema)
const stringifyUgly = FJS(schema, {uglify: true})
const stringifyArray = FJS(arraySchema)
const stringifyArrayUgly = FJS(arraySchema, {uglify: true})
const stringifyString = FJS({type: 'string'})
const stringifyStringUgly = FJS({type: 'string', uglify: true})
var str = ''

for (var i = 0; i < 10000; i++) {
    str += i
    if (i % 100 === 0) {
        str += '"'
    }
}

Number(str)

for (i = 0; i < 1000; i++) {
    multiArray.push(obj)
}

const templateObj = new JsonTemplate(obj);
const templateArray = new JsonTemplate(multiArray);
const templateString = new JsonTemplate(str);

new Benchmark.Suite('Creation')
    .add('FJS creation', function () {
        FJS(schema)
    })
    .add('JSTR creation', function () {
        JSTR(schemaCJS)
    })
    .add('CJS creation', function () {
        CJS(schemaCJS)
    })
    .add('template-stringify creation', function () {
        new JsonTemplate(obj)
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();

new Benchmark.Suite('Array')
    .add('JSON.stringify array', function () {
        JSON.stringify(multiArray)
    })
    .add('fast-json-stringify array', function () {
        stringifyArray(multiArray)
    })
    .add('fast-json-stringify-uglified array', function () {
        stringifyArrayUgly(multiArray)
    })
    .add('json-strify array', function () {
        JSTRArray(multiArray)
    })
    .add('compile-json-stringify array', function () {
        CJSStringifyArray(multiArray)
    })
    .add('template-stringify array', function () {
        templateArray.stringify(multiArray)
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();


new Benchmark.Suite('long string')
    .add('JSON.stringify long string', function () {
        JSON.stringify(str)
    })
    .add('fast-json-stringify long string', function () {
        stringifyString(str)
    })
    .add('fast-json-stringify-uglified long string', function () {
        stringifyStringUgly(str)
    })
    .add('json-strify long string', function () {
        JSTRInstance(str)
    })
    .add('compile-json-stringify long string', function () {
        CJSStringifyString(str)
    })
    .add('template-stringify long string', function () {
        templateString.stringify(str)
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();

new Benchmark.Suite('short string')
    .add('JSON.stringify short string', function () {
        JSON.stringify('hello world')
    })
    .add('fast-json-stringify short string', function () {
        stringifyString('hello world')
    })
    .add('fast-json-stringify-uglified short string', function () {
        stringifyStringUgly('hello world')
    })
    .add('json-strify short string', function () {
        JSTRInstance('hello world')
    })
    .add('compile-json-stringify short string', function () {
        CJSStringifyString('hello world')
    })
    .add('template-stringify short string', function () {
        templateString.stringify('hello world')
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();

new Benchmark.Suite('obj')
    .add('JSON.stringify obj', function () {
        JSON.stringify(obj)
    })
    .add('fast-json-stringify obj', function () {
        stringify(obj)
    })
    .add('fast-json-stringify-uglified obj', function () {
        stringifyUgly(obj)
    })
    .add('json-strify obj', function () {
        JSTRStringify(obj)
    })
    .add('compile-json-stringify obj', function () {
        CJSStringify(obj)
    })
    .add('template-stringify obj', function () {
        templateObj.stringify(obj)
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();

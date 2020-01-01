import * as Benchmark from 'benchmark';
import { JsonTemplate } from '../src/JsonTemplate';

const fastSafeStringify = require('fast-safe-stringify');
const {inspect} = require('util');
const jsonStrify = require('json-strify')();

function rndNumber(): number {
    return Math.random();
}

function rndString(): string {
    return Math.random().toString(36).substring(7);
}

function rndBool(): boolean {
    return Date.now() % 1 === 0;
}

const array = new Array(10).fill(0).map((_, i) => i + 'xx');
const complexObjects:any = [{
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
}];

function generateTestComplexObjects() {
    complexObjects.push({
        a: rndNumber(),
        aa: rndString(),
        b: {
            bb1: rndBool(), bb2: rndString(),
            bb3: {
                bbb1: rndBool(),
                bbb2: rndString()
            }
        },
        c: [rndNumber(), rndNumber(), rndNumber()],
        c2: [
            {
                cc2: 'foo', cc3: rndNumber(), cc4: rndBool(),
                array1: [rndNumber(), rndNumber(), rndNumber()],

                ooo: {
                    ooo9: rndString(),
                    ooo1: rndNumber(),
                    ooo2: rndBool(),
                    xxx: {yyy: rndNumber(), ggg: [{hhh: rndString()}, {hhh: rndString()}]}
                }

            },
            {
                cc2: rndString(), cc3: rndNumber(), cc4: rndBool(),
                array1: [rndNumber(), rndNumber(), rndNumber(), rndNumber(), rndNumber()],

                ooo: {
                    ooo9: rndString(),
                    ooo1: rndNumber(),
                    ooo2: null,
                    xxx: {yyy: rndNumber(), ggg: [{hhh: rndString()}]}
                }

            },
            {
                cc2: rndString(), cc3: rndNumber(), cc4: null,
                array1: [rndNumber()],

                ooo: {
                    ooo9: rndString(),
                    ooo1: rndNumber(),
                    ooo2: rndBool(),
                    xxx: {yyy: rndNumber(), ggg: [{hhh: rndString()}, {hhh: rndString()}, {hhh: rndString()}]}
                }

            }
        ],
        d: [
            {dd1: rndString(), dd2: null},
            {dd1: '', dd2: rndBool()},
        ],
        e: {
            ee1: [
                {eee1: rndNumber()},
                {eee1: rndNumber()},
            ],
            ee2: {
                eee2: [
                    {eeee2: rndNumber()},
                    {eeee2: rndNumber()},
                    {eeee2: rndNumber()},
                ]
            }
        },
    });
}

new Array(100).fill(0).forEach(generateTestComplexObjects);
addGetter(complexObjects);

let simpleObjects: any = [{
    a: 1986,
    aa: 'string1',
    aaa: true,
    foo: array
}];

function generateTestSimpleObjects() {
    simpleObjects.push({
        a: rndString(),
        aa: rndString(),
        aaa: rndBool(),
        foo: new Array(10).fill(0).map(rndString)
    });
}

new Array(100).fill(0).forEach(generateTestSimpleObjects);
addGetter(simpleObjects)

function addGetter(obj: any) {
    obj.index = 0;
    Object.defineProperty(obj, 'current', {
        get: () => {
            if (obj.index === obj.length - 1) {
                obj.index = 0
            } else {
                obj.index++;
            }
            return obj[obj.index];
        },
        enumerable: true,
        configurable: false
    });
}

const circ = JSON.parse(JSON.stringify(simpleObjects[0]));
circ.id = Date.now();
circ.o = {obj: circ, array};
const circGetters = JSON.parse(JSON.stringify(simpleObjects[0]));
Object.assign(circGetters, {
    get o() {
        return {obj: circGetters, array};
    }
});

const deep = require('../../package.json');
deep.deep = JSON.parse(JSON.stringify(deep));
deep.deep.deep = JSON.parse(JSON.stringify(deep));
deep.deep.deep.deep = JSON.parse(JSON.stringify(deep));
deep.array = array;

const deepCirc = JSON.parse(JSON.stringify(deep));
deepCirc.deep.deep.deep.circ = deepCirc;
deepCirc.deep.deep.circ = deepCirc;
deepCirc.deep.circ = deepCirc;
deepCirc.array = array;

const deepCircGetters = JSON.parse(JSON.stringify(deep));
for (let i = 0; i < 10; i++) {
    deepCircGetters[i.toString()] = {
        deep: {
            deep: {
                get circ() {
                    return deep.deep;
                },
                deep: {
                    get circ() {
                        return deep.deep.deep;
                    }
                }
            },
            get circ() {
                return deep;
            }
        },
        get array() {
            return array;
        }
    }
}

const deepCircNonCongifurableGetters = JSON.parse(JSON.stringify(deep))
Object.defineProperty(deepCircNonCongifurableGetters.deep.deep.deep, 'circ', {
    get: () => deepCircNonCongifurableGetters,
    enumerable: true,
    configurable: false
});
Object.defineProperty(deepCircNonCongifurableGetters.deep.deep, 'circ', {
    get: () => deepCircNonCongifurableGetters,
    enumerable: true,
    configurable: false
});
Object.defineProperty(deepCircNonCongifurableGetters.deep, 'circ', {
    get: () => deepCircNonCongifurableGetters,
    enumerable: true,
    configurable: false
});
Object.defineProperty(deepCircNonCongifurableGetters, 'array', {
    get: () => array,
    enumerable: true,
    configurable: false
});


// Simple object
const templateStringifyObj = new JsonTemplate(simpleObjects[0]);
new Benchmark.Suite('Simple object')
    .on('start', function () {
        console.log('Simple object');
    })
    .add('utils.inspect', function () {
        inspect(simpleObjects.current, {showHidden: false, depth: null})
    })
    .add('JSON.stringify', function () {
        JSON.stringify(simpleObjects.current);
    })
    .add('fastSafeStringify', function () {
        fastSafeStringify(simpleObjects.current)
    })
    .add('jsonStrify', function () {
        jsonStrify(simpleObjects.current)
    })
    .add('templateStringify', function () {
        templateStringifyObj.stringify(simpleObjects.current);
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();

// Complex object
const templateStringifyObj2 = new JsonTemplate(complexObjects[0]);
new Benchmark.Suite('Complex object')
    .on('start', function () {
        console.log('Complex object');
    })
    .add('utils.inspect', function () {
        inspect(complexObjects.current, {showHidden: false, depth: null})
    })
    .add('JSON.stringify', function () {
        JSON.stringify(complexObjects.current);
    })
    .add('fastSafeStringify', function () {
        fastSafeStringify(complexObjects.current)
    })
    .add('jsonStrify', function () {
        jsonStrify(complexObjects.current)
    })
    .add('templateStringify', function () {
        templateStringifyObj2.stringify(complexObjects.current);
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();

// object Array
const templateStringifyArr = new JsonTemplate(complexObjects);
new Benchmark.Suite('Object array')
    .on('start', function () {
        console.log('Object array');
    })
    .add('utils.inspect', function () {
        inspect(complexObjects, {showHidden: false, depth: null})
    })
    .add('JSON.stringify', function () {
        JSON.stringify(complexObjects);
    })
    .add('fastSafeStringify', function () {
        fastSafeStringify(complexObjects)
    })
    .add('jsonStrify', function () {
        jsonStrify(complexObjects)
    })
    .add('templateStringify', function () {
        templateStringifyArr.stringify(complexObjects);
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();

// deep object
const templateStringifyDeep = new JsonTemplate(deep);
new Benchmark.Suite('Deep object')
    .on('start', function () {
        console.log('Deep object');
    })
    .add('utils.inspect', function () {
        inspect(deep, {showHidden: false, depth: null})
    })
    .add('JSON.stringify', function () {
        JSON.stringify(deep);
    })
    .add('fastSafeStringify', function () {
        fastSafeStringify(deep)
    })
    .add('templateStringify', function () {
        templateStringifyDeep.stringify(deep);
    })
    .on('cycle', function (event: any) {
        console.log(event.target.toString());
    })
    .on('complete', function (this: any) {
        console.log(`Fastest for "${this.name}" is ${this.filter('fastest').map('name')}`);
    })
    .run();


const fastSafeStringify = require('fast-safe-stringify');
const {inspect} = require('util');
import { JsonTemplate } from '../src/JsonTemplate';

const isEqual = require('lodash.isequal');

const array = new Array(10).fill(0).map((_, i) => i);
const testObj2 = {
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

const testObj = {
    a: 1986,
    aa: 'string1',
    aaa: true,
    foo: array
};
const circ = JSON.parse(JSON.stringify(testObj));
circ.id = Date.now();
circ.o = {obj: circ, array};
const circGetters = JSON.parse(JSON.stringify(testObj));
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

suite('util.inspect', function () {
    set('iterations', 10000);     // the number of times to run a given bench

    bench('util.inspect:          simple object                 ', function () {
        inspect(testObj, {showHidden: false, depth: null})
    });
    bench('util.inspect:          complex object                 ', function () {
        inspect(testObj2, {showHidden: false, depth: null})
    });
    bench('util.inspect:          circular                      ', function () {
        inspect(circ, {showHidden: false, depth: null})
    });
    bench('util.inspect:          circular getters              ', function () {
        inspect(circGetters, {showHidden: false, depth: null})
    });
    bench('util.inspect:          deep                          ', function () {
        inspect(deep, {showHidden: false, depth: null})
    });
    bench('util.inspect:          deep circular                 ', function () {
        inspect(deepCirc, {showHidden: false, depth: null})
    });
    bench('util.inspect:          large deep circular getters   ', function () {
        inspect(deepCircGetters, {showHidden: false, depth: null})
    });
    bench('util.inspect:          deep non-conf circular getters', function () {
        inspect(deepCircNonCongifurableGetters, {showHidden: false, depth: null})
    })
});

suite('fast-safe-stringify', function () {
    set('iterations', 10000);     // the number of times to run a given bench

    bench('fast-safe-stringify:   simple object                 ', function () {
        fastSafeStringify(testObj)
    });

    bench('fast-safe-stringify:   complex object                 ', function () {
        fastSafeStringify(testObj2)
    });
    bench('fast-safe-stringify:   circular                      ', function () {
        fastSafeStringify(circ)
    });
    bench('fast-safe-stringify:   circular getters              ', function () {
        fastSafeStringify(circGetters)
    });
    bench('fast-safe-stringify:   deep                          ', function () {
        fastSafeStringify(deep)
    });
    bench('fast-safe-stringify:   deep circular                 ', function () {
        fastSafeStringify(deepCirc)
    });
    bench('fast-safe-stringify:   large deep circular getters   ', function () {
        fastSafeStringify(deepCircGetters)
    });
    bench('fast-safe-stringify:   deep non-conf circular getters', function () {
        fastSafeStringify(deepCircNonCongifurableGetters)
    });
});

suite('templateStringify', function () {
    set('iterations', 10000);     // the number of times to run a given bench

    const templateStringifyObj = new JsonTemplate(testObj);
    bench('template-tringify:   simple object                 ', function () {
        templateStringifyObj.stringify(testObj);
    });

    const templateStringifyObj2 = new JsonTemplate(testObj2);
    bench('templateStringify:   complex object                 ', function () {
        templateStringifyObj2.stringify(testObj2)
    });

    const templateStringifyCirc = new JsonTemplate(circ);
    bench('templateStringify:   circular                      ', function () {
        templateStringifyCirc.stringify(circ)
    });

    const templateStringifycircGetters = new JsonTemplate(circGetters);
    bench('templateStringify:   circular getters              ', function () {
        templateStringifycircGetters.stringify(circGetters)
    });

    const templateStringifydeep = new JsonTemplate(deep);
    bench('templateStringify:   deep                          ', function () {
        templateStringifydeep.stringify(deep)
    });

    const templateStringifydeepCirc = new JsonTemplate(deepCirc);
    bench('templateStringify:   deep circular                 ', function () {
        templateStringifydeepCirc.stringify(deepCirc)
    });

    const templateStringifydeepCircGetters = new JsonTemplate(deepCircGetters);
    bench('templateStringify:   large deep circular getters   ', function () {
        templateStringifydeepCircGetters.stringify(deepCircGetters)
    });

    const templateStringifydeepCircNonCongifurableGetters = new JsonTemplate(deepCircNonCongifurableGetters);
    bench('templateStringify:   deep non-conf circular getters', function () {
        templateStringifydeepCircNonCongifurableGetters.stringify(deepCircNonCongifurableGetters)
    });

});

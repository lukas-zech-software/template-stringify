import { JsonTemplate } from '../src/JsonTemplate';
import { testActualData, testTemplateData } from './testData';

describe("JsonTemplate", function () {

    describe("Primitive Values", function () {
        it("should add integer value", function () {
            const testTemplate = {integer: 0};
            const testData = {integer: 1};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"integer":1}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add float value", function () {
            const testTemplate = {float: 1.1};
            const testData = {float: 2.2};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"float":2.2}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add boolean value", function () {
            const testTemplate = {boolean: true};
            const testData = {boolean: false};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"boolean":false}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add string value", function () {
            const testTemplate = {string: 'someString'};
            const testData = {string: 'otherString'};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"string":"otherString"}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add null if value is null", function () {
            const template = new JsonTemplate({something: null});
            let obj = {something: null};
            let stringify = template.stringify(obj);
            expect(stringify).toEqual('{"something":null}');
            expect(template.parse(stringify)).toEqual(obj);
        });

        it("should add number template if value is null in template but set in dataObj", function () {
            const template = new JsonTemplate({something: null} as { something: null | number });
            let obj = {something: 1};
            let stringify = template.stringify(obj);
            expect(stringify).toEqual('{"something":1}');
            expect(template.parse(stringify)).toEqual(obj);
        });

        it("should add nothing if value is undefined", function () {
            const template = new JsonTemplate({something: undefined});
            expect(template.stringify({something: undefined})).toEqual('{}');
        });
    });

    describe("Objects", function () {
        it("should add simple object", function () {
            const testData = {simpleObject: {string: 'someString'}};
            const template = new JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"simpleObject":{"string":"someString"}}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add nested object", function () {
            const testData = {};

            function recursiveAddNestedObject(obj: any, depth: number) {
                obj.deep = {};
                if (depth < 5) {
                    recursiveAddNestedObject(obj.deep, depth + 1)
                }
            }

            recursiveAddNestedObject(testData, 0);

            const template = new JsonTemplate(testData);
            const deepStringified = '{"deep":{"deep":{"deep":{"deep":{"deep":{"deep":{}}}}}}}'
            let stringify = template.stringify(testData);
            expect(stringify).toEqual(deepStringified);
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should stop nesting circular objects at depth of 3", function () {
            const testData = {};

            function recursiveAddNestedObject(obj: any, depth: number) {
                obj.deep = obj;
                if (depth < 5) {
                    recursiveAddNestedObject(obj.deep, depth + 1)
                }
            }

            recursiveAddNestedObject(testData, 0);

            const template = new JsonTemplate(testData);
            expect(template.stringify(testData)).toEqual('{"deep":{"deep":{"deep":{"deep":{"deep":"[CIRCULAR]"}}}}}');
        });
    });

    describe("Arrays", function () {
        it("should add primitive value array", function () {
            const testTemplate = {integers: [1, 2, 3]};
            const testData = {integers: [4, 5, 6]};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"integers":[4,5,6]}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add primitive value array of arrays", function () {
            const testTemplate = {integers: [[0]]};
            const testData = {integers: [[1, 2, 3], [4, 5, 6], [7, 8, 9]]};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"integers":[[1,2,3],[4,5,6],[7,8,9]]}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add object value array", function () {
            const testTemplate = {objectsArray: [{simpleObject: {string: 'someString1'}}]};
            const testData = {objectsArray: [{simpleObject: {string: 'otherString1'}}, {simpleObject: {string: 'otherString2'}}, {simpleObject: {string: 'otherString3'}}]};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"objectsArray":[{"simpleObject":{"string":"otherString1"}},{"simpleObject":{"string":"otherString2"}},{"simpleObject":{"string":"otherString3"}}]}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add object value array of object with arrays of objects", function () {
            const testTemplate = {objectsArray: [{simpleObject: {nestedObjectsArray: [{string: 'someString1'}]}}]};
            const testData = {objectsArray: [{simpleObject: {nestedObjectsArray: [{string: 'otherString1'}, {string: 'otherString2'}]}}]};
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"objectsArray":[{"simpleObject":{"nestedObjectsArray":[{"string":"otherString1"},{"string":"otherString2"}]}}]}');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add array as root element with nested primitive values", function () {
            const testTemplate = ["someString1"];
            const testData = ["otherString1", "otherString2", "otherString2"];
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('["otherString1","otherString2","otherString2"]');
            expect(template.parse(stringify)).toEqual(testData);
        });

        it("should add array as root element with nested objects", function () {
            const testTemplate = [{string: "someString1"}];
            const testData = [{string: "otherString1"}, {string: "otherString2"}, {string: "otherString2"}];
            const template = new JsonTemplate(testTemplate);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('[{"string":"otherString1"},{"string":"otherString2"},{"string":"otherString2"}]');
            expect(template.parse(stringify)).toEqual(testData);
        });
    });

    describe("stringify", function () {
        it("should build template from object in constructor and stringify object passed ", function () {
            const testData = {integer: 1, string: 'foo'};
            const testData2 = {integer: 2, string: 'bar'};
            const template = new JsonTemplate(testData);
            let stringify = template.stringify(testData2);
            expect(stringify).toEqual('{"integer":2,"string":"bar"}');
            expect(template.parse(stringify)).toEqual(testData2);
        });

        it("should work on complex object", function () {
            const template = new JsonTemplate(testTemplateData);
            let stringify = template.stringify(testActualData);
            expect(template.parse(stringify)).toEqual(testActualData);
        });

        it("should work on complex arrays", function () {
            const template = new JsonTemplate([testTemplateData]);
            let stringify = template.stringify([testActualData, testActualData, testActualData, testActualData]);
            expect(template.parse(stringify)).toEqual([testActualData, testActualData, testActualData, testActualData]);
        });
    });
});

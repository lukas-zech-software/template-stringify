"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonTemplate_1 = require("../src/JsonTemplate");
const testData_1 = require("./testData");
describe("JsonTemplate", function () {
    describe("Primitive Values", function () {
        it("should add integer value", function () {
            const testData = { integer: 1 };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"integer":1}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add float value", function () {
            const testData = { float: 1.1 };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"float":1.1}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add boolean value", function () {
            const testData = { boolean: true };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"boolean":true}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add string value", function () {
            const testData = { string: 'someString' };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"string":"someString"}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add null if value is null", function () {
            const template = new JsonTemplate_1.JsonTemplate({ something: null });
            let obj = { something: null };
            let stringify = template.stringify(obj);
            expect(stringify).toEqual('{"something":null}');
            expect(template.parse(stringify)).toEqual(obj);
        });
        it("should add number template if value is null in template but set in dataObj", function () {
            const template = new JsonTemplate_1.JsonTemplate({ something: null });
            let obj = { something: 1 };
            let stringify = template.stringify(obj);
            expect(stringify).toEqual('{"something":1}');
            expect(template.parse(stringify)).toEqual(obj);
        });
        it("should add nothing if value is undefined", function () {
            const template = new JsonTemplate_1.JsonTemplate({ something: undefined });
            expect(template.stringify({ something: undefined })).toEqual('{}');
        });
    });
    describe("Objects", function () {
        it("should add simple object", function () {
            const testData = { simpleObject: { string: 'someString' } };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"simpleObject":{"string":"someString"}}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add nested object", function () {
            const testData = {};
            function recursiveAddNestedObject(obj, depth) {
                obj.deep = {};
                if (depth < 5) {
                    recursiveAddNestedObject(obj.deep, depth + 1);
                }
            }
            recursiveAddNestedObject(testData, 0);
            const template = new JsonTemplate_1.JsonTemplate(testData);
            const deepStringified = '{"deep":{"deep":{"deep":{"deep":{"deep":{"deep":{}}}}}}}';
            let stringify = template.stringify(testData);
            expect(stringify).toEqual(deepStringified);
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should stop nesting circular objects at depth of 3", function () {
            const testData = {};
            function recursiveAddNestedObject(obj, depth) {
                obj.deep = obj;
                if (depth < 5) {
                    recursiveAddNestedObject(obj.deep, depth + 1);
                }
            }
            recursiveAddNestedObject(testData, 0);
            const template = new JsonTemplate_1.JsonTemplate(testData);
            expect(template.stringify(testData)).toEqual('{"deep":{"deep":{"deep":{"deep":{"deep":"[CIRCULAR]"}}}}}');
        });
    });
    describe("Arrays", function () {
        it("should add primitive value array", function () {
            const testData = { integers: [1, 2, 3] };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"integers":[1,2,3]}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add primitive value array of arrays", function () {
            const testData = { integers: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"integers":[[1,2,3],[4,5,6],[7,8,9]]}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add object value array", function () {
            const testData = { objectsArray: [{ simpleObject: { string: 'someString1' } }, { simpleObject: { string: 'someString2' } }, { simpleObject: { string: 'someString3' } }] };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"objectsArray":[{"simpleObject":{"string":"someString1"}},{"simpleObject":{"string":"someString2"}},{"simpleObject":{"string":"someString3"}}]}');
            expect(template.parse(stringify)).toEqual(testData);
        });
        it("should add object value array of object with arrays of objects", function () {
            const testData = { objectsArray: [{ simpleObject: { nestedObjectsArray: [{ string: 'nestedString1' }, { string: 'nestedString2' }] } }] };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData);
            expect(stringify).toEqual('{"objectsArray":[{"simpleObject":{"nestedObjectsArray":[{"string":"nestedString1"},{"string":"nestedString2"}]}}]}');
            expect(template.parse(stringify)).toEqual(testData);
        });
    });
    describe("stringify", function () {
        it("should build template from object in constructor and stringify object passed ", function () {
            const testData = { integer: 1, string: 'foo' };
            const testData2 = { integer: 2, string: 'bar' };
            const template = new JsonTemplate_1.JsonTemplate(testData);
            let stringify = template.stringify(testData2);
            expect(stringify).toEqual('{"integer":2,"string":"bar"}');
            expect(template.parse(stringify)).toEqual(testData2);
        });
        it("should work on complex object", function () {
            const template = new JsonTemplate_1.JsonTemplate(testData_1.testTemplateData);
            let stringify = template.stringify(testData_1.testActualData);
            expect(template.parse(stringify)).toEqual(testData_1.testActualData);
        });
    });
});
//# sourceMappingURL=JsonTemplate.spec.js.map
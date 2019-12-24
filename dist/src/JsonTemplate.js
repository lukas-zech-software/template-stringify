"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const isCyclic = require('./isCyclic');
let tId = 0;
function getProp(obj, path, objName = 'obj') {
    let args = `return ${path};`;
    return new Function(...[objName], args)(obj);
}
/**
 * A prebuilt template to stringify specific type of objects way faster
 * than generic methods like `JSON.stringify` can
 */
class JsonTemplate {
    constructor(templateObject, recursiveOptions) {
        this.templateObject = templateObject;
        this.recursiveOptions = recursiveOptions;
        this.template = '';
        this.fns = [];
        this.charId = 35;
        this.charMap = {};
        this.afterFns = [];
        this.templateFn = this.build();
    }
    addValueArray(key, path) {
        this.fns.push(() => {
            if (isNaN(parseInt(key)) === false) {
                this.template += `[\$\{${path}["${key}"].join(',')\}]`;
                return;
            }
            this.template += `"${key}":[\$\{${path}["${key}"].join(',')\}]`;
        });
    }
    addObject(key, path) {
        this.fns.push((obj, basePath) => {
            const isArray = Array.isArray(obj) === true;
            const parent = this.recursiveOptions ? this.recursiveOptions.parent : this;
            if (isArray) {
                const id = `"|${tId++}|"`;
                parent.afterFns.push({
                    id,
                    basePath: basePath,
                    fn: (obj2) => {
                        if (basePath === undefined) {
                            throw new Error('BasePath necessary for nested objects');
                        }
                        const data = getProp(obj2, basePath);
                        return data.map((x, i) => {
                            const innerTemplate = new JsonTemplate(x, {
                                basePath: `${basePath}[${i}]`,
                                parent,
                                depth: this.recursiveOptions ? this.recursiveOptions.depth + 1 : 0
                            });
                            return innerTemplate.stringify(obj2);
                        }).join(',');
                    }
                });
                return this.template += id;
            }
            const innerObj = obj[key];
            const t = new JsonTemplate(innerObj, {
                basePath: `${path}["${key}"]`,
                parent,
                depth: this.recursiveOptions ? this.recursiveOptions.depth + 1 : 0,
            });
            const texTemplate = t.getTemplate();
            return this.template += `"${key}":${texTemplate}`;
        });
    }
    addString(key, path) {
        this.fns.push(() => {
            return this.template += `"${key}":"\$\{${path}['${key}']\}"`;
        });
    }
    addNumberOrBoolean(key, path) {
        this.fns.push(() => {
            return this.template += `"${key}":\$\{${path}['${key}']\}`;
        });
    }
    fn2(value, key, path = 'obj') {
        switch (typeof value) {
            case "object": {
                if (value === null || value === undefined) {
                    this.addNumberOrBoolean(key, path);
                    break;
                }
                if (Array.isArray(value)) {
                    if (typeof value[0] === 'object') {
                        this.addObject(key, path);
                        break;
                    }
                    this.addValueArray(key, path);
                    break;
                }
                if ((this.recursiveOptions ? this.recursiveOptions.depth : 0) >= 3 && isCyclic(value)) {
                    this.template += `"${key}":"[CIRCULAR]"`;
                    break;
                }
                this.addObject(key, path);
                break;
            }
            case "string": {
                this.addString(key, path);
                break;
            }
            case "number":
            case "boolean":
            case "bigint": {
                this.addNumberOrBoolean(key, path);
                break;
            }
            case "function":
            case 'symbol':
            case 'undefined':
            default: {
                break;
            }
        }
    }
    create(obj, basePath) {
        //const keys = Object.keys(obj);
        for (let key in obj) {
            let value = obj[key];
            this.fn2(value, key, basePath);
            if (isNaN(parseInt(key)) === false) {
                //if key is numeric its an array and we only need the first element
                return;
            }
        }
    }
    _renderFactory(str) {
        let args = `return \`${str}\`;`;
        return new Function(...['obj', 'JsonTemplate'], args);
    }
    build() {
        const isArray = Array.isArray(this.templateObject);
        const basePath = this.recursiveOptions ? this.recursiveOptions.basePath : undefined;
        if (isArray) {
            this.template = '[';
        }
        else {
            this.template = '{';
        }
        this.create(this.templateObject, basePath);
        this.fns.forEach((fn, i) => {
            fn(this.templateObject, basePath);
            if (i !== this.fns.length - 1) {
                this.template += ',';
            }
        });
        if (isArray) {
            this.template += ']';
        }
        else {
            this.template += '}';
        }
        return this._renderFactory(this.template);
    }
    /**
     * Get the current string template
     */
    getTemplate() {
        return this.template;
    }
    /**
     * Stringify the passed object with the prebuilt template
     * @param obj
     */
    stringify(obj) {
        let stringify = this.templateFn(obj);
        const previous = [...this.afterFns];
        this.afterFns = [];
        previous.forEach(({ fn, id }, i) => {
            let result = fn(obj);
            stringify = stringify.replace(id, `${result}`);
        });
        this.afterFns.forEach(({ fn, id }, i) => {
            let result = fn(obj);
            stringify = stringify.replace(id, `${result}`);
        });
        return stringify;
    }
    /**
     * Parse a provided obejct
     * @param str
     */
    parse(str) {
        //Object.entries(this.charMap).forEach(([key, char]) => {
        //    str = str.replace(new RegExp(`"\\${char}"`, 'g'), `"${key}"`)
        //});
        return JSON.parse(str);
    }
}
exports.JsonTemplate = JsonTemplate;
//# sourceMappingURL=JsonTemplate.js.map
const isCyclic = require('./isCyclic');
let tId = 0;

function getProp(obj: any, path: string, objName = 'obj'): any {
    let args = `return ${path};`;
    return new Function(...[objName], args)(obj);

}

export class JsonTemplate<T = any> {
    private charId: number;
    private charMap: { [index: string]: string };
    private templateFn: (obj: T, bla: any) => string;
    private template: string;
    private fns: Array<(obj: T, basePath?: string) => any> = []
    private afterFns: Array<{
        id: string,
        basePath: string,
        fn: (obj: any, basePath?: string) => any,
    }>;
    private innerTemplateCache: Map<string, JsonTemplate> = new Map();

    constructor(private parent?: JsonTemplate, private depth = 0) {
        this.charId = 35;
        this.charMap = {};
        this.afterFns = [];
    }

    private addValueArray(key, path) {
        this.fns.push((obj) => {
            this.template += `"${key}":[\$\{${path}["${key}"].join(',')\}]`
        });
    }

    private addObject(key, path) {
        this.fns.push((obj, basePath) => {

            const isArray = Array.isArray(obj) === true;

            let parent = this.parent || this;

            if (isArray) {
                const id = `"|${tId++}|"`;
                parent.afterFns.push({
                    id,
                    basePath,
                    fn: (obj2) => {
                        const xxx = getProp(obj2, basePath);

                        return xxx.map((x, i) => {
                            const innerTemplate = new JsonTemplate(parent, this.depth + 1);
                            innerTemplate.build(x, `${basePath}[${i}]`);


                            return innerTemplate.stringify(obj2);
                        }).join(',');
                    }
                });

                return this.template += id;

            }

            const t = new JsonTemplate(parent, this.depth + 1);

            let innerObj = obj[key];
            t.build(innerObj, `${path}["${key}"]`);
            let template = t.getTemplate();


            return this.template += `"${key}":${template}`;
        });
    }

    private addString(key, path) {
        this.fns.push(() => {
            return this.template += `"${key}":"\$\{${path}['${key}']\}"`;
        });
    }

    private addNumberOrBoolean(key, path) {
        this.fns.push(() => {
            return this.template += `"${key}":\$\{${path}['${key}']\}`;
        });
    }

    private fn2(value, key, path = 'obj') {
        switch (typeof value) {
            case "object": {
                if (value === null) {
                    this.addNumberOrBoolean(key, path);
                    break
                }

                if (Array.isArray(value)) {
                    if (typeof value[0] === 'object') {
                        this.fn2(value[0], key, path);
                        break;
                    }

                    this.addValueArray(key, path);
                    break
                }

                if (this.depth > 3 && isCyclic(value)) {
                    this.template += `"${key}":"[CIRCULAR]"`;

                    break
                }

                this.addObject(key, path);
                break
            }

            case "string": {
                this.addString(key, path);

                break
            }

            case "number":
            case "boolean":
            case 'undefined':
            case "bigint": {
                this.addNumberOrBoolean(key, path);
                break;
            }

            case "function":
            case 'symbol':
            default : {
                break;
            }

        }

    }

    private create(obj, basePath?: string) {
        for (let key in obj) {
            let value = obj[key];
            this.fn2(value, key, basePath)
            if (isNaN(parseInt(key)) === false) {
                //if key is numeric its an array and we only need the first element
                return;
            }
        }
    }

    private _renderFactory(str): (obj: T) => string {
        let args = `return \`${str}\`;`;
        return new Function(...['obj', 'JsonTemplate'], args) as (obj: T) => string;
    }

    build(obj: T, basePath?: string) {
        const isArray = Array.isArray(obj);
        if (isArray) {
            this.template = '[';
        } else {
            this.template = '{';
        }

        this.create(obj, basePath);

        this.fns.forEach((fn, i) => {
            fn(obj, basePath);
            if (i !== this.fns.length - 1) {
                this.template += ',';
            }
        });

        if (isArray) {
            this.template += ']';
        } else {
            this.template += '}';
        }

        this.templateFn = this._renderFactory(this.template);
    }

    getTemplate() {
        return this.template;
    }

    stringify(obj: T) {
        let stringify = this.templateFn(obj, undefined);

        const previous = [...this.afterFns];
        this.afterFns = [];

        previous.forEach(({fn, id}, i) => {
            let result = fn(obj);
            stringify = stringify.replace(id, `${result}`)
        });

        this.afterFns.forEach(({fn, id}, i) => {
            let result = fn(obj);
            stringify = stringify.replace(id, `${result}`)
        });

        return stringify;
    }

    parse(str: string): T {
        //Object.entries(this.charMap).forEach(([key, char]) => {
        //    str = str.replace(new RegExp(`"\\${char}"`, 'g'), `"${key}"`)
        //});

        return JSON.parse(str);
    }

}

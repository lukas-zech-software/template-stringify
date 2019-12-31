const isCyclic = require('./isCyclic');
let tId = 0;

function getProp(obj: any, path: string, objName = 'obj'): any {
    let args = `return ${path};`;
    return new Function(...[objName], args)(obj);

}

function getStringTemplate(key: string, path: string): string {
    if (isNaN(parseInt(key)) === false) {
        return `"\$\{${path}['${key}']\}"`;
    }
    return `"${key}":"\$\{${path}['${key}']\}"`;
}

function getNumberOrBooleanTemplate(key: string, path: string): string {
    if (isNaN(parseInt(key)) === false) {
        return `\$\{${path}['${key}']\}`;
    }
    return `"${key}":\$\{${path}['${key}']\}`;
}

/**
 * Inner options passed to the template constructor on recursive calls
 */
interface RecursiveOptions<T> {
    basePath?: string
    parent: JsonTemplate<T>,
    depth: number,
}

type TemplateFunction<T> = (obj: T) => string;

/**
 * A prebuilt template to stringify specific type of objects way faster
 * than generic methods like `JSON.stringify` can
 */
export class JsonTemplate<T> {
    /**
     * Last char id used to minify the output
     *
     */
    private charId: number;
    private charMap: { [index: string]: string };
    private templateFn: TemplateFunction<T>;
    private template: string = '';
    private fns: Array<(obj: T, basePath?: string) => any> = [];
    private afterFns: Array<{
        id: string,
        basePath?: string,
        fn: (obj: any, basePath?: string) => any,
    }>;

    constructor(private templateObject: T, private recursiveOptions?: RecursiveOptions<T>) {
        this.charId = 35;
        this.charMap = {};
        this.afterFns = [];

        this.templateFn = this.build()
    }

    private addValueArray(key: string, path: string): void {
        this.fns.push(() => {
            if (isNaN(parseInt(key)) === false) {
                return this.template += `[\$\{${path}["${key}"].join(',')\}]`;
            }
            this.template += `"${key}":[\$\{${path}["${key}"].join(',')\}]`
        });
    }

    private addObject(key: string, path: string) {
        this.fns.push((obj, basePath) => {
            const isArray = Array.isArray(obj) === true;
            const parent = this.recursiveOptions ? this.recursiveOptions.parent : this;

            if (isArray) {
                const id = `"|${tId++}|"`;
                parent.afterFns.push({
                    id,
                    basePath: basePath,
                    fn: (obj2) => {
                        let data = obj2;

                        // if no basePath is provided this is the root object
                        // meaning the document root is an array
                        if (basePath !== undefined) {
                            data = getProp(obj2, basePath);
                        }


                        return data.map((x: any, i: number) => {
                            let type = typeof x;
                            if (type !== 'object') {
                                if (type === 'string') {
                                    return `"${x}"`;
                                }
                                return x;
                            }

                            const innerTemplate = new JsonTemplate(x, {
                                basePath: `${basePath || 'obj'}[${i}]`,
                                parent,
                                depth: this.recursiveOptions ? this.recursiveOptions.depth + 1 : 0
                            });

                            return innerTemplate.stringify(obj2);
                        }).join(',');
                    }
                });

                return this.template += id;
            }

            const innerObj = (obj as any)[key];
            const t = new JsonTemplate(innerObj, {
                basePath: `${path}["${key}"]`,
                parent,
                depth: this.recursiveOptions ? this.recursiveOptions.depth + 1 : 0,
            });
            const texTemplate = t.getTemplate();

            return this.template += `"${key}":${texTemplate}`;
        });
    }

    private addString(key: string, path: string) {
        this.fns.push(() => {
            return this.template += getStringTemplate(key, path);
        });
    }

    private addNumberOrBoolean(key: string, path: string) {
        this.fns.push(() => {
            return this.template += getNumberOrBooleanTemplate(key, path);
        });
    }

    private fn2(value: any, key: string, path: string = 'obj') {
        switch (typeof value) {
            case "object": {
                if (value === null || value === undefined) {
                    this.addNumberOrBoolean(key, path);
                    break
                }

                if (Array.isArray(value)) {
                    if (typeof value[0] === 'object') {
                        this.addObject(key, path);
                        break;
                    }

                    this.addValueArray(key, path);
                    break
                }

                if ((this.recursiveOptions ? this.recursiveOptions.depth : 0) >= 3 && isCyclic(value)) {
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
            case "bigint": {
                this.addNumberOrBoolean(key, path);
                break;
            }

            case "function":
            case 'symbol':
            case 'undefined':
            default : {
                break;
            }

        }

    }

    private create(obj: T, basePath?: string) {
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

    private _renderFactory(str: string): (obj: T) => string {
        let args = `return \`${str}\`;`;
        return new Function(...['obj', 'JsonTemplate'], args) as (obj: T) => string;
    }

    private build(): TemplateFunction<T> {
        // use native implementation for string an number
        if (typeof this.templateObject === 'string' || typeof this.templateObject === 'number') {
            return JSON.stringify
        }

        const isArray = Array.isArray(this.templateObject);
        const basePath = this.recursiveOptions ? this.recursiveOptions.basePath : undefined

        if (isArray) {
            this.template = '[';
            this.addObject('', basePath || 'obj');

        } else {
            this.template = '{';
            this.create(this.templateObject, basePath);
        }

        this.fns.forEach((fn, i) => {
            fn(this.templateObject, basePath);
            if (i !== this.fns.length - 1) {
                this.template += ',';
            }
        });

        if (isArray) {
            this.template += ']';
        } else {
            this.template += '}';
        }

        return this._renderFactory(this.template);
    }


    /**
     * Get the current string template
     */
    public getTemplate(): string {
        return this.template;
    }

    /**
     * Stringify the passed object with the prebuilt template
     * @param obj
     */
    public stringify(obj: T) {
        let stringify = this.templateFn(obj);


        while (this.afterFns.length) {
            const [{fn, id}] = this.afterFns.splice(0, 1);
            let result = fn(obj);
            stringify = stringify.replace(id, `${result}`)
        }

        return stringify;
    }

    /**
     * Parse a provided obejct
     * @param str
     */
    public parse(str: string): T {
        //Object.entries(this.charMap).forEach(([key, char]) => {
        //    str = str.replace(new RegExp(`"\\${char}"`, 'g'), `"${key}"`)
        //});

        return JSON.parse(str);
    }

}

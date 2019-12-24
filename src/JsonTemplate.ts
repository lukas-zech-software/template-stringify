const isCyclic = require('./isCyclic');
let tId = 0;

function getProp(obj: any, path: string, objName = 'obj'): any {
    let args = `return ${path};`;
    return new Function(...[objName], args)(obj);

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
                this.template += `[\$\{${path}["${key}"].join(',')\}]`;
                return;
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
                        if (basePath === undefined) {
                            throw new Error('BasePath necessary for nested objects')
                        }
                        const data = getProp(obj2, basePath);

                        return data.map((x: any, i: number) => {
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
            return this.template += `"${key}":"\$\{${path}['${key}']\}"`;
        });
    }

    private addNumberOrBoolean(key: string, path: string) {
        this.fns.push(() => {
            return this.template += `"${key}":\$\{${path}['${key}']\}`;
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
        const isArray = Array.isArray(this.templateObject);
        const basePath = this.recursiveOptions ? this.recursiveOptions.basePath : undefined

        if (isArray) {
            this.template = '[';
        } else {
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

export interface TestInterface {
    a: number,
    aa: string;
    b: {
        bb1: boolean
        bb2: string
        bb3: {
            bbb1: boolean,
            bbb2: string
        }
    },
    c: number[],
    c2: {
        array1: number[],
        cc2: string,
        cc3: number,
        cc4: boolean,
        ooo: {},
    }[],
    d: [
        { dd1: string, dd2?: boolean },
        { dd2: boolean, dd1?: string },
    ],
    e: {
        ee1:
            { eee1: number }[],
        ee2: {
            eee2: {
                eeee2: number,
            }[]
        }
    },
};

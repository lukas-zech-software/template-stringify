export interface TestInterface {
    a: number,
    b: {
        bb1: boolean
        bb2: string
    },
    c: number[],
    c2: { cc2: string }[],
    d: [
        { dd1: string },
        { dd2: boolean },
    ],
    e: {
        ee1: [
            { eee1: number },
        ],
        ee2: {
            eee2: {
                eeee2: number,
            }[]
        }
    },
};

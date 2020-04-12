export declare const xmlStyleReplacer: (index: number) => string;
export declare const matchNothing: Matcher;
export declare type Matcher = (input: string, replacer: (index: number) => string) => {
    from: string;
    to: string;
}[];
export declare const matcherMap: {
    [k: string]: Matcher;
};
export declare const replaceInterpolations: (input: string, matcher?: Matcher, replacer?: (index: number) => string) => {
    clean: string;
    replacements: {
        from: string;
        to: string;
    }[];
};
export declare const reInsertInterpolations: (clean: string, replacements: {
    from: string;
    to: string;
}[]) => string;

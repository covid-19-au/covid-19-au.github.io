import { TranslationService, TString } from '.';
export declare class DryRun implements TranslationService {
    name: string;
    initialize(): Promise<void>;
    supportsLanguage(): boolean;
    translateStrings(strings: TString[]): Promise<any[]>;
}

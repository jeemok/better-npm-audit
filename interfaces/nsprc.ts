export interface NsprcConfigs {
    readonly active?: boolean,
    readonly expiry?: number,
    readonly notes?: string,
};

export interface NsprcFile {
    readonly [key: string]: NsprcConfigs | string,
};
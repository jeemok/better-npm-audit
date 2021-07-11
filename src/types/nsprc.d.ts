export interface NsprcConfigs {
  readonly active?: boolean;
  readonly expiry?: string | number;
  readonly notes?: string;
}

export interface NsprcFile {
  readonly [key: string]: NsprcConfigs | string;
}

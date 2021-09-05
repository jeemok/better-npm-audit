import { AuditLevel, Severity } from './level';

export interface CommandOptions {
  readonly scanModules: true | false | 'true' | 'false';
  readonly level?: AuditLevel;
  readonly exclude?: string;
  readonly production?: boolean;
  readonly registry?: string;
  readonly debug?: boolean;
}

export interface ParsedCommandOptions {
  readonly scanModules: boolean;
  readonly level: AuditLevel;
  readonly exclude?: string;
  readonly production?: boolean;
  readonly registry?: string;
  readonly debug?: boolean;
}

export interface NpmAuditJson {
  readonly advisories?: v6Advisories;
  readonly vulnerabilities?: v7Vulnerabilities;
}

export interface v6Advisories {
  readonly [key: string]: v6Advisory;
}

export interface v6Advisory {
  readonly id: string;
  // eslint-disable-next-line camelcase
  readonly module_name: string;
  readonly title: string;
  readonly severity: AuditLevel;
  readonly url: string;
  readonly findings: {
    version: string;
    paths: string[];
  }[];
}

export interface v7Vulnerabilities {
  readonly [key: string]: v7Vulnerability;
}

export interface v7Vulnerability {
  readonly name: string;
  readonly via: (v7VulnerabilityVia | string)[];
  readonly nodes: string[];
}

export interface v7VulnerabilityVia {
  readonly source: number;
  readonly name: string;
  readonly title: string;
  readonly severity: Severity;
  readonly url: string;
  readonly range: string;
  readonly dependency: string;
}

export interface ProcessedResult {
  readonly unhandledIds: number[];
  readonly vulnerabilityIds: number[];
  readonly report: string[][];
  readonly failed?: boolean;
  readonly scanModules: ScanModulePayload[];
  readonly npmVersion?: 6 | 7;
}

export interface ProcessedReport {
  readonly exceptionIds: number[];
  readonly report: string[][];
}

export interface PackageFile {
  readonly version: string;
}

export interface v6Finding {
  readonly version: string;
  readonly paths: string[];
}

export interface ScanModulePayload {
  readonly id: number;
  readonly name: string;
  readonly nodes: string[];
  readonly findings: v6Finding[];
}

export interface ScanCallbackPayload {
  readonly scanReport: string[][];
  readonly securityReport: string[][];
  readonly unhandledIds: number[];
}

export interface FinalReport {
  readonly id: number;
  readonly name: string;
  readonly nodes: string[];
  readonly scanReport: string[][];
  readonly foundPackage: boolean;
  readonly shouldAutoExcept?: boolean;
  readonly usedFilePath?: string;
  readonly dependencyPaths?: string[];
}

export interface FinalReportProcessed {
  scanReport: string[][];
  result: FinalReportResult[];
}

export interface FinalReportResult {
  readonly id: number;
  readonly shouldExcept: boolean;
}

export interface NpmLsResponse {
  readonly path: string;
  readonly dependencies?: {
    [moduleName: string]: NpmLsResponse;
  };
}

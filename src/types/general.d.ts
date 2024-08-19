import { AuditLevel, Severity } from './level';

export interface CommandOptions {
  readonly exclude?: string;
  readonly moduleIgnore?: string;
  readonly production?: boolean;
  readonly level?: AuditLevel;
  readonly registry?: string;
}

export interface NpmAuditJson {
  readonly advisories?: v6Advisories;
  readonly vulnerabilities?: v7Vulnerabilities;
}

export interface v6Advisories {
  readonly [key: string]: v6Advisory;
}

export interface v6Advisory {
  readonly id: number;
  readonly cves: string[];
  readonly cwe: string;
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
  readonly [key: string]: v7Vulnerability | string;
}

export interface v7Vulnerability {
  readonly name: string;
  readonly via: v7VulnerabilityVia[] | string[];
  readonly nodes: string[];
  dev?: boolean;
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
  readonly unhandledIds: string[];
  readonly vulnerabilityIds: string[]; // Currently unused, but very valuable info so leave it here for now
  readonly vulnerabilityModules: string[]; // Currently unused, but very valuable info so leave it here for now
  readonly report: string[][];
  readonly failed?: boolean;
  unusedExceptionIds: string[];
  unusedExceptionModules: string[];
}

export interface ProcessedReport {
  readonly exceptionIds: string[];
  readonly report: string[][];
}

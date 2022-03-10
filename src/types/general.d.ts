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
  readonly [key: string]: v7Vulnerability | string;
}

export interface v7Vulnerability {
  readonly name: string;
  readonly via: v7VulnerabilityVia[] | string[];
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
  readonly vulnerabilityURLs: string[];
  readonly vulnerabilityModules: string[];
  readonly report: string[][];
  readonly failed?: boolean;
}

type VulnerabilityId = number | string;

export interface ProcessedReport {
  readonly exceptionIds: VulnerabilityId[];
  readonly report: string[][];
}

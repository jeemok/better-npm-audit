import { AuditLevel, Severity } from './level';

export interface CommandOptions {
  readonly exclude?: string;
  readonly json?: boolean;
  readonly maxExpiryDays?: number | string;
  readonly requireNotes?: boolean;
  readonly requireExpiry?: boolean;
  readonly moduleIgnore?: string;
  readonly production?: boolean;
  readonly skipOptional?: boolean;
  readonly level?: AuditLevel;
  readonly filterTable?: string | boolean;
  readonly registry?: string;
  readonly includeColumns?: string;
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
  readonly fixAvailable?: boolean | { readonly name: string; readonly version: string; readonly isSemVerMajor: boolean };
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

export interface ReportedVulnerability {
  readonly id: string;
  readonly module: string;
  readonly title: string;
  readonly paths: string[];
  readonly severity: string;
  readonly url: string;
  readonly fix: string;
  readonly excepted: boolean;
}

/** Extra data that some options need; each field is only filled in when it is used */
export interface AuditContext {
  /** `packages` of `package-lock.json`, used to find installed versions (`--module-ignore pkg@version`) */
  readonly lockfilePackages?: { readonly [path: string]: { readonly version?: string } };
}

export interface ProcessedResult {
  readonly unhandledIds: string[];
  readonly vulnerabilityIds: string[]; // Currently unused, but very valuable info so leave it here for now
  readonly vulnerabilityModules: string[]; // Currently unused, but very valuable info so leave it here for now
  readonly report: string[][];
  readonly vulnerabilities: ReportedVulnerability[]; // Every vulnerability found, unaffected by the table filters
  readonly failed?: boolean;
  unusedExceptionIds: string[];
  unusedExceptionModules: string[];
}

export interface ProcessedReport {
  readonly exceptionIds: string[];
  readonly report: string[][];
}

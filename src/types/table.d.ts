export type SecurityReportHeader = 'ID' | 'Module' | 'Title' | 'Paths' | 'Sev.' | 'URL' | 'Ex.' | 'Scan path(s)' | 'Found file(s)';
export type ExceptionReportHeader = 'ID' | 'Status' | 'Expiry' | 'Notes';
export type ScanReportHeader = ExceptionReportHeader | 'Version' | 'Module' | '.nsprc';

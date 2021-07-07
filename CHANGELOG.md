## 3.0.0

* TypeScript!
* Less bugs?
* Smaller package size (without building the test files into it)
* Should not have any breaking changes (Most of the test passed), but just in case, I've put it into a major version to continue
* Hope you all like it!
* [TODO:] `/interfaces` still gets build, somehow `exclude` in the config isn't working properly

---

## 2.0.5 (June 22, 2021)

* Removed unused packages from dependencies list
* Added nodejs v16.x coverage in CI

## 2.0.4 (June 22, 2021)

### Notable changes

* Simplified the workflow and improved overall performance by running lesser in the process.
* Added [`table`](https://www.npmjs.com/package/table) module to display summaries (Initially used [`cli-table`](https://www.npmjs.com/package/cli-table) for its small size, however the issues in the repo concerns me in its display quality in other OS. Hence, chosen `table` module despite its package size is much bigger)
* Added table display for security report
* Added table display of exceptions from `.nsprc` file
* Cleaned up test cases structure to be more straight forward and easier to maintain

### Breaking changes

* Renamed `--ignore -i` flag to `--exclude -x` for better clarity.
* Removed `--display-full` flag that was used to ignore the maximum display limit. Now with the summary table it would be unlikely to display large size of information.
* Removed `--display-notes` flag that was used for displaying exception notes. Now it is included in the exceptions table.
* Renamed `ignore` field to `active` in `.nsprc` file for better clarity.
* Renamed `reason` field to `notes` in `.nsprc` file for better clarity.

### Others

* Removed logging of flags used in the command
* Added NPM audit into the CI pipeline
* Added `.github/FUNDING.yml`
* Updated `README.md`

### Closed issues

* [#20](https://github.com/jeemok/better-npm-audit/issues/20) Provide more output when parsing exceptions file
* [#27](https://github.com/jeemok/better-npm-audit/issues/27) Hide excepted vulnerabilities from output
* [#28](https://github.com/jeemok/better-npm-audit/issues/28) Missing [ in truncation message

---

## 1.12.1 (June 21, 2021)

* Added `FUNDING.yml`
* Updated `README.md`

## 1.12.0 (June 18, 2021)

* [#38](https://github.com/jeemok/better-npm-audit/pull/38) Display warning when `exceptionIds` are unused

## 1.11.2 (June 11, 2021)

* [#37](https://github.com/jeemok/better-npm-audit/pull/37) Fixed security CVE-2020-28469: Bump glob-parent from 5.1.1 to 5.1.2

## 1.11.1 (June 11, 2021)

* Updated `README.md`

## 1.11.0 (June 11, 2021)

* [#36](https://github.com/jeemok/better-npm-audit/pull/36) Added environment variable support `process.env.NPM_CONFIG_AUDIT_LEVEL` to set the audit level

## 1.10.1 (June 7, 2021)

* Updated `--full` flag logging from `[full log mode enabled]` to `[report display limit disabled]`
* [#32](https://github.com/jeemok/better-npm-audit/issues/32) Added new flag `--display-notes` to display reasons for the exceptions

## 1.9.3 (June 6, 2021)

* [#31](https://github.com/jeemok/better-npm-audit/issues/31) Added `CHANGELOG.md`
* Updated `README.md`
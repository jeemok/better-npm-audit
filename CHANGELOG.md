## Next: 2.0.0-rc

### Notable changes

* Simplified the workflow and improved overall performance by running less.
    * Reduce code size and package size in half (! 
* Added own table display for security report
* Added table overview of exceptions from `.nsprc` file

### Breaking changes

* Renamed `ignore` field to `active` in `.nsprc` file for better clarity.
* Renamed `reason` field to `notes` in `.nsprc` file for better clarity.
* Removed `--display-full` flag that was used to ignore the maximum display limit. Now with the summary table it would be unlikely to display large size of information.
* Removed `--display-notes` flag that was used for displaying exception notes. Now it is included in the exceptions table.

### Others

* Removed logging of flags used
* Added npm audit into CI pipeline
* Added FUNDING.md
* Updated README.md

## Closed issues

* # []()

---

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
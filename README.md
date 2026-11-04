# Better NPM Audit

The goal of this project is to provide additional features on top of the existing npm audit options. We hope to encourage more people to do security audits for their projects.

[![NPM](https://nodei.co/npm/better-npm-audit.png)](https://npmjs.org/package/better-npm-audit)

![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square) ![npm downloads](https://img.shields.io/npm/d18m/better-npm-audit) ![node current](https://img.shields.io/node/v/better-npm-audit) ![node support](https://img.shields.io/badge/node-14.6%2B-brightgreen) ![npm vulnerability](https://snyk.io/test/github/jeemok/better-npm-audit/badge.svg?targetFile=package.json) ![GitHub issues](https://img.shields.io/github/issues/jeemok/better-npm-audit?style=flat-square) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/better-npm-audit?style=flat-square) ![Languages](https://img.shields.io/github/languages/top/jeemok/better-npm-audit?style=flat-square)

## NPM version 6 and 7, and 8

NPM has upgraded to version 7 in late 2020 and has breaking changes on the `npm audit`. The output of npm audit has significantly changed both in the human-readable and `--json` output styles. Even more unfortunately, when NPM changed the JSON output in npm v7, they removed many of the other useful identifiers (`cves`, `cwe`, `github_advisory_id`) and the only thing left is the URL. We are trying our best to handle each version and provide consistent functionality to all of them. Related docs on v6 and v7 changes:

| Docs                       | Link                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| NPM v6 & v7 changes        | https://github.blog/2020-10-13-presenting-v7-0-0-of-the-npm-cli/                           |
| NPM v7 blog post           | https://blog.npmjs.org/post/626173315965468672/npm-v7-series-beta-release-and-semver-major |
| Official NPM v6 audit docs | https://docs.npmjs.com/cli/v6/commands/npm-audit                                           |
| Official NPM v7 audit docs | https://docs.npmjs.com/cli/v7/commands/npm-audit                                           |
| Dealing with new npm audit | https://uko.codes/dealing-with-npm-v7-audit-changes                                        |

You may find the sample JSON outputs for each NPM versions in our codebase: [v6](https://github.com/jeemok/better-npm-audit/blob/master/test/__mocks__/v6-json-buffer.json), [v7](https://github.com/jeemok/better-npm-audit/blob/master/test/__mocks__/v7-json-buffer.json) & [v8](https://github.com/jeemok/better-npm-audit/blob/master/test/__mocks__/v8-json-buffer.json).

<br />

## Version support

| Version | Node.js        | Status                              | Install                                  |
| ------- | -------------- | ----------------------------------- | ---------------------------------------- |
| 4.x     | 18 or later    | Active: new features and fixes      | `npm i better-npm-audit@next` (will become `latest`) |
| 3.x     | 14.6 or later  | Maintenance: security and critical fixes only | `npm i better-npm-audit@3`               |
| 2.x and older | -        | End of life, no fixes               | -                                        |

**What is different between 3.x and 4.x?** Only the supported Node.js versions. Version 4.0.0 has the same features and fixes as 3.13.0, and drops Node.js 14 - 16 (both are end-of-life upstream), which lets the project use current tooling and dependencies. New features land in 4.x only.

**End of life for 3.x:** version 3 will receive security fixes until six months after 4.x becomes the `latest` release on npm, and then reach end of life. Please plan to upgrade to Node.js 18+ and 4.x before then.

Moving from 3.x to 4.x only requires Node.js 18 or later. See the [changelog](https://github.com/jeemok/better-npm-audit/blob/master/CHANGELOG.md) for details.

<br />

## Installation

    $ npm install --save better-npm-audit

or

    $ npm install -g better-npm-audit

or run it without installing

    $ npx better-npm-audit audit

Requires Node.js 14.6 or later. Version 4 requires Node.js 18 or later.

<br />

## Usage

### Run global

```bash
better-npm-audit audit
```

### Run with exceptions

<img src="./.README/all_good.png" alt="Demo of table displaying the security report" />

Unhandled or newly reported vulnerabilities will be highlighted:

<img src="./.README/highlighted_exceptions.png" alt="Demo of table displaying the security report" />

Unused exceptions will be notified:

<img src="./.README/unused_exception.png" alt="Demo of displaying the unused exception" />

### Add into package scripts

```JSON
{
  "scripts": {
    "prepush": "npm run test && npm run audit",
    "audit": "better-npm-audit audit"
  }
}
```

Now you can run locally or in your CI pipeline:

```bash
npm run audit
```

### Filter vulnerability table

You can filter the vulnerability table to show only vulnerabilities at or above a specified severity level using the `--filter-table` flag. This is useful for reducing noise in the output while maintaining the original audit behavior for exit codes.

```bash
# Filter table to show only high and critical vulnerabilities
better-npm-audit audit --filter-table high

# Filter table to match the audit level
better-npm-audit audit --level moderate --filter-table

# Set different levels for exit behavior vs table display
better-npm-audit audit --level high --filter-table moderate
```

**Note:** The `--filter-table` flag only affects what vulnerabilities are displayed in the table. The audit level (`--level`) still controls the exit behavior and vulnerability counting.

<br />

## Options

| Flag                | Short | Description                                                                                           |
| ------------------- | ----- | ----------------------------------------------------------------------------------------------------- |
| `--exclude`         | `-x`  | Exceptions or the vulnerabilities ID(s) to exclude; the ID can be the numeric ID, CVE, CWE or GHSA ID |
| `--module-ignore`   | `-m`  | Names of modules to exclude; supports `*` wildcards, e.g. `@myscope/*`                                                                           |
| `--level`           | `-l`  | The minimum audit level to validate; Same as the original `--audit-level` flag                        |
| `--filter-table`    | `-f`  | Filter the vulnerability table to show only vulnerabilities at or above the specified level. Accepts a level (`info`, `low`, `moderate`, `high`, `critical`) or can be used as a boolean flag to filter by the audit level |
| `--production`      | `-p`  | Skip the `devDependencies`                                                                            |
| `--skip-optional`   |       | Skip the `optionalDependencies`                                                                       |
| `--registry`        | `-r`  | The npm registry url to use                                                                           |
| `--include-columns` | `-i`  | Columns to include in report. Available columns: `ID`, `Module`, `Title`, `Paths`, `Severity`, `URL`, `Fix` (opt-in; `Yes`, `Major` or `No`, `N/A` on npm v6), `Ex.` (e.g. `-i Module,Title,Severity`) |
| `--require-notes`   |       | Fail if any `.nsprc` exclusion has no notes (also fails when `--exclude` is used, as it cannot carry notes) |
| `--require-expiry`  |       | Fail if any `.nsprc` exclusion has no expiry date (also fails when `--exclude` is used) |
| `--max-expiry-days` |       | Fail if any `.nsprc` exclusion expires more than this many days from today |

<br />

## Environment Variables

| Variable                 | Description                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `NO_COLOR`               | Support the [no-color standard](https://no-color.org/) to allow users use the tool without colored output.                 |
| `NPM_CONFIG_AUDIT_LEVEL` | Used in setting the audit level. <br /> _Note: this will be disregard if the audit level flag is passed onto the command._ |

<br />

## Using `.nsprc` file to manage exceptions

You may add a file `.nsprc` to your project root directory to manage the exceptions. The file can be written as JSON or YAML (`.nsprc` is read as YAML, which also accepts JSON). For example:

```json
{
  "1337": {
    "active": true,
    "notes": "Ignored since we don't use xxx method",
    "expiry": 1615462134681
  },
  "4501": {
    "active": false,
    "notes": "Ignored since we don't use xxx method"
  },
  "CWE-471": "CWE ID is acceptable",
  "GHSA-ww39-953v-wcq6": "GHSA ID is acceptable",
  "https://npmjs.com/advisories/1213": "Full or partial URL is acceptable too"
}
```

The same exceptions in YAML:

```yaml
'1337':
  active: true
  notes: Ignored since we don't use xxx method
  expiry: '2025-12-31'
CWE-471: CWE ID is acceptable
```

### Fields

| Attribute | Type             | Description                                               | Default | Examples                                                                                                                                                                                                                                                                                                                     |
| --------- | ---------------- | --------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `active`  | Boolean          | If the tool should use it for exception                   | `true`  | `true`                                                                                                                                                                                                                                                                                                                       |
| `expiry`  | String \| Number | Human-readable date, or milliseconds since the UNIX Epoch |         | - `'2020-01-31'` <br> - `'2020/01/31'` <br> - `'01/31/2021, 11:03:58'` <br> - `'1 March 2016 15:00'` <br> - `'1 March 2016 3:00 pm'` <br> - `'2012-01-26T13:51:50.417-07:00'` <br> - `'Sun, 11 Jul 2021 03:03:13 GMT'` <br> - `'Thu Jan 26 2017 11:00:00 GMT+1100 (Australian Eastern Daylight Time)'` <br> - `327611110417` |
| `notes`   | String           | Notes related to the vulnerability.                       |         |

<br />

When using a `.nsprc` file, a report will be displayed when it starts running:

<img src="./.README/exceptions_table.png" alt="Demo of table displaying a list of exceptions" />

> Note: the expiry date will be styled in yellow and red color if it is detected more than one or five years ago.

<br />

## Changelog

You can find the changelog [here](https://github.com/jeemok/better-npm-audit/blob/master/CHANGELOG.md).

<br />

## Contributors

[Ian Wright](https://github.com/IPWright83), [Edwin Taylor](https://github.com/alertme-edwin), [Maarten Hus](https://github.com/MrHus), [Alex Burkowsky](https://github.com/alexburkowskypolysign), [David M. Lee](https://github.com/leedm777), [Kyle Clark](https://github.com/kyle-clark1824), [Guillermo Pincay](https://github.com/guillermaster), [Grzegorz Pawłowski](https://github.com/GrzesiekP), [CSLTech](https://github.com/CSLTech), [Paul Clarkin](https://github.com/paulclarkin), [mgdodge](https://github.com/mgdodge), [Ricky Sullivan](https://github.com/rickysullivan), [Sam Gregory](https://github.com/samgregory88), [Tristan WAGNER](https://github.com/tristanwagner), [Zak](https://github.com/ZedLove), [Eric Cornelissen](https://github.com/ericcornelissen), [Gaurav Chinavle](https://github.com/GauravChinavle), [WhittJS](https://github.com/WhittJS), [Suraj Balwani](https://github.com/surajbalwani), [BL4CK570RM](https://github.com/BL4CK570RM), [PersonligaPersson](https://github.com/PersonligaPersson), [FreddieDev](https://github.com/FreddieDev)

<br />

---

If you like this project,

<a href="https://www.buymeacoffee.com/jeemok" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

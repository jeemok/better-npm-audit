# Better NPM Audit

`npm audit` fails your build on every known vulnerability, including the ones you have already reviewed and can't fix yet. `better-npm-audit` wraps `npm audit` (and `pnpm audit`) so you can accept a vulnerability with a reason and an expiry date, and the build only fails on what is new.

[![npm version](https://img.shields.io/npm/v/better-npm-audit?style=flat-square)](https://www.npmjs.com/package/better-npm-audit) [![npm downloads](https://img.shields.io/npm/dm/better-npm-audit?style=flat-square)](https://www.npmjs.com/package/better-npm-audit) [![CI](https://img.shields.io/github/actions/workflow/status/jeemok/better-npm-audit/node.js.yml?branch=master&style=flat-square)](https://github.com/jeemok/better-npm-audit/actions/workflows/node.js.yml) ![node support](https://img.shields.io/badge/node-18%20%7C%2020%20%7C%2022%20%7C%2024-brightgreen?style=flat-square) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)

- Accept a vulnerability by ID, module name (with wildcards or a version range) or dependency tree, with notes and an expiry date
- Fail only on vulnerabilities at or above a severity level
- Machine-readable `--json` output and stable exit codes, for CI and AI agents
- Works with npm and pnpm

## Quick start

```bash
npx better-npm-audit audit
```

Or add it to your project, so it runs in your CI:

```bash
npm install --save-dev better-npm-audit
```

```json
{
  "scripts": {
    "audit": "better-npm-audit audit"
  }
}
```

`npm run audit` exits `0` when nothing unhandled is found at or above `--level` (default `info`), and `1` otherwise. To accept a vulnerability you have reviewed, add its ID to a [`.nsprc` file](#managing-exceptions-with-nsprc) with a note and an expiry, or ignore a module with `-m`. You can also install it globally (`npm install -g better-npm-audit`).

Requires Node.js 18 or later. On Node.js 14.6 - 16, use version 3: see [Version support](#version-support).

<br />

## What it looks like

<img src="./.README/all_good.png" alt="Demo of table displaying the security report" />

Unhandled or newly reported vulnerabilities will be highlighted:

<img src="./.README/highlighted_exceptions.png" alt="Demo of table displaying the security report" />

Unused exceptions will be notified:

<img src="./.README/unused_exception.png" alt="Demo of displaying the unused exception" />

<br />

## Managing exceptions with `.nsprc`

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

### Generating exceptions with JavaScript

Instead of a static `.nsprc`, you can put a `.nsprc.cjs` (or `.nsprc.js`) file in your project root. It exports an object with the same structure, or a function (sync or async) that returns one, so you can build the exceptions from an API or another file:

```js
// .nsprc.cjs
module.exports = async () => {
  const response = await fetch('https://example.com/approved-advisories.json');
  return await response.json(); // { "1337": { "notes": "...", "expiry": "2026-12-31" }, ... }
};
```

If both exist, the JavaScript file wins and `.nsprc` is ignored. The file is run with your user's permissions, so only use it in a project you trust. If it throws, or doesn't return an object, the audit exits with an error.

### Fields

| Attribute | Type             | Description                                               | Default | Examples                                                                                                                                                                                                                                                                                                                     |
| --------- | ---------------- | --------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `active`  | Boolean          | If the tool should use it for exception                   | `true`  | `true`                                                                                                                                                                                                                                                                                                                       |
| `expiry`  | String \| Number | Human-readable date string, or a UNIX timestamp in seconds or milliseconds |         | - `"2020-01-31"` <br> - `"2020/01/31"` <br> - `"01/31/2021, 11:03:58"` <br> - `"1 March 2016 15:00"` <br> - `"1 March 2016 3:00 pm"` <br> - `"2012-01-26T13:51:50.417-07:00"` <br> - `"Sun, 11 Jul 2021 03:03:13 GMT"` <br> - `"Thu Jan 26 2017 11:00:00 GMT+1100 (Australian Eastern Daylight Time)"` <br> - `1615462134681` |
| `notes`   | String           | Notes related to the vulnerability.                       |         |

> Note: the `expiry` examples above are shown as JSON, so date strings must be double-quoted (YAML is more relaxed, e.g. `expiry: '2025-12-31'`). A number is read as seconds since the epoch if it is below 100 billion (any 10-digit Unix timestamp), and as milliseconds otherwise (13 digits). Before 4.2.0, numbers were always read as milliseconds.

<br />

When using a `.nsprc` file, a report will be displayed when it starts running:

<img src="./.README/exceptions_table.png" alt="Demo of table displaying a list of exceptions" />

> Note: the expiry date will be styled in yellow and red color if it is detected more than one or five years ago.

<br />

## Usage

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

### Ignore a module at a specific version

`--module-ignore` accepts a version or semver range after the name, so the ignore stops applying when you upgrade:

```bash
better-npm-audit audit -m lodash@4.17.20,@myscope/*@^2.0.0
```

The ignore applies only if **every** installed copy of the vulnerable module satisfies the range. The installed versions come from the audit report on npm 6 and pnpm, and from `package-lock.json` on npm 7+ (lockfile version 2 or 3). If a version can't be determined, the ignore is not applied and it is listed as an unused exception.

### Ignore a package and its dependencies

`--ignore-dependencies-of` ignores a package and the vulnerable modules that it brings in, for example a build tool you've judged safe:

```bash
better-npm-audit audit --ignore-dependencies-of node-sass
```

A vulnerable module is ignored only if **every** way it is installed goes through one of the named packages. If your project also depends on it directly, or through another package, it is still reported. The package itself is ignored too. Names can use `*` wildcards and be comma separated; versions (as in `--module-ignore`) are not supported here. It does not appear in the unused exceptions message when nothing matches, so check the table after you add it.

### Production or dev dependency

Add the `Scope` column to see whether each vulnerability is reachable from your production dependencies (`prod`) or only from `devDependencies` (`dev`):

```bash
better-npm-audit audit --include-columns Module,Severity,Scope
```

To work this out, the tool runs a second audit with `--omit=dev` (`--prod` on pnpm) and marks everything that appears in it as `prod`. That doubles the audit time, which is why the column is opt-in. With `--production` every vulnerability is `prod` and no second audit runs. The scope is also in the `--json` output.

### JSON output

Use `--json` to get the result as a single JSON document on stdout, for example to feed a dashboard or another script. The table and all other messages go to stderr, and the exit code is unchanged (`1` if there are unhandled vulnerabilities, otherwise `0`).

```bash
better-npm-audit audit --json > audit.json
better-npm-audit audit --json 2>/dev/null | jq '.summary'
```

```json
{
  "passed": false,
  "auditLevel": "info",
  "summary": { "total": 2, "unhandled": 1, "bySeverity": { "moderate": 1, "critical": 1 } },
  "unhandledIds": ["1097677"],
  "unusedExceptionIds": [],
  "unusedExceptionModules": [],
  "vulnerabilities": [
    {
      "id": "1097677",
      "module": "minimist",
      "title": "Prototype Pollution in minimist",
      "paths": ["minimist"],
      "severity": "critical",
      "url": "https://github.com/advisories/GHSA-xvch-5gv4-984h",
      "fix": "Major",
      "excepted": false
    }
  ]
}
```

`vulnerabilities` always lists everything found; `--filter-table` and `--include-columns` only affect the table. If the audit output can't be processed, the document is `{ "passed": false, "error": "..." }` and the exit code is `1`.

### Using it from scripts and AI agents

Everything an agent needs is in `--json`, the exit code and `--help`:

```bash
better-npm-audit audit --json -l high 2>/dev/null
```

- **Exit code:** `0` means nothing unhandled at or above `--level`; `1` means unhandled vulnerabilities, or the audit could not run (no lockfile, registry unreachable, invalid config).
- **stdout** has one JSON document and nothing else; the table and messages are on stderr. Read `passed` first, then `unhandledIds`. A failure to audit is `{ "passed": false, "error": "..." }`.
- **Each vulnerability** has `id`, `module`, `title`, `paths`, `severity`, `url`, `fix` (`Yes`, `Major`, `No`, `N/A`), `scope` (`prod`, `dev`, or `N/A`; add `-i Scope` to fill it) and `excepted`. `fix: "Yes"` means `npm audit fix` can resolve it, `Major` means it needs a breaking upgrade.
- **Triage order:** fix what you can (`fix` is `Yes`), then decide on the rest. Ignore a finding only when you know it doesn't apply, and record why in `.nsprc` with `notes` and an `expiry` (`--require-notes --require-expiry` makes the audit fail when they're missing). Prefer `-m pkg@version` over `-m pkg` so the ignore ends when the package changes.
- **Don't** put exceptions on the command line (`-x`, `-m`) for anything that should last: they leave no note or expiry. Edit `.nsprc` (or `.nsprc.cjs`) instead.
- Run `better-npm-audit audit --help` for the current flags. A short machine-readable summary of this section is in [`llms.txt`](https://github.com/jeemok/better-npm-audit/blob/master/llms.txt).

### pnpm

If your project has a `pnpm-lock.yaml` and no `package-lock.json`, `better-npm-audit` runs `pnpm audit` instead of `npm audit`, and everything else (exceptions, `--level`, `--json`, ...) works the same. `pnpm` must be installed. To choose explicitly, use `--package-manager pnpm` (or `npm`). `--production` becomes `--prod` and `--skip-optional` becomes `--no-optional`. This was tested with pnpm 10; Yarn is not supported.

<br />

## Options

| Flag                | Short | Description                                                                                           |
| ------------------- | ----- | ----------------------------------------------------------------------------------------------------- |
| `--exclude`         | `-x`  | Exceptions or the vulnerabilities ID(s) to exclude; the ID can be the numeric ID, CVE, CWE or GHSA ID |
| `--module-ignore`   | `-m`  | Names of modules to exclude; supports `*` wildcards, e.g. `@myscope/*`, and an installed version or range, e.g. `lodash@4.17.20` (see below)                                                                           |
| `--ignore-dependencies-of` |  | Ignore vulnerabilities in modules that are only installed through these packages (see below); supports `*` wildcards |
| `--level`           | `-l`  | The minimum audit level to validate; Same as the original `--audit-level` flag                        |
| `--filter-table`    | `-f`  | Filter the vulnerability table to show only vulnerabilities at or above the specified level. Accepts a level (`info`, `low`, `moderate`, `high`, `critical`) or can be used as a boolean flag to filter by the audit level |
| `--production`      | `-p`  | Skip the `devDependencies`                                                                            |
| `--skip-optional`   |       | Skip the `optionalDependencies`                                                                       |
| `--json`            |       | Print the result as JSON on stdout; the table and other messages go to stderr |
| `--package-manager` |       | `npm` or `pnpm`; detected from the lockfile by default |
| `--registry`        | `-r`  | The npm registry url to use                                                                           |
| `--include-columns` | `-i`  | Columns to include in report. Available columns: `ID`, `Module`, `Title`, `Paths`, `Severity`, `URL`, `Fix` (opt-in; `Yes`, `Major` or `No`, `N/A` on npm v6), `Scope` (opt-in; `prod` or `dev`, see below), `Ex.` (e.g. `-i Module,Title,Severity`) |
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

## Version support

| Version       | Node.js       | Status                                                          | Install                           |
| ------------- | ------------- | --------------------------------------------------------------- | --------------------------------- |
| 4.x           | 18 or later   | **Current.** New features and fixes. This is the `latest` release | `npm i better-npm-audit`          |
| 3.x           | 14.6 or later | Maintenance: security and critical fixes only, until May 2027   | `npm i better-npm-audit@3`        |
| 2.x and older | -             | End of life, no fixes                                           | -                                 |

### Should I use 4.x?

Yes, if you run Node.js 18 or later (check with `node -v`). 4.x is where all development happens and it is what `npm i better-npm-audit` installs.

If you are on Node.js 14.6 - 16, pin version 3 so you don't get 4.x by accident, for example `npm i -D better-npm-audit@3` or `npx better-npm-audit@3 audit`. Node.js 14 and 16 are end-of-life upstream, so we recommend upgrading Node.js.

### What changed from 3.x to 4.x?

**Breaking:** 4.x requires Node.js 18 or later. That is the only breaking change. Flags, the `.nsprc` format, output and exit codes are the same as in 3.13.1, so upgrading is a matter of updating Node.js and the version in your `package.json` or CI script.

**Only in 4.x** (3.x will not get these):

| Since | Feature                                                                                      |
| ----- | -------------------------------------------------------------------------------------------- |
| 4.1.0 | `--json` output                                                                              |
| 4.1.0 | pnpm support (`pnpm audit`, detected from the lockfile)                                      |
| 4.1.0 | JavaScript exceptions config (`.nsprc.cjs` / `.nsprc.js`)                                    |
| 4.1.0 | `--module-ignore pkg@version`, `--ignore-dependencies-of`, and the `Scope` column            |

3.13 and 4.0 have the same features: YAML `.nsprc`, `--filter-table`, `--skip-optional`, `--module-ignore` wildcards, the `Fix` column and the exception policy flags (`--require-notes`, `--require-expiry`, `--max-expiry-days`). The [changelog](https://github.com/jeemok/better-npm-audit/blob/master/CHANGELOG.md) has the full list.

### End of life for 3.x

Version 3 gets security and critical fixes until **May 2027**, six months after 4.x became `latest` on npm (November 2026). After that it is end of life and the `v3` branch is archived. Please plan to move to Node.js 18+ and 4.x before then.

<br />

## npm audit formats

npm 7 (2020) changed the `npm audit` output, in both the table and `--json`, and dropped identifiers such as `cves`, `cwe` and `github_advisory_id`, leaving mostly the advisory URL. `better-npm-audit` reads both formats: v6 (`advisories`) and v7 and later (`vulnerabilities`), plus the v6-style output of `pnpm audit`. CI runs the tests and a real audit against the latest npm on every change, so a new npm release that changes the output shows up quickly.

| Docs                       | Link                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| npm 7 release notes        | https://github.blog/2020-10-13-presenting-v7-0-0-of-the-npm-cli/            |
| Official `npm audit` docs  | https://docs.npmjs.com/cli/commands/npm-audit                                |

Sample JSON outputs of each format are in the codebase: [v6](https://github.com/jeemok/better-npm-audit/blob/master/test/__mocks__/v6-json-buffer.json), [v7](https://github.com/jeemok/better-npm-audit/blob/master/test/__mocks__/v7-json-buffer.json), [v8](https://github.com/jeemok/better-npm-audit/blob/master/test/__mocks__/v8-json-buffer.json) and [pnpm](https://github.com/jeemok/better-npm-audit/blob/master/test/__mocks__/pnpm-json-buffer.json).

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

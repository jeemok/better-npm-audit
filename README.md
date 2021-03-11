# Better NPM Audit

Made to allow skipping certain vulnerabilities, and any extra handling that are not supported by the default `npm audit` in the future.

[![NPM](https://nodei.co/npm/better-npm-audit.png)](https://npmjs.org/package/better-npm-audit)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com) ![GitHub issues](https://img.shields.io/github/issues/jeemok/better-npm-audit?style=flat-square) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/better-npm-audit?style=flat-square)

## Supports both NPM version 6 and 7

NPM has upgraded to version 7 in late 2020 and has breaking changes on the `npm audit`. The output of npm audit has significantly changed both in the human-readable and --json output styles. We have added handling so it works properly in both npm versions.

| Docs  | Link  |
| --    | --    |
| NPM v6 & v7 changes | https://github.blog/|2020-10-13-presenting-v7-0-0-of-the-npm-cli/
| NPM v7 blog post | https://blog.npmjs.org/post/626173315965468672/|npm-v7-series-beta-release-and-semver-major
| Official NPM v6 audit docs | https://docs.npmjs.com/cli/v6/commands/npm-audit|
| Official NPM v7 audit docs | https://docs.npmjs.com/cli/v7/commands/npm-audit|
| Dealing with new npm audit | https://uko.codes/dealing-with-npm-v7-audit-changes | 

---

## Installation

    $ npm install better-npm-audit

or

    $ npm install -g better-npm-audit

## Usage

### `package.json`

```JSON
{
  "scripts": {
    "prepush": "npm run test && npm run audit",
    "audit": "node node_modules/better-npm-audit audit"
  }
}
```

### Run global

```bash
better-npm-audit audit
```

## Using file to manage exception

You may add a file `.nsprc` to your project root directory to manage the exceptions. For example:

```json
{
    "1337": {
        "ignore": true,
        "reason": "Ignored since we don't use xxx method",
        "expiry": 1615462134681
    },
    "4501": {
        "ignore": false,
        "reason": "Ignored since we don't use xxx method"
    },
    "980": "Ignored since we don't use xxx method",
    "Note": "Any non number key will be ignored"
}
```

## Command flags

#### Ignore certain vulnerabilities

For skipping certain advisories, you can use `-i` or verbose `--ignore` flags

```bash
node node_modules/better-npm-audit audit -i 118,577
```

#### Display full report

To avoid waterfall logging on your console screen, there is a character limit set to the output. To view the full audit logs, you can use `-f` or verbose `--full` flags

```bash
node node_modules/better-npm-audit audit -f
```

#### Minimum audit level (`--audit-level`)

Fail an audit only if the results include a vulnerability with a level of moderate or higher:

```bash
node node_modules/better-npm-audit audit -l critical
```

#### Production mode (`--production`)

Skip checking `devDependencies`

```bash
node node_modules/better-npm-audit audit -p
```

## Examples

Running `node node_modules/better-npm-audit audit` with vulnerabilities, will receive the error:

```bash
Error: 2 vulnerabilities found. Node security advisories: 118,577
    at Socket.audit.stdout.on.data (C:\Users\user\project\node_modules\better-npm-audit\index.js:51:15)
    at emitOne (events.js:121:20)
    at Socket.emit (events.js:211:7)
    at addChunk (_stream_readable.js:263:12)
    at readableAddChunk (_stream_readable.js:246:13)
    at Socket.Readable.push (_stream_readable.js:208:10)
    at Pipe.onread (net.js:594:20)
```

Added the ignore flags `node node_modules/better-npm-audit audit -i 118,577` and rerun:

```bash
Executing script: audit

to be executed: "node node_modules/better-npm-audit audit -i 118,577"
Exception Vulnerabilities IDs:  [ '118', '577' ]
=== npm audit security report ===


                                 Manual Review
             Some vulnerabilities require your attention to resolve

          Visit https://go.npm.me/audit-guide for additional guidance


  High            Regular Expression Denial of Service

  Package         minimatch

  Patched in      >=3.0.2

  Dependency of   semantic-ui

  Path            semantic-ui > gulp > vinyl-fs > glob-stream > glob >
                  minimatch

  More info       https://nodesecurity.io/advisories/118


  High            Regular Expression Denial of Service

  Package         minimatch

  Patched in      >=3.0.2

  Dependency of   semantic-ui

  Path            semantic-ui > gulp > vinyl-fs > glob-stream > minimatch

  More info       https://nodesecurity.io/advisories/118


  High            Regular Expression Denial of Service

  Package         minimatch

  Patched in      >=3.0.2

  Dependency of   semantic-ui

  Path            semantic-ui > gulp > vinyl-fs > glob-watcher > gaze >
                  globule > glob > minimatch

  More info       https://nodesecurity.io/advisories/118


  High            Regular Expression Denial of Service

  Package         minimatch

  Patched in      >=3.0.2

  Dependency of   semantic-ui

  Path            semantic-ui > gulp > vinyl-fs > glob-watcher > gaze >
                  globule > minimatch

  More info       https://nodesecurity.io/advisories/118


  Low             Prototype Pollution

  Package         lodash

  Patched in      >=4.17.5

  Dependency of   semantic-ui

  Path            semantic-ui > gulp > vinyl-fs > glob-watcher > gaze >
                  globule > lodash

  More info       https://nodesecurity.io/advisories/577

found 5 vulnerabilities (1 low, 4 high) in 30441 scanned packages
  5 vulnerabilities require manual review. See the full report for details.

🤝  All good
```

**NPM v7**

```bash
# npm audit report

bl  <=1.2.2 || 2.0.1 - 2.2.0 || 3.0.0 || 4.0.0 - 4.0.2
Severity: high
Remote Memory Exposure - https://npmjs.com/advisories/1555
fix available via `npm audit fix`
node_modules/bl

dot-prop  <4.2.1 || >=5.0.0 <5.1.1
Severity: high
Prototype Pollution - https://npmjs.com/advisories/1213
fix available via `npm audit fix`
node_modules/dot-prop

ini  <1.3.6
Prototype Pollution - https://npmjs.com/advisories/1589
fix available via `npm audit fix`
node_modules/fsevents/node_modules/ini
node_modules/ini

lodash  <4.17.19
Prototype Pollution - https://npmjs.com/advisories/1523
fix available via `npm audit fix`
node_modules/lodash

mem  <4.0.0
Denial of Service - https://npmjs.com/advisories/1084
fix available via `npm audit fix`
node_modules/loopback-connector-rest/node_modules/mem
  os-locale  2.0.0 - 3.0.0
  Depends on vulnerable versions of mem
  node_modules/loopback-connector-rest/node_modules/os-locale
    strong-globalize  2.8.4 || 2.10.0 - 4.1.1
    Depends on vulnerable versions of os-locale
    node_modules/loopback-connector-rest/node_modules/strong-globalize

minimist  <0.2.1 || >=1.0.0 <1.2.3
Prototype Pollution - https://npmjs.com/advisories/1179
fix available via `npm audit fix`
node_modules/mocha/node_modules/minimist
  mkdirp  0.4.1 - 0.5.1
  Depends on vulnerable versions of minimist
  node_modules/mocha/node_modules/mkdirp
    mocha  1.21.5 - 6.2.2 || 7.0.0-esm1 - 7.1.0
    Depends on vulnerable versions of mkdirp
    Depends on vulnerable versions of yargs-parser
    Depends on vulnerable versions of yargs-unparser
    node_modules/mocha

node-fetch  <=2.6.0 || 3.0.0-beta.1 - 3.0.0-beta.8
Denial of Service - https://npmjs.com/advisories/1556
fix available via `npm audit fix`
node_modules/node-fetch
  cross-fetch  <=3.0.5
  Depends on vulnerable versions of node-fetch
  node_modules/cross-fetch
    swagger-client  3.3.2 - 3.10.1 || 3.10.9 - 3.10.11
    Depends on vulnerable versions of cross-fetch
    node_modules/swagger-client

swagger-ui  <=3.20.8
Severity: moderate
Reverse Tabnapping - https://npmjs.com/advisories/975
Cross-Site Scripting - https://npmjs.com/advisories/976
Cross-Site Scripting - https://npmjs.com/advisories/985
fix available via `npm audit fix --force`
Will install loopback-component-explorer@2.7.0, which is a breaking change
node_modules/swagger-ui
  loopback-component-explorer  >=3.0.0
  Depends on vulnerable versions of swagger-ui
  node_modules/loopback-component-explorer

yargs-parser  <=13.1.1 || 14.0.0 - 15.0.0 || 16.0.0 - 18.1.1
Prototype Pollution - https://npmjs.com/advisories/1500
fix available via `npm audit fix`
node_modules/mocha/node_modules/yargs-parser
node_modules/yargs-unparser/node_modules/yargs-parser
  mocha  1.21.5 - 6.2.2 || 7.0.0-esm1 - 7.1.0
  Depends on vulnerable versions of mkdirp
  Depends on vulnerable versions of yargs-parser
  Depends on vulnerable versions of yargs-unparser
  node_modules/mocha
  yargs  4.0.0-alpha1 - 12.0.5 || 14.1.0 || 15.0.0 - 15.2.0
  Depends on vulnerable versions of yargs-parser
  node_modules/yargs-unparser/node_modules/yargs
    yargs-unparser  1.1.0 - 1.5.0
    Depends on vulnerable versions of yargs
    node_modules/yargs-unparser

18 vulnerabilities (14 low, 2 moderate, 2 high)
```

## Special thanks

Thank you [@IPWright83](https://github.com/IPWright83) for his solutions in improving the vulnerability validation for us to have the minimum-audit-level and production-mode flags.

---

If you like this project,

<a href="https://www.buymeacoffee.com/jeemok" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

# Better NPM Audit

Made to allow skipping certain vulnerabilities, and any extra handling that are not supported by the default `npm audit` in the future.

[![NPM](https://nodei.co/npm/better-npm-audit.png)](https://npmjs.org/package/better-npm-audit)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)


## Installation

    $ npm install better-npm-audit --save


## Package.json

```JSON
{
  "scripts": {
    "prepush": "npm run test && npm run audit",
    "audit": "node node_modules/better-npm-audit audit"
  }
}
```

## Flags

For skipping certain advisories, you can use `-i` or verbose `--ignore` flags

```
node node_modules/better-npm-audit audit -i 118,577
```

To avoid waterfall logging on your console, there is a character limit set to the output. To view the full audit logs, you can use `-f` or verbose `--full` flags

```
node node_modules/better-npm-audit audit -f
```

## Examples

Running `node node_modules/better-npm-audit audit` with vulnerabilities, will receive the error:

```
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

```
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

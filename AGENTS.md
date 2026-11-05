# Working on better-npm-audit

A TypeScript CLI that wraps `npm audit` / `pnpm audit` and adds exceptions, filtering and JSON output. Users' docs are in `README.md`; this file is for agents changing the code.

## Commands

```sh
npm ci
npm test            # mocha + chai + sinon, tests in test/ mirror src/
npm run lint        # eslint (google config + prettier); `npm run lint:fix` to fix
npm run build       # tsc to lib/ (lib/ is the published package and is git-ignored)
node lib audit --help   # try the built CLI; test with a scratch project that has a lockfile
```

Run lint, tests and build before pushing. CI runs them on Node 18, 20, 22 and 24 (and 14, 16 on `v3`).

## Code map

- `index.ts`: CLI options (commander) and running the audit command.
- `src/handlers/handleInput.ts`: options to audit command and exceptions. `handleFinish.ts`: result, table or `--json`, exit code.
- `src/utils/vulnerability.ts`: parses npm v6 (`advisories`) and v7+ (`vulnerabilities`) audit JSON; exceptions, wildcards, versions, `Scope`. pnpm output uses the v6 path.
- Fixtures for each audit format are in `test/__mocks__/`. Add a test with every change.

## Gotchas

- eslint-config-google and prettier disagree on some style (ternary line breaks, escaped quotes, line length). Use `if/else`, template strings and shorter lines rather than fighting the formatter.
- Audit commands are run with `execFile`, never a shell string; keep user input (like `--registry`) validated.
- Stdout in `--json` mode must contain only the JSON document; send anything else to stderr.
- Exit codes are part of the contract: `0` pass, `1` fail or error.

## Branches and releases

- `master` is 4.x (Node 18+), where features go. `v3` is 3.x maintenance (Node 14.6+): security and critical fixes only, backported from `master`.
- Work in a branch and open a PR; wait for green CI, merge, then check the PR is really `MERGED`.
- Keep `CHANGELOG.md` up to date with each change (under the unreleased heading).
- Follow `RELEASING.md` to release. Pushing a `v*` tag publishes to npm (the `Release` workflow), so never push a tag, publish or delete releases without being asked.

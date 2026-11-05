# Releasing

How to ship a release of `better-npm-audit`. Written after the 3.13.x / 4.0.0 releases, where a PR was assumed merged and wasn't, so the checks below are deliberate.

## Branches and tags

| Line | Branch | Node | npm dist-tag | Changes allowed |
| ---- | ------ | ---- | ------------ | --------------- |
| 4.x  | `master` | >= 18 | `latest` | features and fixes |
| 3.x  | `v3` | >= 14.6 | `maintenance` | security and critical fixes only (until May 2027) |

`v3` is not usable as a dist-tag name because npm reads it as a semver range. Features land on `master` only. Fixes for 3.x are made on `master` first, then backported with a PR to `v3`.

## 1. Before you start

- [ ] Every PR meant for this release is **merged**. Verify, don't trust the merge command's output: `git log --oneline --grep "#<PR>" <branch>` or `gh pr view <n> --json state,mergedAt`.
- [ ] On the release branch: `git pull`, working tree clean, `git status -sb` shows it matches `origin`.
- [ ] CI is green on the branch tip (`master`: Node 18/20/22/24; `v3`: also the `compat` job on Node 14/16).
- [ ] `npm audit --omit=dev` is clean (CI also runs the tool on itself).

## 2. Prepare the release (one PR per branch)

- [ ] Bump `version` in `package.json` (and `package-lock.json` via `npm install --package-lock-only`).
- [ ] `CHANGELOG.md`: add a section for the version with the date; link PRs/issues; thank contributors.
- [ ] README: check the Version support table, the Node requirement, and any new flags/options (flag table, examples).
- [ ] `engines.node` is correct for the line.
- [ ] Merge the PR and confirm it is merged.

## 3. Verify locally

```sh
npm ci
npm run lint
npm test
npm run build
node lib audit --help        # new flags appear
node lib --version
npm pack ./lib --dry-run     # expected files only
```

For `v3`, also smoke-test `node lib audit` on Node 14 and 16 (CI's `compat` job does this).

## 4. Publish

Needs `npm login` and a **fresh OTP for every publish or dist-tag command** (a code works once).

```sh
git checkout <branch> && git pull
npm ci
npm run publish:live -- --otp=<code>   # on master (4.x): tag latest
npm run publish:next -- --otp=<code>   # on master, for a pre-release you do not want as latest: tag next
npm run publish:maintenance -- --otp=<code>   # on v3 (3.x): tag maintenance, never latest
```

`publish:*` runs the build first and publishes `./lib`. They do not run lint or tests, so do step 3 first.

After publishing:

- [ ] Wait until `npm view better-npm-audit dist-tags` shows the new version (the registry can lag several minutes; do not re-publish).
- [ ] Smoke test the real package: `npx better-npm-audit@<version> --version` and an `audit` run in a scratch project.
- [ ] Check `npm view better-npm-audit dist-tags`: `latest` is the newest 4.x and `maintenance` is the newest 3.x.
- [ ] If a 4.x release was published with the wrong tag: `npm dist-tag add better-npm-audit@4.x.y latest --otp=<code>`.

## 5. Tag and release on GitHub

- [ ] Annotated tag on the commit that was published: `git tag -a vX.Y.Z <sha> -m "X.Y.Z" && git push origin vX.Y.Z`.
- [ ] `gh release create vX.Y.Z --verify-tag --target <branch> --title vX.Y.Z --notes "..."`, notes taken from the changelog.
- [ ] Mark the right release **Latest** (the one matching npm `latest`); mark pre-releases (published with `--tag next`) as pre-release.
- [ ] Delete stale draft releases.

## 6. Close the loop

- [ ] Comment on each fixed issue with the version it ships in, and close it only after the release is out.
- [ ] Thank PR contributors.
- [ ] Merge any follow-up PR that fills in the changelog date.
- [ ] If a security fix: check the Dependabot / advisories pages and publish an advisory if warranted.

## If something goes wrong

- Never re-publish a version; bump the patch version instead.
- A bad release: `npm deprecate better-npm-audit@<version> "<message>"` and ship a fixed version. Unpublish only within the npm policy window and only if nothing depends on it.
- Wrong dist-tag: `npm dist-tag add better-npm-audit@<good version> <tag>`.

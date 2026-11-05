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

## 4. Publish (automated)

Publishing is done by the `Release` workflow (`.github/workflows/release.yml`) using npm trusted publishing, so there is no OTP and no npm token. Push an annotated tag on the merged release commit:

```sh
git checkout <branch> && git pull          # master for 4.x, v3 for 3.x
git log -1 --oneline                        # confirm this is the merged release commit
git tag -a vX.Y.Z -m "X.Y.Z" && git push origin vX.Y.Z
```

Pushing the tag is what publishes, so treat it like running `npm publish`. The workflow then:

1. checks the tag equals `package.json`'s version and that the commit is on `master` (4.x) or `v3` (3.x);
2. runs `npm run build` (lint, tests, build) and `npm publish ./lib --provenance` with the dist-tag from the version: `latest` for 4.x, `maintenance` for 3.x, `next` for anything with a `-` pre-release suffix;
3. waits for the registry and smoke-tests `npx better-npm-audit@<version> --version`;
4. creates the GitHub release with the changelog section as notes (Latest for 4.x, not Latest for 3.x, pre-release for `next`).

Watch the run: `gh run watch`. If a step fails after the publish, don't push the tag again; fix forward (see "If something goes wrong").

To rehearse without publishing: Actions > Release > Run workflow on the branch. It runs everything except the publish, and does a `npm publish --dry-run`.

### One-time setup (maintainer)

- On npmjs.com: the `better-npm-audit` package > Settings > Trusted Publisher > GitHub Actions: owner `jeemok`, repository `better-npm-audit`, workflow `release.yml`, environment blank.
- `release.yml` must exist on the tagged commit, so it is on both `master` and `v3`.
- Optional: in the package's publishing access settings, require 2FA and disallow tokens once trusted publishing works.

### Manual fallback

If the workflow can't be used, publish by hand. This needs `npm login` and a **fresh OTP for every publish or dist-tag command**:

```sh
git checkout <branch> && git pull && npm ci
npm run publish:live -- --otp=<code>          # master (4.x): tag latest
npm run publish:next -- --otp=<code>          # master pre-release: tag next
npm run publish:maintenance -- --otp=<code>   # v3 (3.x): tag maintenance, never latest
```

Then by hand: wait for `npm view better-npm-audit dist-tags` to show the version, smoke test `npx better-npm-audit@<version> --version`, push the annotated tag, and `gh release create vX.Y.Z --verify-tag --title vX.Y.Z --notes-file <notes>` (mark Latest only for 4.x). If a 4.x release got the wrong tag: `npm dist-tag add better-npm-audit@4.x.y latest --otp=<code>`.

## 5. After the release

- [ ] `npm view better-npm-audit dist-tags`: `latest` is the newest 4.x and `maintenance` the newest 3.x.
- [ ] The GitHub release exists and the right one is marked Latest. Delete stale draft releases.

## 6. Close the loop

- [ ] Comment on each fixed issue with the version it ships in, and close it only after the release is out.
- [ ] Thank PR contributors.
- [ ] Merge any follow-up PR that fills in the changelog date.
- [ ] If a security fix: check the Dependabot / advisories pages and publish an advisory if warranted.

## If something goes wrong

- Never re-publish a version; bump the patch version instead. A tag that triggered a failed publish stays; the fix is a new patch version and a new tag.
- A bad release: `npm deprecate better-npm-audit@<version> "<message>"` and ship a fixed version. Unpublish only within the npm policy window and only if nothing depends on it.
- Wrong dist-tag: `npm dist-tag add better-npm-audit@<good version> <tag>`.

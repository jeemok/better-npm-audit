## 3.11.0 (September 9, 2024)

- [#102](https://github.com/jeemok/better-npm-audit/pull/102) Respect the `NO_COLOR` environment variable

## 3.10.0 (September 3, 2024)

- [#100](https://github.com/jeemok/better-npm-audit/pull/100) Add support for including specific columns in audit report

## 3.9.0 (September 2, 2024)

- [5df4120](https://github.com/jeemok/better-npm-audit/commit/5df4120aeadb5dc1d8750c4d863eee3bd6e1aab6) Bump micromatch from 4.0.4 to 4.0.8
- [8820f03](https://github.com/jeemok/better-npm-audit/commit/8820f035a6ec93f402085d81f680443dd81b3906) Fix getting npm version through CLI

## 3.8.1 - 3.8.3 (August 17, 2024)

- [607f16e](https://github.com/jeemok/better-npm-audit/commit/607f16edd1eebf2c022a8e6279d8061d9529ebd7) fix(build): ensure lib/index.js is executable after build

## 3.8.0 (August 17, 2024)

- [27a7cb3](https://github.com/jeemok/better-npm-audit/commit/27a7cb3bb31dda0d990f4686eb8b7b20085cfa79) Use "--omit=dev" internally on newer npm version
- [76b4c57](https://github.com/jeemok/better-npm-audit/commit/76b4c576ea6581feac6f516868da83e7081d5995) [b3e04d3](https://github.com/jeemok/better-npm-audit/commit/b3e04d3de4ced028b4c9692dccafce0c52c4eed2) NPM Audit for fixing vulnerabilities

## 3.7.3 (March 22, 2022)
- [99c0697](https://github.com/jeemok/better-npm-audit/commit/99c069702ca7f18de641af34eea5c75e4df99b25) Added handling for empty strings in displaying unused exception message

## 3.7.2 (March 21, 2022)
- [ce8eb4d](https://github.com/jeemok/better-npm-audit/commit/ce8eb4d657f3176a092123d641a94da177336c76) Updated README

## 3.7.1 (March 19, 2022)
- [43380eb](https://github.com/jeemok/better-npm-audit/commit/43380eb54f6699ae121617603f8e3aaba1494321) Fixed unused exceptions handler

## 3.7.0 (March 10, 2022)
- [1871068](https://github.com/jeemok/better-npm-audit/commit/1871068fa3433b5fb4b93590540ccafc59dbfb38) Handles non numeric exception IDs

## 3.6.0 (February 23, 2022)

- [#71](https://github.com/jeemok/better-npm-audit/pull/71) Added new option: ignore by module name

## 3.5.1 (December 1, 2021)

- [0316010](https://github.com/jeemok/better-npm-audit/commit/031601052c0d59b585670c7d1e969f2996a43e68) Fixed npm run audit command
- [697421d](https://github.com/jeemok/better-npm-audit/commit/697421d969849fbef6ab4e318ffbaf1222290680) Fixed hanging process on Windows
- [f5ebe1f](https://github.com/jeemok/better-npm-audit/commit/f5ebe1fc459337f82e30c8fbfc87653e048f8f8c) Fixed invalid main path in package.json

## 3.4.0 (October 10, 2021)

- [fe66222](https://github.com/jeemok/better-npm-audit/commit/fe66222e05e0eb08bd7b89f45973c4e82cbe601d) Log exception, when failed to parse .nsprc file

## 3.3.0 (August 15, 2021)

- [5f36c41](https://github.com/jeemok/better-npm-audit/commit/5f36c41f0afbd0bb687394fb9195892f6df62d89) Shorten node path for NPM v7

## 3.2.1 (August 7, 2021)

- [e5d19a5](https://github.com/jeemok/better-npm-audit/commit/e5d19a545cb22021d5676dd8b58856c80fa42308) Include dependency path into the security report

## 3.1.2 (July 18, 2021)

- [895301e](https://github.com/jeemok/better-npm-audit/commit/895301e058172fc8eb001769e3781b5ce710af26) Updated README file

## 3.1.1 (July 14, 2021)

- [321e5f3](https://github.com/jeemok/better-npm-audit/commit/321e5f3981d57b68d14620207ba5e7fa5a75cb8c) Updated README file

## 3.1.0 (July 11, 2021)

- [#a5bba42](https://github.com/jeemok/better-npm-audit/commit/a5bba42bdbfa81d98499717f716707ed638e69c4) Updated declaration file extension so it will not be included in final build
- [#b1b05ff](https://github.com/jeemok/better-npm-audit/commit/b1b05ff2c531c21b5be34bcdfce0478dc324c57f) Added multiple date format support for `expiry` field
- [#15ae9ad](https://github.com/jeemok/better-npm-audit/commit/15ae9ad9307fd0d19b76741f74095c0614b164f7) Added `dayjs` package
- [#32b8535](https://github.com/jeemok/better-npm-audit/commit/32b853576468b0c7f7c0735f8345fad2218498a4) Style the exception expiry date if it is more than one or five years ago

## 3.0.1 (July 11, 2021)

- [#99c3add](https://github.com/jeemok/better-npm-audit/commit/99c3add40a7aeaada805010afbd5b2156a300915) Added missing README
- [#99c3add](https://github.com/jeemok/better-npm-audit/commit/99c3add40a7aeaada805010afbd5b2156a300915) Updated NPM scripts

## 3.0.0 (July 11, 2021)

- [#49](https://github.com/jeemok/better-npm-audit/pull/49) Refactored to TypeScript 🎉
- [#49](https://github.com/jeemok/better-npm-audit/pull/49) Upgraded package `commander` from version `2.19.0` to `8.0.0`

---

## 2.1.0 (June 24, 2021)

- [#43](https://github.com/jeemok/better-npm-audit/pull/43) Add support for npm registry url option ([@Tristan WAGNER](https://github.com/tristanwagner))
- [#42](https://github.com/jeemok/better-npm-audit/pull/42) Added CodeQL vulnerabilities check across codebase in CI
- [#e77632c](https://github.com/jeemok/better-npm-audit/commit/e77632c6434f1ed78031f00bfb3d638800859466) Removed github username as region currently not supported

## 2.0.5 (June 22, 2021)

- [#52be395](https://github.com/jeemok/better-npm-audit/commit/52be39506ab134592190dc4a9e740e5cf8a28c73) Removed unused package `cli-table` from the dependencies
- [#40](https://github.com/jeemok/better-npm-audit/pull/40) Added nodejs v16.x coverage in CI

## 2.0.4 (June 22, 2021)

### Notable changes

- [#0b7357c](https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Simplified the workflow and improved overall performance by running lesser in the process
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Added [`table`](https://www.npmjs.com/package/table) module to display table format reports
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Added table display for security report
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Added table display of exceptions from `.nsprc` file
- [#39](https://github.com/jeemok/better-npm-audit/pull/39) Cleaned up test cases structure to be more straight forward and easier to maintain

### Breaking changes

- [#e08a436](https://github.com/jeemok/better-npm-audit/commit/e08a4365a87473087408486b8a0f38958a5c4cf1) Renamed `--ignore -i` flag to `--exclude -x` for better clarity
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Removed `--display-full` flag that was used to ignore the maximum display limit
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Removed `--display-notes` flag that was used for displaying exception notes
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Renamed `ignore` field to `active` in `.nsprc` file for better clarity
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Renamed `reason` field to `notes` in `.nsprc` file for better clarity

### Others

- [#4ba2612](https://github.com/jeemok/better-npm-audit/commit/4ba2612567fb19e97d5df40ef6a4b1b5b4a4896f) Updated wording of unused exception warning
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Removed logging of flags used in the command
- [#0b7357c](https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f) Added NPM audit into the CI pipeline
- [#39](https://github.com/jeemok/better-npm-audit/pull/39) Updated README

### Closed issues

- [#20](https://github.com/jeemok/better-npm-audit/issues/20) Provide more output when parsing exceptions file
- [#27](https://github.com/jeemok/better-npm-audit/issues/27) Hide excepted vulnerabilities from output
- [#28](https://github.com/jeemok/better-npm-audit/issues/28) Missing [ in truncation message

---

## 1.12.1 (June 21, 2021)

- [#7249096](https://github.com/jeemok/better-npm-audit/commit/724909634fa35e704d6819888fe9ec545deb4ef2) Added FUNDING & updated README

## 1.12.0 (June 18, 2021)

- [#38](https://github.com/jeemok/better-npm-audit/pull/38) Display warning when `exceptionIds` are unused ([@Maarten Hus](https://github.com/MrHus))

## 1.11.2 (June 11, 2021)

- [#37](https://github.com/jeemok/better-npm-audit/pull/37) Fixed security CVE-2020-28469: Bump glob-parent from 5.1.1 to 5.1.2

## 1.11.1 (June 11, 2021)

- [#8d0561f](https://github.com/jeemok/better-npm-audit/commit/8d0561ffa087a4be667e2f08dbfac1b337d2f04c) Updated README

## 1.11.0 (June 11, 2021)

- [#36](https://github.com/jeemok/better-npm-audit/pull/36) Added environment variable support `NPM_CONFIG_AUDIT_LEVEL`

## 1.10.1 (June 7, 2021)

- [#6661c78](https://github.com/jeemok/better-npm-audit/commit/6661c7885dc0df76043db087ec69349689ac610a) Updated `--full` flag logging from `[full log mode enabled]` to `[report display limit disabled]`
- [#32](https://github.com/jeemok/better-npm-audit/issues/32) Added new flag `--display-notes` to display reasons for the exceptions

## 1.9.3 (June 6, 2021)

- [#31](https://github.com/jeemok/better-npm-audit/issues/31) Added CHANGELOG
- [#33](https://github.com/jeemok/better-npm-audit/pull/33) Updated README

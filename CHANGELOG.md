## x.x.x

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/42">#42</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added CodeQL vulnerabilities check across codebase in CI</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/e77632c6434f1ed78031f00bfb3d638800859466">#e77632c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Removed github username as region currently not supported</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/cc6e80c389eb40ca4dbf519230727e5ea7d21fea">#cc6e80c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added table and style formatting to CHANGELOG.md</td>
    </tr>
</table>

## 2.0.5 <span style="font-size: 0.7em; opacity: 0.7;">(June 22, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/52be39506ab134592190dc4a9e740e5cf8a28c73">#52be395</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Removed unused package `cli-table` from the dependencies</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/40">#40</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added nodejs v16.x coverage in CI</td>
    </tr>
</table>

## 2.0.4 <span style="font-size: 0.7em; opacity: 0.7;">(June 22, 2021)</span>

### <span style="margin-left: 10px">Notable changes</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Simplified the workflow and improved overall performance by running lesser in the process</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added <a href="https://www.npmjs.com/package/table">table</a> module to display table format reports <p><i>Tried <a href="https://www.npmjs.com/package/cli-table">cli-table</a> for its small size, however the issues in the repo concerns me in its display quality in other OS. Hence, chosen `table` module despite it is much bigger</i></p></td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added table display for security report</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commits/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added table display of exceptions from `.nsprc` file</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/39">#39</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Cleaned up test cases structure to be more straight forward and easier to maintain</td>
    </tr>
</table>

### <span style="margin-left: 10px">Breaking changes</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/e08a4365a87473087408486b8a0f38958a5c4cf1">#e08a436</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Renamed `--ignore -i` flag to `--exclude -x` for better clarity</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Removed `--display-full` flag that was used to ignore the maximum display limit. Now with the summary table it would be unlikely to display large size of information</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Removed `--display-notes` flag that was used for displaying exception notes. Now it is included in the exceptions table</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Renamed `ignore` field to `active` in `.nsprc` file for better clarity</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Renamed `reason` field to `notes` in `.nsprc` file for better clarity</td>
    </tr>
</table>

### <span style="margin-left: 10px">Others</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/4ba2612567fb19e97d5df40ef6a4b1b5b4a4896f">#4ba2612</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Updated wording of unused exception warning</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Removed logging of flags used in the command</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/0b7357cbdb604872ef3cd774d98f73874fb5b98f">#0b7357c</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added NPM audit into the CI pipeline</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/39">#39</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Updated README.md</td>
    </tr>
</table>

### <span style="margin-left: 10px">Closed issues</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="hthttps://github.com/jeemok/better-npm-audit/issues/20">#20</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Provide more output when parsing exceptions file</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="hthttps://github.com/jeemok/better-npm-audit/issues/27">#27</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Hide excepted vulnerabilities from output</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="hthttps://github.com/jeemok/better-npm-audit/issues/28">#28</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Missing [ in truncation message</td>
    </tr>
</table>

---

## 1.12.1 <span style="font-size: 0.7em; opacity: 0.7;">(June 21, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/724909634fa35e704d6819888fe9ec545deb4ef2">#7249096</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added FUNDING.yml & updated README.md</td>
    </tr>
</table>

## 1.12.0 <span style="font-size: 0.7em; opacity: 0.7;">(June 18, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/38">#38</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Display warning when `exceptionIds` are unused</td>
    </tr>
</table>

## 1.11.2 <span style="font-size: 0.7em; opacity: 0.7;">(June 11, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/37">#37</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Fixed security CVE-2020-28469: Bump glob-parent from 5.1.1 to 5.1.2</td>
    </tr>
</table>

## 1.11.1 <span style="font-size: 0.7em; opacity: 0.7;">(June 11, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/8d0561ffa087a4be667e2f08dbfac1b337d2f04c">#8d0561f</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Updated README.md</td>
    </tr>
</table>

## 1.11.0 <span style="font-size: 0.7em; opacity: 0.7;">(June 11, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/36">#36</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added environment variable support `process.env.NPM_CONFIG_AUDIT_LEVEL` to set the audit level</td>
    </tr>
</table>

## 1.10.1 <span style="font-size: 0.7em; opacity: 0.7;">(June 7, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/commit/6661c7885dc0df76043db087ec69349689ac610a">#6661c78</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Updated `--full` flag logging from `[full log mode enabled]` to `[report display limit disabled]`</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/issues/32">#32</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added new flag `--display-notes` to display reasons for the exceptions</td>
    </tr>
</table>

## 1.9.3 <span style="font-size: 0.7em; opacity: 0.7;">(June 6, 2021)</span>

<table style="margin-left: 20px; margin-bottom: 15px">
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/issues/31">#31</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Added CHANGELOG.md</td>
    </tr>
    <tr>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;"><a href="https://github.com/jeemok/better-npm-audit/pull/33">#33</a></td>
        <td style="vertical-align: top; border: none; padding: 0px; min-width: 80px;">Updated README.md</td>
    </tr>
</table>
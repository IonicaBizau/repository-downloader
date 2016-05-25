
# Repository Downloader

 [![PayPal](https://img.shields.io/badge/%24-paypal-f39c12.svg)][paypal-donations] [![AMA](https://img.shields.io/badge/ask%20me-anything-1abc9c.svg)](https://github.com/IonicaBizau/ama) [![Version](https://img.shields.io/npm/v/repo-downloader.svg)](https://www.npmjs.com/package/repo-downloader) [![Downloads](https://img.shields.io/npm/dt/repo-downloader.svg)](https://www.npmjs.com/package/repo-downloader) [![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/johnnyb?utm_source=github&utm_medium=button&utm_term=johnnyb&utm_campaign=github)

> Download all the repositories from BitBucket and GitHub, including your account, teams and where you created pull requests.

## Installation
```sh
$ git clone https://github.com/IonicaBizau/repository-downloader.git repo-downloader
$ cd repo-downloader
$ npm i
$ npm i -g git-stats-importer
```
## Usage

 1. Copy `config.tmpl.json` into `config.json` and edit it with your GitHub and BitBucket usernames and passwords. If you're using [two factor authentication](https://help.github.com/articles/about-two-factor-authentication/) on github, please [create an access token](https://developer.github.com/v3/oauth_authorizations/#create-a-new-authorization) and fill it on password field.
 2. Run `./start` and wait! :smile:


:bulb: You can pass arguments which are understood by `git-stats-importer` (e.g. `./start -e 'alice@example.com,bob@example.com'`).


## :yum: How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].


## :scroll: License

[MIT][license] © [Ionică Bizău][website]

[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2015#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md

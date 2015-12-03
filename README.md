# Repository Downloader [![Support this project][donate-now]][paypal-donations]

Download all the repositories from BitBucket and GitHub, including your account, teams and where you created pull requests.

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

## How to contribute
Have an idea? Found a bug? See [how to contribute][contributing].

## License

[MIT][license] © [Ionică Bizău][website]

[paypal-donations]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=RVXDDLKKLQRJW
[donate-now]: http://i.imgur.com/6cMbHOC.png

[license]: http://showalicense.com/?fullname=Ionic%C4%83%20Biz%C4%83u%20%3Cbizauionica%40gmail.com%3E%20(http%3A%2F%2Fionicabizau.net)&year=2015#license-mit
[website]: http://ionicabizau.net
[contributing]: /CONTRIBUTING.md
[docs]: /DOCUMENTATION.md
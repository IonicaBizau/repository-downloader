// Dependencies
var Config = require("./config")
  , Request = require("request")
  , Logger = require("bug-killer")
  , Repo = require("gry")
  , Async = require("async")
  , Fs = require("fs")
  , SameTimeLimit = require("same-time-limit")
  ;

// Logger configuration
Logger.config.progress = {
    color: "#3498db"
  , text: "   > "
};

/**
 * makeApiRequest
 * Run API requests.
 *
 * @name makeApiRequest
 * @function
 * @param {String} api The relative API url.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
function makeApiRequest(api, callback) {
    Request({
        url: "https://api.github.com/" + api
      , auth: Config.github
      , json: true
      , headers: {
            "user-agent": "Repo Downloader"
        }
    }, function (err, res, body) {
        err = err || body.error || body.message;
        if (err) { return callback(err); }
        callback(null, body);
    });
}

/**
 * getOrgs
 * Gets the organizations where the authenticated user is member.
 *
 * @name getOrgs
 * @function
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
function getOrgs(callback) {
    makeApiRequest("user/orgs", callback);
}

/**
 * getPRRepos
 * Gets the repositories where the `user` created pull requests.
 *
 * @name getPRRepos
 * @function
 * @param {String} user The user login value.
 * @param {Array} orgs The organizations where the user belongs to.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
function getPRRepos(user, orgs, callback) {
    var api = "search/issues?q=author:" + user + "%20is:pr"
      , page = 0
      , allRepos = []
      , ignoreAccounts = orgs.map(function (c) { return c.login; }).concat([Config.github.username])
      , match = null
      ;

    function seq() {
        Logger.log("Page: " + (++page), "progress");
        makeApiRequest(api + "&per_page=100&page=" + page, function (err, res) {
            if (err) { return callback(err); }

            allRepos = allRepos.concat(res.items.filter(function (c) {

                if (!c.full_name || !c.ssh_url || !c.owner) {
                    match = c.html_url.match(/github\.com\/(.*)\/(.*)\/pull/);
                    if (!match || match.length !== 3) {
                        Logger.log("Failed to get repository data for: " + c.html_url + " Incident must be reported.", "error");
                        return false;
                    }

                    c.owner = {
                        login: match[1]
                    };

                    c.full_name = c.owner.login + "/" + match[2];
                    c.ssh_url = "git@github.com:" + c.full_name + ".git";
                    c.clone_url = "https://github.com/" + c.full_name + ".git";
                }

                return ignoreAccounts.indexOf(c.owner.login) === -1;
            }));

            if (!res.items.length) {
                return callback(null, allRepos);
            }

            seq();
        });
    }
    seq();
}

/**
 * getAllRepos
 * Gets all repositories from the provided `user`.
 *
 * @name getAllRepos
 * @function
 * @param {String} user The user login value.
 * @param {Array} orgs The organizations where the user belongs to.
 * @param {Boolean} isOrg A flag if the `user` is an organization or not.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
function getAllRepos(user, orgs, isOrg, callback) {
    if (typeof isOrg === "function") {
        callback = isOrg;
        isOrg = false;
    }

    var api = "users/" + user + "/repos"
      , page = 0
      , allRepos = []
      ;

    if (isOrg) {
        api = "orgs/" + user + "/repos";
    }

    function seq() {
        Logger.log("Page: " + (++page), "progress");
        makeApiRequest(api + "?per_page=100&page=" + page, function (err, res) {
            if (err) { return callback(err); }
            allRepos = allRepos.concat(res);
            if (!res.length) {
                Logger.log("Getting the repositories where " + user + " created pull requests.", "info");
                return getPRRepos(user, orgs, function (err, prRepos) {
                    if (err) {
                        Logger.log(err, "warn");
                    }
                    allRepos = allRepos.concat(prRepos);
                    return callback(null, allRepos);
                });
            }
            seq();
        });
    }
    seq();
}

/**
 * downloadRepos
 * Download repositories the provided repositories.
 *
 * @name downloadRepos
 * @function
 * @param {Array} repos An array with the repositories to download.
 * @param {Function} callback The callback function.
 * @return {undefined}
 */
function downloadRepos(repos, callback) {
    var funcs = []
      , complete = 0
      , notDownloaded = []
      ;

    repos.forEach(function (c) {

        if (!c) { return; }

        funcs.push(function (callback) {
            var repo = new Repo("./downloads")
              , path = "github/" + c.full_name
              ;

            if (Fs.existsSync(__dirname + "/downloads/" + path)) {
                Logger.log("Repository already downloaded: " + c.full_name, "warn");
                return callback();
            }

            Logger.log("Repository: " + c.full_name, "progress");
            repo.exec("clone " + c.clone_url + " " + path, function (err) {

                if (err) {
                    console.log(err);
                    notDownloaded.push(c);
                    return callback();
                }

                Logger.log("Downloaded " + c.full_name + " (" + (++complete) + "/" + repos.length + ")", "progress");
                callback();
            });
        });
    });

    SameTimeLimit(funcs, 4, function (err, data) {

        if (notDownloaded.length) {
            Logger.log(notDownloaded.length + " repos failed to download. Trying again.", "warn");
            return downloadRepos(notDownloaded, callback);
        }
        callback();
    });
}

// Start the magic
Logger.log("Getting the organizations you belong to.", "info");
getOrgs(function (err, orgs) {
    if (err) { return Logger.log(err, "error"); }

    // Download user reposiotires
    Logger.log("Getting all your repositories.", "info");
    getAllRepos(Config.github.username, orgs, function (err, myRepos) {
        if (err) { return Logger.log(err, "error"); }

        // Download user repositories
        Logger.log("Downloading all your repositories.", "info");
        downloadRepos(myRepos, function (err) {
            if (err) { return Logger.log(err, "error"); }
            Logger.log("Downloaded all user repos.", "info");

            // Download the organization repositories
            var downloadOrgRepos = [];
            orgs.forEach(function (c) {
                downloadOrgRepos.push(function (callback) {
                    Logger.log("Getting " + c.login + "'s repositories.", "info");
                    getAllRepos(c.login, orgs, true, function (err, repos) {
                        if (err) { return callback(err); }
                        Logger.log("Downloading " + c.login + "'s repositories.", "info");
                        downloadRepos(repos, callback);
                    });
                });
            });

            Async.series(downloadOrgRepos, function (err) {
                if (err) { return Logger.log(err, "error"); }
                Logger.log("Done.", "info");
            });
        });
    });
});

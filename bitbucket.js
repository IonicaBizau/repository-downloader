// Dependencies
var Config = require("./config")
  , Request = require("request")
  , Logger = require("bug-killer")
  , Repo = require("gry")
  , Async = require("async")
  , Fs = require("fs")
  ;

Logger.config.logLevel = 4;
Logger.config.displayDate = false;
Logger.config.progress = {
    color: "#3498db"
  , text: "   > "
};

function makeApiRequest(api, callback) {
    Request({
        url: "https://bitbucket.org/api/" + api
      , auth: Config.bitbucket
    }, function (err, res, body) {
        if (err) { return callback(err); }
        try {
            body = JSON.parse(body);
        } catch(e) {
            return callback(e);
        }
        if (body.error) { return callback(body.error); }
        callback(null, body);
    });
}

function getOrgs(callback) {
    makeApiRequest("1.0/user/privileges", callback);
}

function getAllRepos(user, isOrg, callback) {
    if (typeof isOrg === "function") {
        callback = isOrg;
        isOrg = false;
    }
    var api = "2.0/repositories/" + user
      , page = 0
      , allRepos = []
      ;

    function seq() {
        Logger.log("Page: " + (++page), "progress");
        makeApiRequest(api + "?limit=50&page=" + page, function (err, res) {
            if (err && err.message !== "Invalid page") { return callback(err); }
            if (err || !res.values || !res.values.length) {
                return callback(null, allRepos);
            }
            allRepos = allRepos.concat(res.values);
            seq();
        });
    }
    seq();
}

function downloadRepos(repos, callback) {
    var funcs = []
      , complete = 0
      , notDownloaded = []
      ;

    repos.forEach(function (c) {
        funcs.push(function (callback) {
            var repo = new Repo("./downloads")
              , path = "bitbucket/" + c.full_name
              ;

            if (Fs.existsSync(__dirname + "/downloads/" + path)) {
                Logger.log("Repository already downloaded: " + c.full_name, "warn");
                return callback();
            }

            Logger.log("Repository: " + c.full_name, "progress");
            repo.exec("clone " + c.links.clone[1].href + " " + path, function (err) {

                if (err) {
                    notDownloaded.push(c);
                    return callback();
                }

                Logger.log("Downloaded " + c.full_name + " (" + (++complete) + "/" + repos.length + ")", "progress");
                callback();
            });
        });
    });

    Async.parallel(funcs, function (err) {

        if (notDownloaded.length) {
            Logger.log(notDownloaded.length + " repos failed to download. Trying again.", "warn");
            return downloadRepos(notDownloaded, callback);
        }
        callback();
    });
}

Logger.log("Getting the organizations you belong to.", "info");
getOrgs(function (err, orgs) {
    if (err) { return Logger.log(err, "error"); }
    orgs = Object.keys(orgs.teams).map(function (c) { return { login: c }; });
    Logger.log("Getting all your repositories.", "info");
    getAllRepos(Config.bitbucket.username, function (err, myRepos) {
        if (err) { return Logger.log(err, "error"); }
        Logger.log("Downloading all your repositories.", "info");
        downloadRepos(myRepos, function (err) {
            if (err) { return Logger.log(err, "error"); }
            Logger.log("Downloaded all user repos.", "info");
            var downloadOrgRepos = [];
            orgs.forEach(function (c) {
                downloadOrgRepos.push(function (callback) {
                    Logger.log("Getting " + c.login + "'s repositories.", "info");
                    getAllRepos(c.login, true, function (err, repos) {
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

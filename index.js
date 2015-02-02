var Config = require("./config")
  , Request = require("request")
  , Logger = require("bug-killer")
  , Repo = require("gry")
  , Async = require("async")
  ;

function makeApiRequest(api, callback) {
    Request({
        url: "https://api.github.com/" + api
      , auth: Config
      , headers: {
            "user-agent": "Repo Downloader"
        }
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
    makeApiRequest("user/orgs", callback);
}

function getAllRepos(user, isOrg, callback) {
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
        makeApiRequest(api + "?per_page=100&page=" + (++page), function (err, res) {
            if (err) { return callback(err); }
            allRepos = allRepos.concat(res);
            if (!res.length) {
                callback(null, res);
            }
            seq();
        });
    }
    seq();
}

function downloadRepos(repos, callback) {
    var funcs = [];
    repos.forEach(function (c) {
        funcs.push(function (callback) {
            var repo = new Repo("./downloads");
            repo.exec("clone " + c.ssh_url + " " + c.full_name, function (err) {
                if (err) { return callback(err); }
                Logger.log("Downloaded " + c.full_name, "info");
                callback();
            });
        });
    });

    Async.paralel(funcs, callback);
}

getOrgs(function (err, orgs) {
    if (err) { return Logger.log(err, "error"); }
    getAllRepos(Config.username, function (err, myRepos) {
        if (err) { return Logger.log(err, "error"); }
        downloadRepos(myRepos, function (err) {
            if (err) { return Logger.log(err, "error"); }
            Logger.log("Downloaded all user repos.", "info");
        });
    });
});

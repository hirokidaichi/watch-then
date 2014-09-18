var watchTree = require("fs-watch-tree").watchTree;
var clear = require("clear");
var fs = require("fs");
var ignore = require("ignore");
var spawn = require("child_process").spawn;

var ignoreFilter = ignore().addIgnoreFile("./.gitignore");

var excluder = {
    test: function(file) {
        var ret = ignoreFilter.filter([file]);
        return (ret.length === 0);
    }
};

var usage = function() {
    console.error("Usage : watch-then <watchdir> <command> (<delay>)");
    process.exit(-1);
};

var execCommand = function(commandStr, done) {
    clear();
    var splitted = commandStr.split(/ /);
    var command = splitted[0];
    var rest = splitted.slice(1);
    var cp = spawn(command, rest);
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
    cp.on("close", done);
};

var run = module.exports = function(node, script, dir, command, delay) {
    if (!dir) return usage();
    if (!command) return usage();
    var wait = delay || 1500;

    var events = [];
    execCommand(command, function() {
        events = [];
    });
    watchTree("./", {
        exclude: [excluder]
    }, function(evt, filename) {
        if (events.length === 0) {
            // first time
            setTimeout(function() {
                execCommand(command, function() {
                    events = [];
                });
            }, wait);
        }
        events.push(arguments);
    });

};

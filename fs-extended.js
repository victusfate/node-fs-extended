    var fs   = require('fs');
    var path = require('path');
    var util = require('util');
    var exec = require('child_process').exec

    exports.removeDirectories = function(aPaths, fCallback) {
        fCallback = typeof fCallback == 'function' ? fCallback  : function() {};

        var remove = function() {
            if (aPaths.length == 0) {
                fCallback();
            } else {
                exports.removeDirectory(aPaths.shift(), remove);
            }
        };

        remove();
    };

    exports.removeDirectory = function(sPath, fCallback) {
        fCallback = typeof fCallback == 'function' ? fCallback  : function() {};

        fs.stat(sPath, function(oError, oStat) {
            if (oStat !== undefined) {
                if (oStat.isDirectory()) {
                    exec('rm ' + path.join(sPath, '/*'), function() {
                        fs.rmdir(sPath, function() {
                            fCallback(sPath);
                        });
                    });
                } else {
                    fs.unlink(sPath, function() {
                        fCallback(sPath);
                    });
                }
            } else {
                fCallback(sPath);
            }
        });
    };

    exports.copyDirectoryPropertiesToFile = function(sFile, fCallback) {
        fCallback = typeof fCallback == 'function' ? fCallback  : function() {};

        var sPath = path.dirname(sFile);
        fs.stat(sPath, function(oError, oStat) {
            fs.chmod(sFile, oStat.mode, function() {                                        // Copy Permissions from Parent Directory
                fs.chown(sFile, oStat.gid, oStat.uid, function() {                          // Copy Ownership from Parent Directory
                    fCallback(sFile);
                });
            });
        });
    };

    exports.copyFile = function(sFromFile, sToFile, fCallback) {
        fCallback = typeof fCallback == 'function' ? fCallback  : function() {};

        if (sFromFile != sToFile) {
            util.pump(fs.createReadStream(sFromFile), fs.createWriteStream(sToFile), function() { // CANNOT use fs.rename due to partition limitations
                exports.copyDirectoryPropertiesToFile(sToFile, function() {
                    fCallback(sToFile);
                });
            });
        } else {
            exports.copyDirectoryPropertiesToFile(sToFile, function() {
                fCallback(sToFile);
            });
        }
    };

    exports.moveFile = function(sFromFile, sToFile, fCallback) {
        fCallback = typeof fCallback == 'function' ? fCallback  : function() {};

        exports.copyFile(sFromFile, sToFile, function() {
            if (sFromFile != sToFile) {
                fs.unlink(sFromFile, function() {
                    fCallback(sToFile);
                });
            } else {
                fCallback(sToFile);
            }
        });
    };



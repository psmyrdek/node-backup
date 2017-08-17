const FtpClient = require('ftp');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const FtpIterator = require('./FtpIterator');

class FtpDownloader {

    constructor (config) {
        this._config = config;
    }

    downloadBackup(backupName, backupPath, blacklistedPaths) {

        console.log(`Creating new backup ${chalk.yellow(backupName)}`);
        const backupFullPath = path.join(backupPath, backupName);
        fs.mkdirSync(backupFullPath);

        const ftpIterator = new FtpIterator(new FtpClient());
        ftpIterator.connect(this._config);

        const saveAction = require('./saveFile')(backupFullPath, blacklistedPaths);

        return ftpIterator.forEachFile(saveAction)
            .then(() => {
                ftpIterator.disconnect();
                console.log(`Backup ${chalk.yellow(backupName)} created successfully!`);
            });
    }

}

module.exports = FtpDownloader;
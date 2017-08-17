const chalk = require('chalk');
const Promise = require('bluebird');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

class BackupArchiver {

    archiveBackup(backupName, backupPath) {
        return new Promise((resolve, reject) => {

            console.log(`Creating new compressed archive for backup ${chalk.yellow(backupName)}`);
            const backupFullPath = path.join(backupPath, backupName);

            const archive = archiver('tar', {
                zlib: { level: 9 }
            });

            archive.on('error', function (err) {
                console.log(chalk.red(err));
                throw err;
            });

            const output = fs.createWriteStream(`${backupFullPath}.tgz`);

            archive.pipe(output);
            archive.directory(backupFullPath, false);
            archive.finalize();

            output.on('close', function () {
                console.log(`Compressed archive for backup ${chalk.yellow(backupName)} created!`);
                resolve();
            });

        });
    }

}

module.exports = BackupArchiver;
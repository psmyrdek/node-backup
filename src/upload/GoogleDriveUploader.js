const fs = require('fs');
const google = require('googleapis');
const chalk = require('chalk');
const path = require('path');

const authorize = require('./authorize');
const service = google.drive('v3');

class GoogleDriveUploader {

    constructor(config) {
        this._config = config;
    }

    uploadBackup(backupName, backupPath) {
        console.log(`Uploading backup ${chalk.yellow(backupName)}`);

        authorize(this._config.credentials, (auth) => {
            this.uploadWithAuth(backupName, backupPath, auth);
        });
    }

    uploadWithAuth(backupName, backupPath, auth) {

        const backupFullPath = path.join(backupPath, `${backupName}.tgz`);

        const folderId = this._config.destination;

        const fileMetadata = {
            name: backupName,
            parents: [folderId]
        };

        const media = {
            mimeType: 'application/gzip',
            body: fs.createReadStream(backupFullPath)
        };

        service.files.create({
            auth: auth,
            resource: fileMetadata,
            media: media,
            fields: 'id'
        }, function (err, file) {
            if (err) {
                console.log(err);
            } else {
                console.log(`Backup ${chalk.yellow(backupName)} uploaded successfully!`);
            }
        });
    }
}

module.exports = GoogleDriveUploader;
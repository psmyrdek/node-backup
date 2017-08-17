const path = require('path');
const chalk = require('chalk');
const FtpDownloader = require('./src/download/FtpDownloader');
const BackupArchiver = require('./src/archive/BackupArchiver');
const GoogleDriveUploader = require('./src/upload/GoogleDriveUploader');
const config = require('./config/config.json');

const ftpClientConfig = {
    host: config.ftp.host,
    user: config.ftp.user,
    password: config.ftp.password
};

const googleDriveConfig = {
    destination: config.googledrive.destination,
    credentials: config.googledrive.credentials
};

const blacklistedPaths = [
    // '/tmp',
    // '/wp-content/uploads'
];

const archiver = new BackupArchiver();
const ftpDownloader = new FtpDownloader(ftpClientConfig);
const driveUploader = new GoogleDriveUploader(googleDriveConfig);

const backupName = new Date().toISOString();
const backupPath = path.join(__dirname, `./data`);

ftpDownloader.downloadBackup(backupName, backupPath, blacklistedPaths)
    .then(() => {
        return archiver.archiveBackup(backupName, backupPath);
    })
    .then(() => {
        driveUploader.uploadBackup(backupName, backupPath);
    });
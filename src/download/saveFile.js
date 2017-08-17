const Promise = require('bluebird');
const fs = require('fs');
const chalk = require('chalk');
const path = require('path');
const mkdirp = require('mkdirp');
const { some } = require('lodash');

function saveFile(outputPath, blacklistedPaths) {

    return function (client, parentDir, listItem, absolutePath) {
        return new Promise((resolve, reject) => {

            if (some(blacklistedPaths, (blacklisted) => absolutePath.startsWith(blacklisted))) {
                console.log(`Skipping ${chalk.gray(absolutePath)}`);
                resolve();
            } else {
                client.get(absolutePath, (err, stream) => {
                    if (err) { reject(err); }

                    console.log(`Archiving ${chalk.green(absolutePath)}`);

                    if (!fs.existsSync(path.join(outputPath, parentDir))) {
                        mkdirp.sync(path.join(outputPath, parentDir));
                    }

                    stream.pipe(fs.createWriteStream(path.join(outputPath, absolutePath)));
                    
                    stream.once('close', () => {
                        resolve();
                    });
                });
            }
        });
    }
}

module.exports = saveFile;
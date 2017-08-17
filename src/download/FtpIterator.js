const Promise = require('bluebird');

class FtpIterator {

    constructor(ftpClient) {
        this._ftpClient = ftpClient;
    }

    connect(config) {
        this._ftpClient.connect(config);
    }

    disconnect() {
        this._ftpClient.end();
    }

    forEachFile(action) {
        return this.listDir()
            .then((list) => {
                return Promise.mapSeries(list, (listItem) => {
                    return this.doIteration('/', listItem, action);
                });
            });
    }

    doIteration(parentDir, listItem, action) {

        return new Promise((resolve, reject) => {

            switch (listItem.type) {
                case 'd': {
                    const nextDir = this.getNameWithParent(parentDir, listItem.name);
                    this.changeDir(nextDir)
                        .then(currentDir => this.listDir())
                        .then((childList) => {
                            return Promise.mapSeries(childList, (childListItem) => {
                                return this.doIteration(nextDir, childListItem, action);
                            })
                        })
                        .catch((err) => {
                            console.log(err);
                        })
                        .finally(() => {
                            resolve();
                        });

                    break;
                }
                case '-': {
                    const absolutePath = this.getNameWithParent(parentDir, listItem.name);

                    action(this._ftpClient, parentDir, listItem, absolutePath)
                        .then(() => {
                            resolve();
                        });

                    break;
                }
            }

        });
        
    }

    listDir() {
        return new Promise((resolve, reject) => {
            this._ftpClient.list((err, list) => {
                if (err) { reject(err); }
                resolve(list);
            });
        });
    }

    changeDir(nextDir) {
        return new Promise((resolve, reject) => {
            this._ftpClient.cwd(nextDir, (err, currentDir) => {
                if (err) { reject(err); }
                resolve(nextDir);
            });
        });
    }

    getNameWithParent(currentPath, itemName) {
        return currentPath === '/' ? `${currentPath}${itemName}` : `${currentPath}/${itemName}`
    }
    
}

module.exports = FtpIterator;
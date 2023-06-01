const { readdir, readFile } = require('fs');
const { workerData, parentPort } = require('worker_threads');

const { dirpath, filenames } = workerData;

async function getFiles() {
    const filePromises = filenames.map((file) => {
        return new Promise((resolve, reject) => {
            readFile(`${dirpath}/${file.name}`, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        })
    });

    try {
        const files = await Promise.all(filePromises);
        parentPort.postMessage(files);
    } catch(err) {
        console.log('error in thread', err);
    }
}

getFiles();

const { readdir, readFile } = require('fs');
const os = require('os');
const { Worker } = require('worker_threads');

const path = process.argv[2];

const cores = os.cpus();

function readFiles(dirpath, filenames) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./file.js', {
            workerData: {
                dirpath,
                filenames
            }
        });

        worker.on('message', (data) => {
            resolve(data);
        });

        worker.on('error', (error) => {
            reject(error);
        });
    });
}

readdir(`${path}`, { withFileTypes: true }, async (err, files) => {
    if (err) {
        console.log(err);
    }

    const fileNames = files.filter(file => {
        const fileSplit = file.name.split('.');
        return fileSplit.length === 2 && fileSplit[0].length > 0 && fileSplit[1].length > 0;
    });

    const chunkSize = fileNames.length / cores.length;
    let chunks = [];

    for (let i = 0; i < fileNames.length; i += chunkSize) {
        const chunk = fileNames.slice(i, i + chunkSize);
        chunks.push(chunk);
    }

    const promises = chunks.map((chunk) => {
        return readFiles(path, chunk);
    });

    try {
        const resolvedFiles = await Promise.all(promises);
        console.log('resolved files', resolvedFiles.flat());
    } catch (err) {
        console.log(err);
    }
});


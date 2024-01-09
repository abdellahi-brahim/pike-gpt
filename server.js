const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const TIMEOUT = 10000;

app.use(express.json());

app.post('/', (req, res) => {
    const filename = `temp-${uuidv4()}.pike`;

    fs.writeFile(filename, req.body.code, (err) => {
        if (err) {
            res.status(500).send('Error writing file');
            return;
        }

        const child = exec(`pike ${filename}`);
        let isTimeout = false;

        const timeout = setTimeout(() => {
            isTimeout = true;
            child.kill();
            res.status(408).send('Request Timeout');
        }, TIMEOUT);

        child.stdout.on('data', (data) => {
            if (!isTimeout) {
                clearTimeout(timeout);
                res.send(data);
            }
        });

        child.stderr.on('data', (data) => {
            if (!isTimeout) {
                clearTimeout(timeout);
                res.status(500).send(`Execution error: ${data}`);
            }
        });

        child.on('exit', (code, signal) => {
            if (signal === 'SIGTERM') {
                console.log('Process terminated due to timeout');
            }
            fs.unlink(filename, (err) => {
                if (err) {
                    console.error(`Error deleting file ${filename}: ${err}`);
                }
            });
        });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

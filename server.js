const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');
app.use(express.json());

app.post('/', (req, res) => {
    const filename = `temp-${uuidv4()}.pike`;

    fs.writeFile(filename, req.body.code, (err) => {
        if (err) {
            res.status(500).send('Error writing file');
            return;
        }
        exec(`pike ${filename}`, (error, stdout, stderr) => {
            if (error) {
                res.status(500).send(`Execution error: ${error.message}`);
                return;
            }
            if (stderr) {
                res.status(500).send(`Execution error: ${stderr}`);
                return;
            }

            res.send(stdout);

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

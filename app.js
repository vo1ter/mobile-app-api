const { randomUUID } = require('crypto')
const express = require('express')
const multer = require('multer')
const { processAudio } = require('./audioProcessing');
const app = express()
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, randomUUID() + '.m4a')
    }
})

const upload = multer({ storage: storage });

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
})

app.post('/uploadShotTimerAudio', upload.single('audio'), async (req, res) => {
    try {
        const filePath = req.file.path;

        const result = await processAudio(filePath)

        await fs.unlinkSync(filePath);

        if(!result.success) return res.status(500).send('Error processing audio file');

        console.log(result)

        res.status(200).send(JSON.stringify(result));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Error processing audio file');
    }
});

app.listen(57300);
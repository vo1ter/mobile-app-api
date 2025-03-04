const { randomUUID } = require('crypto')
const express = require('express')
const multer = require('multer')
const { processAudio } = require('./audioProcessing');
const app = express()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, randomUUID() + '.m4a')
    }
})

const upload = multer({ storage: storage });

app.post('/uploadShotTimerAudio', upload.single('audio'), async (req, res) => {
    const filePath = req.file.path;

    const result = await processAudio(filePath)

    await fs.unlinkSync(filePath);;

    if(!result.success) return res.status(500).send('Error processing audio file');

    res.status(200).send(JSON.stringify(result));
});

app.listen(57300);
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { spawn } = require('child_process');

const processAudio = async (filePath) => {
    let noisePeaks = [];
    const loudThreshold = -15;
    let success = false;

    const processPromise = new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .audioFilters('volume=10.0, ebur128')
            .format('null')
            .on('stderr', (stderrLine) => {
                const timeMatch = stderrLine.match(/t: ([\d:.]+)/);
                const peakMatch = stderrLine.match(/M:\s*([-+]?\d*\.\d+|\d+)/);

                if (timeMatch && peakMatch) {
                    const timestamp = timeMatch[1];
                    const peakValue = parseFloat(peakMatch[1]);

                    if (peakMatch[1] > loudThreshold) {
                        noisePeaks.push({ timestamp, peakValue });
                    }
                }
            })
            .on('error', (err) => {
                console.error('Error:', err);
                reject(err);
            })
            .on('end', () => {
                resolve();
                success = true;
            })
            .save('/dev/null');
    });

    await processPromise;

    return { noisePeaks, success };
}

module.exports = {
    processAudio
}
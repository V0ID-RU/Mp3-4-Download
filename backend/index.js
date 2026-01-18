const express = require('express');
const cors = require('cors');
const youtubeDl = require('yt-dlp-exec');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint to get video information
app.get('/api/info', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const info = await youtubeDl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]
        });

        res.json({
            title: info.title,
            thumbnail: info.thumbnail,
            duration: info.duration_string,
            uploader: info.uploader,
            formats: ['mp3', 'mp4']
        });
    } catch (error) {
        console.error('Info Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch video info. Make sure the URL is valid.' });
    }
});

// Endpoint to download the video/audio
app.get('/api/download', async (req, res) => {
    const { url, format } = req.query;
    if (!url || !format) return res.status(400).json({ error: 'URL and format are required' });

    try {
        let options = {
            output: '-',
            noCheckCertificates: true,
            noWarnings: true,
            ffmpegLocation: ffmpegPath,
            addHeader: [
                'referer:youtube.com',
                'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ]
        };

        if (format === 'mp3') {
            options = {
                ...options,
                extractAudio: true,
                audioFormat: 'mp3',
            };
        } else {
            options = {
                ...options,
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            };
        }

        const filename = `download_${Date.now()}.${format}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

        const subprocess = youtubeDl.exec(url, options);

        subprocess.stdout.pipe(res);

        subprocess.on('error', (err) => {
            console.error('Subprocess Error:', err);
            if (!res.headersSent) {
                res.status(500).send('Error during download');
            }
        });

        req.on('close', () => {
            subprocess.kill();
        });

    } catch (error) {
        console.error('Download Error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to start download' });
        }
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

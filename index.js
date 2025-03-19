const express = require("express");
const { execFile } = require("child_process");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const fetch = require("node-fetch");

const app = express();
app.use(cors());

// Rate limiting (প্রতি IP প্রতি মিনিটে সর্বোচ্চ ২০ অনুরোধ)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 মিনিট
    max: 20,
    message: { error: "Too many requests. Please try again later." }
});
app.use(limiter);

// URL Validation ফাংশন
const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
};

app.get("/download", async (req, res) => {
    const videoUrl = req.query.url;
    const format = req.query.format || "b";

    if (!videoUrl || !isValidURL(videoUrl)) {
        return res.status(400).json({ error: "Invalid or missing URL" });
    }

    execFile("yt-dlp", ["-f", format, "--get-url", videoUrl], async (error, stdout, stderr) => {
        if (error) {
            return res.status(500).json({ error: "Failed to fetch video", details: error.message });
        }

        const videoLink = stdout.trim();
        if (!videoLink) {
            return res.status(500).json({ error: "Could not extract video link" });
        }

        try {
            const response = await fetch(videoLink);
            if (!response.ok) {
                throw new Error("Failed to fetch video from source");
            }

            res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');
            response.body.pipe(res);
        } catch (err) {
            res.status(500).json({ error: "Download error", details: err.message });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

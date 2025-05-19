const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");

const app = express(); 
app.use(cors());
app.use(express.static("hasan"))

app.get("/alldl", (req, res) => {
    const videoUrl = req.query.url;
    const format = req.query.format || "b";
    
    if (!videoUrl) {
        return res.status(400).json({ error: "URL is required" });
    }

    let content = "video/mp4";
    if (["bestaudio", "worstaudio", "233", "234", "249", "250"].includes(format)) {
        content = "audio/mp3";
    }

    const ytDlp = spawn("yt-dlp", ["-f", format, "-o", "-", "--user-agent", "Mozilla/5.0", videoUrl]);

    res.setHeader("Content-Type", content);

    let fileName = `hasan_${Date.now()}.mp4`;
            if (["bestaudio", "worstaudio", "250", "249"].includes(format)) {
                fileName = `hasan_${Date.now()}.mp3`;
            }

    const filePath = path.join("hasan", fileName);
    const writer = fs.createWriteStream(filePath);

    ytDlp.stdout.pipe(writer);

    writer.on("finish", () => {
                const finalUrl = `https://alldl-api-production.up.railway.app/${fileName}`;
                res.json({ url: finalUrl });
            });

    writer.on("error", (err) => {
                res.status(500).json({ response: "Failed to write file", details: err.message });
            });

    ytDlp.on("error", (err) => {
        console.error("Failed to start yt-dlp:", err);
        res.status(500).json({ error: "yt-dlp execution failed" });
    });

    ytDlp.on("close", (code) => {
        if (code !== 0) {
            console.error(`yt-dlp exited with code ${code}`);
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");

const app = express(); 
app.use(cors());

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

    const ytDlp = spawn("yt-dlp", ["--cookies-from-browser", "chrome", "-f", format, "-o", "-", videoUrl]);

    res.setHeader("Content-Type", content);

    ytDlp.stdout.pipe(res);

    ytDlp.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
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

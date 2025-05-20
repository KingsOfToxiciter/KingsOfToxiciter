const express = require("express");
const { spawn } = require("child_process");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static("hasan")); 

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "hasan", "index.html"));
});

app.get("/download", (req, res) => {
    const videoUrl = req.query.url;
    const format = req.query.format || "b";

    if (!videoUrl) {
        return res.status(400).json({ error: "URL is required" });
    }

    let content = "video/mp4";
    if (["bestaudio", "worstaudio", "233", "234", "249", "250"].includes(format)) {
        content = "audio/mp3";
    }

    const fileName =
        ["bestaudio", "worstaudio", "250", "249"].includes(format)
            ? `hasan_${Date.now()}.mp3`
            : `hasan_${Date.now()}.mp4`;

    const filePath = path.join("hasan", fileName);

    
    const ytDlp = spawn("yt-dlp", [
        "--cookies",
        "cookies.txt",
        "-f",
        format,
        "-o",
        "-",
        videoUrl,
    ]);

    const writer = fs.createWriteStream(filePath);
    let responseSent = false;

    
    ytDlp.stdout.pipe(writer);

    
    ytDlp.stderr.on("data", (data) => {
        console.log(`yt-dlp: ${data}`);
    });

    writer.on("finish", () => {
        if (!responseSent) {
            const finalUrl = `https://kingsoftoxiciter-production.up.railway.app/${fileName}`;
            res.json({ url: finalUrl });
            responseSent = true;
        }
    });

    writer.on("error", (err) => {
        if (!responseSent) {
            res.status(500).json({
                error: "Failed to write downloaded file",
                details: err.message,
            });
            responseSent = true;
        }
    });

    ytDlp.on("error", (err) => {
        if (!responseSent) {
            res.status(500).json({
                error: "yt-dlp execution failed",
                details: err.message,
            });
            responseSent = true;
        }
    });

    ytDlp.on("close", (code) => {
        if (code !== 0 && !responseSent) {
            res.status(500).json({
                error: `yt-dlp exited with code ${code}`,
            });
            responseSent = true;
        }
    });
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

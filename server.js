const fs = require("fs");
const https = require("https");
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const db = new sqlite3.Database("availability.db");

// Załaduj certyfikat SSL
const options = {
    key: fs.readFileSync("./privkey.pem"),  
    cert: fs.readFileSync("./cert.pem")
};

// Obsługa statycznych plików HTML/CSS/JS
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

function logToFile(message) {
    const logStream = fs.createWriteStream("activity.log", { flags: "a" });
    logStream.write(`${new Date().toISOString()} - ${message}\n`);
    logStream.end();
}

// API do pobierania dostępności
app.get("/api/availability", (req, res) => {
    db.all("SELECT * FROM availability", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(rows);
    });
});

// API do zapisywania dostępności
app.post("/api/availability", (req, res) => {
    const { person, day, available } = req.body;
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    db.run(
        "INSERT INTO availability (person, day, available) VALUES (?, ?, ?) ON CONFLICT(person, day) DO UPDATE SET available = ?",
        [person, day, available, available],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            
            logToFile(`IP: ${ip}, Browser: ${userAgent}, Person: ${person}, Day: ${day}, Available: ${available}`);
            res.json({ success: true });
        }
    );
});

// API do resetowania bazy danych
app.post("/api/reset", (req, res) => {
    db.run("DELETE FROM availability", [], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Database reset successfully." });
    });
});

// Uruchomienie serwera HTTPS
https.createServer(options, app).listen(443, () => {
    console.log("Serwer HTTPS działa na porcie 443");
});

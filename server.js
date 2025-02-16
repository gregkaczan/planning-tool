const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Database setup
const dbFile = "availability.db";
if (!fs.existsSync(dbFile)) {
  const db = new sqlite3.Database(dbFile);
  db.serialize(() => {
    db.run("CREATE TABLE availability (person TEXT, day TEXT, available INTEGER, PRIMARY KEY (person, day))");
  });
  db.close();
}

const db = new sqlite3.Database(dbFile);

// API: Get availability data
app.get("/api/availability", (req, res) => {
  db.all("SELECT * FROM availability", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// API: Reset database (Clears all availability data)
app.post("/api/reset", (req, res) => {
    db.run("DELETE FROM availability", [], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Database reset successfully." });
    });
});


// API: Update availability
app.post("/api/availability", (req, res) => {
  const { person, day, available } = req.body;
  db.run(
    "INSERT INTO availability (person, day, available) VALUES (?, ?, ?) ON CONFLICT(person, day) DO UPDATE SET available = excluded.available",
    [person, day, available],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

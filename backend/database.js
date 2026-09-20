
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const dataDir = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(dataDir)) {

 fs.mkdirSync(dataDir, { recursive: true });

}
const dbPath = path.join(dataDir, "aicapsule.db");

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        github_id TEXT UNIQUE NOT NULL,
        username TEXT,
        email TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);

db.run(`
    CREATE TABLE IF NOT EXISTS capsules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        project_name TEXT NOT NULL,
        prompt_title TEXT NOT NULL,
        prompt_version TEXT,
        prompt_text TEXT NOT NULL,
        response_summary TEXT,
        category TEXT,
        usefulness TEXT,
        reviewed INTEGER DEFAULT 0,
        improved INTEGER DEFAULT 0,
        screenshot_url TEXT,
        notes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
`);
});
module.exports = db;
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, 'attendance.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database tables
function initDb() {
  // Students Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      usn TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      year INTEGER NOT NULL,
      cycle TEXT,
      mobile TEXT NOT NULL,
      student_id TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Sessions Table (supports 5 subjects / hours)
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_name TEXT NOT NULL,
      subject_code TEXT,
      hour_number INTEGER DEFAULT 1,
      started_by TEXT DEFAULT 'admin',
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      is_active INTEGER DEFAULT 1,
      geo_fence_enabled INTEGER DEFAULT 0,
      geo_lat REAL,
      geo_lng REAL,
      geo_radius_m INTEGER DEFAULT 100
    );
  `);

  // QR Tokens Table (rotates every 18-20s)
  db.exec(`
    CREATE TABLE IF NOT EXISTS qr_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      unique_pin TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    );
  `);

  // Attendance Table (UNIQUE constraint per session and student_id prevents double-marking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      marked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      lat REAL,
      lng REAL,
      geo_verified INTEGER DEFAULT 0,
      token_used TEXT,
      UNIQUE(session_id, student_id),
      FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
    );
  `);

  // Admins Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    );
  `);

  // Create default admin if none exists
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get(adminUsername);
  if (!existingAdmin) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(adminPassword, salt);
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(adminUsername, hash);
    console.log(`[DB] Default admin initialized: username='${adminUsername}'`);
  }
}

initDb();

module.exports = db;

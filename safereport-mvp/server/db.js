const Database = require('better-sqlite3');
const crypto = require('crypto');

const db = new Database('safereport.db');
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS reports (
  case_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  incident_date TEXT,
  status TEXT NOT NULL DEFAULT 'Submitted',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  attachments TEXT,
  threat_score INTEGER DEFAULT 0,
  escalation_level INTEGER DEFAULT 0,
  escalated_to TEXT DEFAULT 'Department Head',
  ai_chat_log TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK(sender IN ('reporter','admin')),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(case_id) REFERENCES reports(case_id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id TEXT,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL
);
`);

// Basic migration to add columns if table already exists
try { db.exec("ALTER TABLE reports ADD COLUMN attachments TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE reports ADD COLUMN threat_score INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE reports ADD COLUMN escalation_level INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE reports ADD COLUMN escalated_to TEXT DEFAULT 'Department Head'"); } catch (e) {}
try { db.exec("ALTER TABLE reports ADD COLUMN ai_chat_log TEXT"); } catch (e) {}

// Token is hashed immediately — plaintext never touches the database
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function logAction(caseId, action, actor) {
  db.prepare(
    `INSERT INTO audit_log (case_id, action, actor, created_at) VALUES (?, ?, ?, ?)`
  ).run(caseId, action, actor, new Date().toISOString());
}

module.exports = { db, hashToken, logAction };

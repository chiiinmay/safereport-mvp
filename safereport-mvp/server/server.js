const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { db, hashToken, logAction } = require('./db');
const { generateCaseId, generateSecretToken } = require('./caseId');

const app = express();
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow all vercel.app deployments, localhost, and FRONTEND_URL env var
    const allowed = [
      /\.vercel\.app$/,
      /^http:\/\/localhost/,
    ];
    if (process.env.FRONTEND_URL) {
      allowed.push(process.env.FRONTEND_URL);
    }
    const isAllowed = allowed.some(pattern =>
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    );
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-key', 'x-role'],
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer config for Evidence Vault
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Rate limiting
const submitLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const trackLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30 });

const VALID_STATUSES = ['Submitted', 'Under Review', 'Investigation Active', 'Action Taken', 'Resolved'];

// --- AI Threat Detection Engine (Mock) ---
function calculateThreatScore(category, description) {
  let score = 10; // base score
  const text = (category + ' ' + description).toLowerCase();
  
  const highRiskWords = ['weapon', 'kill', 'suicide', 'die', 'blood', 'gun', 'knife', 'assault', 'rape'];
  const medRiskWords = ['hit', 'punch', 'threaten', 'scared', 'follow', 'stalk', 'force'];
  
  for (const word of highRiskWords) {
    if (text.includes(word)) score += 35;
  }
  for (const word of medRiskWords) {
    if (text.includes(word)) score += 15;
  }
  
  if (category === 'Sexual Harassment' || category === 'Safety Hazard') score += 20;
  
  return Math.min(score, 100);
}

// --- Student: Submit a report (with files) ---
app.post('/api/reports', submitLimiter, upload.array('files', 5), (req, res) => {
  const { category, description, location, incident_date, ai_chat_log, coordinates } = req.body;
  if (!category || !description) {
    return res.status(400).json({ error: 'category and description are required' });
  }

  const caseId = generateCaseId();
  const token = generateSecretToken();
  const now = new Date().toISOString();
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  // Handle files
  const attachments = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
  
  // AI Threat Detection
  const threatScore = calculateThreatScore(category, description);
  let initialStatus = 'Submitted';
  let escalatedTo = 'Department Head';
  let escalationLevel = 0;
  
  // Auto-escalate if threat score is critically high
  if (threatScore > 75) {
    escalationLevel = 1;
    escalatedTo = 'Anti-Harassment Committee';
  }

  db.prepare(`
    INSERT INTO reports (
      case_id, token_hash, category, description, location, incident_date, 
      status, created_at, updated_at, attachments, threat_score, escalation_level, escalated_to, ai_chat_log,
      ip_address, coordinates
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    caseId, hashToken(token), category, description, location || null, incident_date || null, 
    initialStatus, now, now, JSON.stringify(attachments), threatScore, escalationLevel, escalatedTo, ai_chat_log || null,
    ipAddress || null, coordinates || null
  );

  logAction(caseId, `Report submitted. Threat Score: ${threatScore}`, 'system');

  res.status(201).json({ caseId, token, threatScore });
});

// --- Student: Emergency SOS ---
app.post('/api/sos', submitLimiter, (req, res) => {
  const { location, coordinates } = req.body;
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  const caseId = generateCaseId();
  const token = generateSecretToken();
  const now = new Date().toISOString();
  const desc = `EMERGENCY SOS TRIGGERED. Location: ${location || 'Unknown'}. Coords: ${coordinates || 'Unknown'}`;
  
  db.prepare(`
    INSERT INTO reports (
      case_id, token_hash, category, description, location, incident_date, 
      status, created_at, updated_at, attachments, threat_score, escalation_level, escalated_to, ai_chat_log,
      ip_address, coordinates
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    caseId, hashToken(token), 'Emergency', desc, location || null, now, 
    'Investigation Active', now, now, '[]', 100, 2, 'Police / Security', null,
    ipAddress || null, coordinates || null
  );

  logAction(caseId, 'SOS Emergency Triggered', 'system');
  res.status(201).json({ caseId, token, alert: 'Security dispatched' });
});

// --- Student: check status (requires caseId + token) ---
app.post('/api/reports/:caseId/status', trackLimiter, (req, res) => {
  const { caseId } = req.params;
  const { token } = req.body;
  const report = db.prepare(`SELECT * FROM reports WHERE case_id = ?`).get(caseId);

  if (!report || report.token_hash !== hashToken(token || '')) {
    return res.status(404).json({ error: 'Case not found or token invalid' });
  }

  const messages = db.prepare(
    `SELECT sender, body, created_at FROM messages WHERE case_id = ? ORDER BY created_at ASC`
  ).all(caseId);

  res.json({
    caseId: report.case_id,
    status: report.status,
    updatedAt: report.updated_at,
    attachments: report.attachments ? JSON.parse(report.attachments) : [],
    escalatedTo: report.escalated_to,
    messages,
  });
});

// --- Student: reply in the anonymous thread ---
app.post('/api/reports/:caseId/messages', trackLimiter, (req, res) => {
  const { caseId } = req.params;
  const { token, body } = req.body;
  const report = db.prepare(`SELECT * FROM reports WHERE case_id = ?`).get(caseId);

  if (!report || report.token_hash !== hashToken(token || '')) {
    return res.status(404).json({ error: 'Case not found or token invalid' });
  }
  if (!body || !body.trim()) {
    return res.status(400).json({ error: 'message body required' });
  }

  db.prepare(
    `INSERT INTO messages (case_id, sender, body, created_at) VALUES (?, 'reporter', ?, ?)`
  ).run(caseId, body.trim(), new Date().toISOString());

  logAction(caseId, 'Reporter sent message', 'reporter');
  res.status(201).json({ ok: true });
});

// --- Admin: list all cases ---
function requireAdmin(req, res, next) {
  if (req.headers['x-admin-key'] !== (process.env.ADMIN_KEY || 'demo-admin-key')) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/api/admin/reports', requireAdmin, (req, res) => {
  // Mock role-based filtering for the hackathon
  const role = req.headers['x-role'] || 'Department Head'; // 'Department Head', 'Committee', 'Police'
  let minEscalation = 0;
  if (role === 'Committee') minEscalation = 1;
  if (role === 'Police') minEscalation = 2;

  const reports = db.prepare(
    `SELECT case_id, category, status, created_at, updated_at, threat_score, escalation_level, escalated_to 
     FROM reports WHERE escalation_level >= ? ORDER BY created_at DESC`
  ).all(minEscalation);
  
  res.json(reports);
});

app.get('/api/admin/reports/:caseId', requireAdmin, (req, res) => {
  const report = db.prepare(`SELECT * FROM reports WHERE case_id = ?`).get(req.params.caseId);
  if (!report) return res.status(404).json({ error: 'not found' });
  
  const messages = db.prepare(
    `SELECT sender, body, created_at FROM messages WHERE case_id = ? ORDER BY created_at ASC`
  ).all(req.params.caseId);
  
  delete report.token_hash;
  report.attachments = report.attachments ? JSON.parse(report.attachments) : [];
  report.ai_chat_log = report.ai_chat_log ? JSON.parse(report.ai_chat_log) : null;
  res.json({ ...report, messages });
});

app.patch('/api/admin/reports/:caseId/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${VALID_STATUSES.join(', ')}` });
  }
  const now = new Date().toISOString();
  const result = db.prepare(
    `UPDATE reports SET status = ?, updated_at = ? WHERE case_id = ?`
  ).run(status, now, req.params.caseId);

  if (result.changes === 0) return res.status(404).json({ error: 'not found' });
  logAction(req.params.caseId, `Status changed to ${status}`, 'admin');
  res.json({ ok: true });
});

app.patch('/api/admin/reports/:caseId/escalate', requireAdmin, (req, res) => {
  const report = db.prepare(`SELECT * FROM reports WHERE case_id = ?`).get(req.params.caseId);
  if (!report) return res.status(404).json({ error: 'not found' });

  let newLevel = report.escalation_level + 1;
  let newEscalatedTo = 'Department Head';
  if (newLevel === 1) newEscalatedTo = 'Anti-Harassment Committee';
  if (newLevel >= 2) {
    newLevel = 2;
    newEscalatedTo = 'Principal / Police';
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE reports SET escalation_level = ?, escalated_to = ?, updated_at = ? WHERE case_id = ?`
  ).run(newLevel, newEscalatedTo, now, req.params.caseId);

  logAction(req.params.caseId, `Escalated to ${newEscalatedTo}`, 'admin');
  res.json({ ok: true, escalation_level: newLevel, escalated_to: newEscalatedTo });
});

app.post('/api/admin/reports/:caseId/messages', requireAdmin, (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) return res.status(400).json({ error: 'message body required' });

  db.prepare(
    `INSERT INTO messages (case_id, sender, body, created_at) VALUES (?, 'admin', ?, ?)`
  ).run(req.params.caseId, body.trim(), new Date().toISOString());

  logAction(req.params.caseId, 'Admin sent message', 'admin');
  res.status(201).json({ ok: true });
});

app.get('/api/admin/analytics', requireAdmin, (req, res) => {
  const categoryCounts = db.prepare(`SELECT category, COUNT(*) as count FROM reports GROUP BY category`).all();
  const escalationCounts = db.prepare(`SELECT escalated_to, COUNT(*) as count FROM reports GROUP BY escalated_to`).all();
  
  res.json({
    categories: categoryCounts,
    escalations: escalationCounts
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`SafeReport Backend (Phase 3) running on http://localhost:${PORT}`));

const fs = require('fs');
const path = require('path');
const p = path.join(process.cwd(), 'server.ts');
let s = fs.readFileSync(p, 'utf8');

if (!s.includes('better-sqlite3')) {
  s = s.replace('import path from "path";', 'import path from "path";\nimport fs from "fs";\nimport Database from "better-sqlite3";');
}

if (!s.includes('getAllLeads')) {
  s = s.replace(
    'const ACTIVE_SESSIONS: { [token: string]: any } = {};',
    `const ACTIVE_SESSIONS: { [token: string]: any } = {};

const dataDir = path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "cottonrecycle.sqlite"));
db.exec("CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, type TEXT, name TEXT, company TEXT, email TEXT, message TEXT, payload TEXT, status TEXT, createdAt TEXT)");

function mapLead(row: any) {
  return { ...row, payload: row.payload ? JSON.parse(row.payload) : {} };
}

function getAllLeads() {
  return db.prepare("SELECT * FROM leads ORDER BY createdAt DESC").all().map(mapLead);
}`
  );
}

s = s.replace(/\nlet LEADS: any\[\] = \[\];\n/g, '\n');

s = s.replace(
  '  LEADS = [newLead, ...LEADS];\n\n  res.status(201).json({\n    success: true,\n    lead: newLead,\n    leads: LEADS,\n  });',
  '  db.prepare("INSERT INTO leads (id, type, name, company, email, message, payload, status, createdAt) VALUES (@id, @type, @name, @company, @email, @message, @payload, @status, @createdAt)").run({ ...newLead, payload: JSON.stringify(newLead.payload || {}) });\n\n  res.status(201).json({\n    success: true,\n    lead: newLead,\n    leads: getAllLeads(),\n  });'
);

s = s.replace('  res.json({ leads: LEADS });', '  res.json({ leads: getAllLeads() });');

s = s.replace(
  '  const lead = LEADS.find(l => l.id === id);\n\n  if (!lead) {\n    return res.status(404).json({ error: "Lead not found" });\n  }\n\n  lead.status = status || lead.status;\n\n  res.json({ success: true, lead, leads: LEADS });',
  '  const existing = db.prepare("SELECT * FROM leads WHERE id = ?").get(id);\n\n  if (!existing) {\n    return res.status(404).json({ error: "Lead not found" });\n  }\n\n  db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status || existing.status, id);\n  const lead = db.prepare("SELECT * FROM leads WHERE id = ?").get(id);\n\n  res.json({ success: true, lead: mapLead(lead), leads: getAllLeads() });'
);

s = s.replace(
  '  const beforeCount = LEADS.length;\n  LEADS = LEADS.filter(l => l.id !== id);\n\n  if (LEADS.length === beforeCount) {\n    return res.status(404).json({ error: "Lead not found" });\n  }\n\n  res.json({ success: true, leads: LEADS });',
  '  const result = db.prepare("DELETE FROM leads WHERE id = ?").run(id);\n\n  if (result.changes === 0) {\n    return res.status(404).json({ error: "Lead not found" });\n  }\n\n  res.json({ success: true, leads: getAllLeads() });'
);

fs.writeFileSync(p, s, 'utf8');

const gi = path.join(process.cwd(), '.gitignore');
let g = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
if (!g.includes('data/*.sqlite')) {
  g += '\ndata/*.sqlite\ndata/*.sqlite-*\n';
  fs.writeFileSync(gi, g, 'utf8');
}

console.log('SQLite lead persistence installed. Run npm install && npm run build');

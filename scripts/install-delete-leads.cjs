const fs = require('fs');
const path = require('path');
const root = process.cwd();
const file = (p) => path.join(root, p);
const read = (p) => fs.readFileSync(file(p), 'utf8');
const write = (p, c) => fs.writeFileSync(file(p), c, 'utf8');
const patch = (p, fn) => { const before = read(p); const after = fn(before); write(p, after); console.log(before === after ? `SKIP ${p}` : `PATCH ${p}`); };

patch('server.ts', (s) => {
  if (s.includes('app.delete("/api/leads/:id"')) return s;
  const marker = 'app.post("/api/leads/:id/status", reqAuth, (req: any, res) => {';
  const idx = s.indexOf(marker);
  if (idx === -1) return s;
  const endMarker = '\n});';
  const end = s.indexOf(endMarker, idx);
  if (end === -1) return s;
  const insertAt = end + endMarker.length;
  const block = `

app.delete("/api/leads/:id", reqAuth, (req: any, res) => {
  if (req.user.role !== "ADMIN" && req.user.role !== "INVESTOR") {
    return res.status(403).json({ error: "Access denied" });
  }

  const { id } = req.params;
  const beforeCount = LEADS.length;
  LEADS = LEADS.filter(l => l.id !== id);

  if (LEADS.length === beforeCount) {
    return res.status(404).json({ error: "Lead not found" });
  }

  res.json({ success: true, leads: LEADS });
});`;
  return s.slice(0, insertAt) + block + s.slice(insertAt);
});

patch('src/lib/api.ts', (s) => {
  if (s.includes('export async function deleteLead')) return s;
  return s + `

export async function deleteLead(id: string): Promise<Lead[]> {
  const res = await fetch(API_BASE + "/api/leads/" + id, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const data = await res.json();
  return data.leads || [];
}
`;
});

patch('src/components/DashboardPortal.tsx', (s) => {
  s = s.replace('getLeads, updateLeadStatus', 'getLeads, updateLeadStatus, deleteLead');
  if (!s.includes('handleDeleteLead')) {
    s = s.replace('  const handleUpdateLeadStatus = async (leadId: string, status: Lead["status"]) => {', '  const handleDeleteLead = async (leadId: string) => {\n    const confirmed = window.confirm("Delete this lead permanently? This cannot be undone.");\n    if (!confirmed) return;\n\n    try {\n      const updated = await deleteLead(leadId);\n      setLeads(updated);\n      onShowNotification("Lead deleted.");\n    } catch {\n      onShowNotification("Unable to delete lead.");\n    }\n  };\n\n  const handleUpdateLeadStatus = async (leadId: string, status: Lead["status"]) => {');
  }
  if (!s.includes('Delete Lead')) {
    s = s.replace('                          ))}\n                        </div>', '                          ))}\n                          <button\n                            onClick={() => handleDeleteLead(lead.id)}\n                            className="px-2.5 py-1 rounded text-[10px] font-mono border bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 transition"\n                          >\n                            Delete Lead\n                          </button>\n                        </div>');
  }
  return s;
});

console.log('Done. Run: npm run build');

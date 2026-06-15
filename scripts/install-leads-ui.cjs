const fs = require('fs');
const path = require('path');

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const write = (file, content) => fs.writeFileSync(path.join(root, file), content, 'utf8');
const replaceOnce = (content, search, replacement, label) => {
  if (!content.includes(search)) {
    console.log(`SKIP ${label} - pattern not found or already patched`);
    return content;
  }
  console.log(`PATCH ${label}`);
  return content.replace(search, replacement);
};

// 1) src/types.ts
let types = read('src/types.ts');
if (!types.includes('export interface Lead')) {
  types += `

export type LeadType = "INVESTOR_DECK" | "CONTACT" | "SUPPLIER" | "BUYER";
export type LeadStatus = "NEW" | "FOLLOWED_UP" | "APPOINTMENT_PLANNED" | "CLOSED";

export interface Lead {
  id: string;
  type: LeadType;
  name: string;
  company: string;
  email: string;
  message: string;
  payload: Record<string, any>;
  status: LeadStatus;
  createdAt: string;
}
`;
  write('src/types.ts', types);
  console.log('PATCH src/types.ts');
} else {
  console.log('SKIP src/types.ts - Lead already exists');
}

// 2) src/lib/api.ts
let api = read('src/lib/api.ts');
api = replaceOnce(
  api,
  'IngestRequest, Shipment, InventoryItem, EsgReport, InvestorAnalytics',
  'IngestRequest, Shipment, InventoryItem, EsgReport, InvestorAnalytics, Lead',
  'api import Lead'
);
if (!api.includes('export async function submitLead')) {
  api += `

export async function submitLead(lead: Partial<Lead>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getLeads(): Promise<Lead[]> {
  try {
    const res = await fetch(`${API_BASE}/api/leads`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.leads || [];
  } catch {
    return [];
  }
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<Lead[]> {
  const res = await fetch(`${API_BASE}/api/leads/${id}/status`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  return data.leads || [];
}
`;
  write('src/lib/api.ts', api);
  console.log('PATCH src/lib/api.ts lead functions');
} else {
  console.log('SKIP src/lib/api.ts - lead functions already exist');
}

// 3) src/components/PublicWebsite.tsx
let publicWebsite = read('src/components/PublicWebsite.tsx');
if (!publicWebsite.includes('submitLeadFromPublicWebsite')) {
  publicWebsite = replaceOnce(
    publicWebsite,
    '  const savings = calculateSavings();\n\n',
    `  const savings = calculateSavings();

  const submitLeadFromPublicWebsite = async (lead: any) => {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (!res.ok) {
      throw new Error("Lead submission failed");
    }

    return res.json();
  };

`,
    'PublicWebsite add submitLead helper'
  );
}

publicWebsite = replaceOnce(
  publicWebsite,
  `  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSupplierRegisterSuccess(` + '`Supplier Onboarding Submitted! Our B2B operations unit has registered ${supplierForm.company}. A mechanical engineering coordinator will contact ${supplierForm.contact} within 6 business hours.`' + `);
    setSupplierForm({
      company: "",
      contact: "",
      country: "",
      category: "Post-Industrial Shear Scraps",
      volume: "",
      material: "",
      certifications: "",
      pickup: "",
      email: ""
    });
    setSupplierStep(1);
    document.getElementById("hero-section")?.scrollIntoView({ behavior: 'smooth' });
  };

`,
  `  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLeadFromPublicWebsite({
        type: "SUPPLIER",
        name: supplierForm.contact,
        company: supplierForm.company,
        email: supplierForm.email,
        message: `${supplierForm.category} - ${supplierForm.volume} kg/month - ${supplierForm.material}`,
        payload: supplierForm,
      });
      onSupplierRegisterSuccess(` + '`Supplier Onboarding Submitted! Our B2B operations unit has registered ${supplierForm.company}. A mechanical engineering coordinator will contact ${supplierForm.contact} within 6 business hours.`' + `);
      setSupplierForm({
        company: "",
        contact: "",
        country: "",
        category: "Post-Industrial Shear Scraps",
        volume: "",
        material: "",
        certifications: "",
        pickup: "",
        email: ""
      });
      setSupplierStep(1);
      document.getElementById("hero-section")?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      alert("Submission failed. Please try again or contact info@cottonrecycle.com.");
    }
  };

`,
  'PublicWebsite supplier submit'
);

publicWebsite = replaceOnce(
  publicWebsite,
  `  const handleBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuyerRegisterSuccess(` + '`Enterprise Buyer Request Registered! Saved requirements for ${buyerForm.company}. Welcome aboard dynamic circular sourcing allocation.`' + `);
    setBuyerForm({
      company: "",
      contact: "",
      email: "",
      category: "Premium Fashion Brand",
      volumeGoal: "25000",
      certificationNeeded: "GRS Standard Certified"
    });
    document.getElementById("hero-section")?.scrollIntoView({ behavior: 'smooth' });
  };

`,
  `  const handleBuyerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLeadFromPublicWebsite({
        type: "BUYER",
        name: buyerForm.contact,
        company: buyerForm.company,
        email: buyerForm.email,
        message: `${buyerForm.category} - ${buyerForm.volumeGoal} kg/year - ${buyerForm.certificationNeeded}`,
        payload: buyerForm,
      });
      onBuyerRegisterSuccess(` + '`Enterprise Buyer Request Registered! Saved requirements for ${buyerForm.company}. Welcome aboard dynamic circular sourcing allocation.`' + `);
      setBuyerForm({
        company: "",
        contact: "",
        email: "",
        category: "Premium Fashion Brand",
        volumeGoal: "25000",
        certificationNeeded: "GRS Standard Certified"
      });
      document.getElementById("hero-section")?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      alert("Submission failed. Please try again or contact info@cottonrecycle.com.");
    }
  };

  const handleInvestorDeckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLeadFromPublicWebsite({
        type: "INVESTOR_DECK",
        name: investorDeckForm.name,
        company: investorDeckForm.fund,
        email: investorDeckForm.email,
        message: investorDeckForm.accredited === "YES" ? "Accredited institutional investor" : "Individual sourcing group",
        payload: investorDeckForm,
      });
      setShowDeckSuccess(true);
    } catch {
      alert("Investor request failed. Please try again or contact info@cottonrecycle.com.");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitLeadFromPublicWebsite({
        type: "CONTACT",
        name: contactForm.name,
        company: contactForm.company,
        email: contactForm.email,
        message: `${contactForm.interest}: ${contactForm.message}`,
        payload: contactForm,
      });
      setShowContactSuccess(true);
    } catch {
      alert("Message failed. Please try again or contact info@cottonrecycle.com.");
    }
  };

`,
  'PublicWebsite buyer/investor/contact handlers'
);

publicWebsite = replaceOnce(publicWebsite, '<form onSubmit={(e) => { e.preventDefault(); setShowDeckSuccess(true); }} className="space-y-4">', '<form onSubmit={handleInvestorDeckSubmit} className="space-y-4">', 'PublicWebsite investor form onSubmit');
publicWebsite = replaceOnce(publicWebsite, '<form onSubmit={(e) => { e.preventDefault(); setShowContactSuccess(true); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">', '<form onSubmit={handleContactSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">', 'PublicWebsite contact form onSubmit');
publicWebsite = publicWebsite.replace(/onChange=\{\(e\) => setSupplierForm\(\{\.\.\.buyerForm, volumeGoal: e\.target\.value\}\)\}/g, 'onChange={(e) => setBuyerForm({...buyerForm, volumeGoal: e.target.value})}');
publicWebsite = publicWebsite.replace(/onChange=\{\(e\) => setSupplierForm\(\{\.\.\.buyerForm, certificationNeeded: e\.target\.value\}\)\}/g, 'onChange={(e) => setBuyerForm({...buyerForm, certificationNeeded: e.target.value})}');
write('src/components/PublicWebsite.tsx', publicWebsite);

// 4) src/components/DashboardPortal.tsx
let dashboard = read('src/components/DashboardPortal.tsx');
dashboard = replaceOnce(
  dashboard,
  'import { User, Listing, RFQ, Order, FactoryMetrics, FactoryBatch, IngestRequest, Shipment, InventoryItem, EsgReport } from "../types";',
  'import { User, Listing, RFQ, Order, FactoryMetrics, FactoryBatch, IngestRequest, Shipment, InventoryItem, EsgReport, Lead } from "../types";',
  'Dashboard import Lead'
);
dashboard = replaceOnce(
  dashboard,
  '  getInvestorAnalytics, askAiProcurement \n} from "../lib/api";',
  '  getInvestorAnalytics, askAiProcurement, getLeads, updateLeadStatus \n} from "../lib/api";',
  'Dashboard import lead api'
);
dashboard = replaceOnce(
  dashboard,
  '  const [investorAnalytics, setInvestorAnalytics] = useState<any | null>(null);\n',
  '  const [investorAnalytics, setInvestorAnalytics] = useState<any | null>(null);\n  const [leads, setLeads] = useState<Lead[]>([]);\n',
  'Dashboard leads state'
);
dashboard = replaceOnce(
  dashboard,
  `      if (user.role === "ADMIN" || user.role === "INVESTOR") {
        const invAnalytics = await getInvestorAnalytics();
        setInvestorAnalytics(invAnalytics);
      }
`,
  `      if (user.role === "ADMIN" || user.role === "INVESTOR") {
        const invAnalytics = await getInvestorAnalytics();
        setInvestorAnalytics(invAnalytics);
        const dbLeads = await getLeads();
        setLeads(dbLeads);
      }
`,
  'Dashboard reload leads'
);
dashboard = replaceOnce(
  dashboard,
  `  // Ask Chat Core Sourcing AI
`,
  `  const handleUpdateLeadStatus = async (leadId: string, status: Lead["status"]) => {
    try {
      const updated = await updateLeadStatus(leadId, status);
      setLeads(updated);
      onShowNotification(` + '`Lead status updated to ${status}.`' + `);
    } catch {
      onShowNotification("Unable to update lead status.");
    }
  };

  // Ask Chat Core Sourcing AI
`,
  'Dashboard lead status handler'
);
dashboard = replaceOnce(
  dashboard,
  `            {/* B2B Sourcing Hub - ALL roles */}
`,
  `            {(user.role === "ADMIN" || user.role === "INVESTOR") && (
              <button
                onClick={() => setActiveTab("leads")}
                id="tab-leads-btn"
                className={\`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                  activeTab === "leads" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }\`}
              >
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Incoming Leads</span>
              </button>
            )}

            {/* B2B Sourcing Hub - ALL roles */}
`,
  'Dashboard nav leads'
);
dashboard = replaceOnce(
  dashboard,
  `        {/* ======================================= */}
        {/* TAB 1: COMMAND CENTER */}
        {/* ======================================= */}
`,
  `        {activeTab === "leads" && (
          <div className="space-y-6">
            <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">Incoming Leads</h3>
                  <p className="text-gray-500 text-xs">Investor, supplier, buyer and contact form submissions.</p>
                </div>
                <span className="text-xs text-emerald-400 font-mono">{leads.length} leads</span>
              </div>

              {leads.length === 0 ? (
                <div className="text-gray-500 text-sm border border-gray-850 rounded-xl p-6 bg-black/30">
                  No leads received yet. Submit a test form on the public website.
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border border-gray-850/80 rounded-xl p-4 bg-[#0b0f11]/70 space-y-3">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{lead.type}</span>
                            <span className="font-mono text-[10px] text-gray-500">{new Date(lead.createdAt).toLocaleString()}</span>
                            <span className="font-mono text-[10px] text-white bg-gray-800 px-2 py-0.5 rounded">{lead.status}</span>
                          </div>
                          <h4 className="text-white font-bold text-sm">{lead.name || "Unknown contact"}</h4>
                          <p className="text-gray-400 text-xs">{lead.company || "No company"} • {lead.email || "No email"}</p>
                          {lead.message && <p className="text-gray-300 text-xs mt-2 leading-relaxed">{lead.message}</p>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(["NEW", "FOLLOWED_UP", "APPOINTMENT_PLANNED", "CLOSED"] as Lead["status"][]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleUpdateLeadStatus(lead.id, status)}
                              className={\`px-2.5 py-1 rounded text-[10px] font-mono border transition ${
                                lead.status === status ? "bg-emerald-500 text-black border-emerald-500" : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"
                              }\`}
                            >
                              {status.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB 1: COMMAND CENTER */}
        {/* ======================================= */}
`,
  'Dashboard leads tab content'
);
write('src/components/DashboardPortal.tsx', dashboard);

console.log('\nDone. Now run: npm run build');

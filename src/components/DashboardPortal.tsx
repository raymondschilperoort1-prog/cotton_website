import React, { useState, useEffect } from "react";
import { 
  Building, LogOut, LayoutDashboard, RefreshCw, ShoppingBag, 
  Layers, BrainCircuit, Forklift, BarChart3, Radio, FileCheck, 
  MapPin, Clock, Search, Filter, PlusCircle, Send, Sparkles, 
  CheckCircle, ArrowRight, ShieldAlert, Cpu, Thermometer, Droplets,
  Coins, Milestone, Landmark
} from "lucide-react";
import { User, Listing, RFQ, Order, FactoryMetrics, FactoryBatch, IngestRequest, Shipment, InventoryItem, EsgReport, Lead } from "../types";
import { 
  getListings, createListing, getRFQs, createRFQ, submitBid, 
  purchaseListing, getOrders, getIngestRequests, createIngestRequest, 
  updateIngestStatus, getFactoryData, createFactoryBatch, 
  updateBatchProgress, getShipments, getInventory, getEsgLedger, 
  getInvestorAnalytics, askAiProcurement, getLeads, updateLeadStatus, deleteLead 
} from "../lib/api";

interface DashboardPortalProps {
  user: User;
  onLogout: () => void;
  onShowNotification: (msg: string) => void;
}

export default function DashboardPortal({ user, onLogout, onShowNotification }: DashboardPortalProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<string>("command"); // command, exchange, raas, esg, ai, logistics, finances
  
  // States of Databases loaded from backend
  const [listings, setListings] = useState<Listing[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ingest, setIngest] = useState<IngestRequest[]>([]);
  const [factoryMetrics, setFactoryMetrics] = useState<FactoryMetrics | null>(null);
  const [factoryBatches, setFactoryBatches] = useState<FactoryBatch[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [esgLedger, setEsgLedger] = useState<EsgReport[]>([]);
  const [investorAnalytics, setInvestorAnalytics] = useState<any | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Interaction Forms States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [purchaseQty, setPurchaseQty] = useState<{ [listingId: string]: number }>({});
  
  // New Listing Form state
  const [showNewListingModal, setShowNewListingModal] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "",
    category: "Yarn",
    material: "90% Mechanical Recycled Cotton / 10% Virgin Backing",
    grade: "Grade A Premium",
    volume: "10000",
    pricePerKg: "3.50",
    location: "Rotterdam Hub",
    certificate: "GRS Standard Certified"
  });

  // New RFQ Form state
  const [showNewRfqModal, setShowNewRfqModal] = useState(false);
  const [newRfq, setNewRfq] = useState({
    title: "",
    targetVolume: "15000",
    maxBudget: "45000",
    deadline: "2026-07-30",
    description: "Requesting long-staple carded mechanical ring yarn blend."
  });

  // Circular Ingest request modal state
  const [showRfqIngestModal, setShowRfqIngestModal] = useState(false);
  const [newIngest, setNewIngest] = useState({
    category: "Post-Industrial Shear Scraps",
    estimatedVolumeMs: "25000",
    materialType: "100% Cotton Denim Cut residues",
    certification: "GRS Standard Certified",
    pickupRequirements: "Weekly container rotation with automated lift trucks"
  });

  // AI assistant chat state
  const [aiPrompt, setAiPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([
    { role: "model", content: `Welcome back, **${user.name}**. Sourcing advisory core online. Suggest fiber ratios, calculate mechanical environmental outputs, or verify cargo routing codes instantly.` }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Load backend stats
  const reloadData = async () => {
    try {
      const dbListings = await getListings();
      const dbRfqs = await getRFQs();
      const dbOrders = await getOrders();
      const dbIngest = await getIngestRequests();
      const fData = await getFactoryData();
      const dbShipments = await getShipments();
      const dbInventory = await getInventory();
      const dbEsg = await getEsgLedger();

      setListings(dbListings);
      setRfqs(dbRfqs);
      setOrders(dbOrders);
      setIngest(dbIngest);
      setFactoryMetrics(fData.metrics);
      setFactoryBatches(fData.batches);
      setShipments(dbShipments);
      setInventory(dbInventory);
      setEsgLedger(dbEsg);

      if (user.role === "ADMIN" || user.role === "INVESTOR") {
        const invAnalytics = await getInvestorAnalytics();
        setInvestorAnalytics(invAnalytics);
        const dbLeads = await getLeads();
        setLeads(dbLeads);
      }
    } catch (err) {
      console.error("Error loading dashboard portal datasets", err);
    }
  };

  useEffect(() => {
    reloadData();
    // Auto-select tab depending on role
    if (user.role === "INVESTOR") {
      setActiveTab("finances");
    } else if (user.role === "SUPPLIER") {
      setActiveTab("raas");
    } else if (user.role === "BUYER") {
      setActiveTab("exchange");
    } else {
      setActiveTab("command");
    }
  }, [user]);

  // Handle Quick buy actions
  const handlePurchase = async (listingId: string) => {
    const qty = purchaseQty[listingId] || 1000;
    try {
      const res = await purchaseListing(listingId, qty);
      setListings(res.listings);
      setOrders(res.orders);
      onShowNotification(`Sourcing agreement generated! Dispatched contract for ${(qty).toLocaleString()} kg of Mechanical Raw fibers. Order logged under strict GRS passports.`);
      reloadData();
    } catch (err: any) {
      onShowNotification(`Purchase denied: ${err.message}`);
    }
  };

  // Create Listing Submit
  const handleCreateListingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await createListing({
        title: newListing.title,
        category: newListing.category,
        material: newListing.material,
        grade: newListing.grade,
        volume: Number(newListing.volume),
        pricePerKg: Number(newListing.pricePerKg),
        location: newListing.location,
        certificate: newListing.certificate
      });
      setListings(updated);
      setShowNewListingModal(false);
      onShowNotification("B2B listing published successfully on cotton exchange directory.");
      reloadData();
    } catch (err: any) {
      onShowNotification(`Failed publishing listing: ${err.message}`);
    }
  };

  // Create RFQ Submit
  const handleCreateRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await createRFQ({
        title: newRfq.title,
        targetVolume: Number(newRfq.targetVolume),
        maxBudget: Number(newRfq.maxBudget),
        deadline: newRfq.deadline,
        description: newRfq.description
      });
      setRfqs(updated);
      setShowNewRfqModal(false);
      onShowNotification("Strategic RFQ published in circular sourcing channel.");
      reloadData();
    } catch (err: any) {
      onShowNotification(`Failed creating RFQ: ${err.message}`);
    }
  };

  // Submit Bid/Offer to active RFQ
  const handleBidOnRfq = async (rfqId: string) => {
    try {
      const updated = await submitBid(rfqId);
      setRfqs(updated);
      onShowNotification("Secure contract bid registered on this RFQ. Price index benchmark is matching.");
    } catch {
      onShowNotification("Failed to transmit bid.");
    }
  };

  // Schedule pickup (RaaS Intake)
  const handleCreateIngestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await createIngestRequest({
      company: user.company,
      contactPerson: user.name,
      country: "Global",
      category: newIngest.category,
      estimatedVolumeMs: Number(newIngest.estimatedVolumeMs),
      materialType: newIngest.materialType,
      certification: newIngest.certification,
      pickupRequirements: newIngest.pickupRequirements
    });
    if (success) {
      onShowNotification("Circular recycling-as-a-service (RaaS) intake request submitted for corporate audit.");
      setShowRfqIngestModal(false);
      reloadData();
    } else {
      onShowNotification("Intake submission failed.");
    }
  };

  // Admin function: Advance machine progression step
  const handleAdvanceBatch = async (batchId: string, currentStep: number) => {
    const stepsList = [
      "Intake & Moisture Verification",
      "Automated NIR Fiber Sorting",
      "Trim Stripping & Magnetic Segregation",
      "Shredding & Fiber Liberation",
      "Air-flow Cyclone Sifting",
      "Electrostatic Purification",
      "Mechanical Processing Complete (Baled)"
    ];
    let nextStepIndex = currentStep + 15;
    if (nextStepIndex > 100) nextStepIndex = 100;
    
    // Choose step string based on progress percentage range
    let stepStr = stepsList[Math.floor((nextStepIndex / 100) * (stepsList.length - 1))];
    try {
      const updated = await updateBatchProgress(batchId, nextStepIndex, stepStr, "Process Line #1");
      setFactoryBatches(updated);
      onShowNotification(`Mechanical Processing advanced successfully for Batch ${batchId}. (Progress updated to ${nextStepIndex}%)`);
      reloadData();
    } catch {
      onShowNotification("Error updating batch.");
    }
  };

  // Admin function: Approve Supplier Intake Request
  const handleApproveIngest = async (requestId: string) => {
    try {
      const updated = await updateIngestStatus(requestId, "SCHEDULED", "2026-06-03");
      setIngest(updated);
      onShowNotification(`Intake shipment request #${requestId} transition to scheduled rotation.`);
      reloadData();
    } catch {
      onShowNotification("Error approving intake request.");
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    const confirmed = window.confirm("Delete this lead permanently? This cannot be undone.");
    if (!confirmed) return;

    try {
      const updated = await deleteLead(leadId);
      setLeads(updated);
      onShowNotification("Lead deleted.");
    } catch {
      onShowNotification("Unable to delete lead.");
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: Lead["status"]) => {
    try {
      const updated = await updateLeadStatus(leadId, status);
      setLeads(updated);
      onShowNotification("Lead status updated to " + status + ".");
    } catch {
      onShowNotification("Unable to update lead status.");
    }
  };

  // Ask Chat Core Sourcing AI
  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userMsg = aiPrompt;
    setAiPrompt("");
    setChatHistory(prev => [...prev, { role: "user", content: userMsg }]);
    setAiLoading(true);

    const botReply = await askAiProcurement(userMsg, chatHistory);
    setAiLoading(false);
    setChatHistory(prev => [...prev, { role: "model", content: botReply }]);
  };

  // Filter listings based on categories/queries
  const filteredListings = listings.filter((l) => {
    const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.material.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "ALL" || l.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#060a0b] flex flex-col md:flex-row items-stretch select-none">
      
      {/* SIDEBAR FOR AUTH PORTALS */}
      <aside className="w-full md:w-64 bg-[#0d1214] border-r border-gray-800/80 flex flex-col justify-between p-4 md:sticky md:top-0 md:h-screen">
        
        <div className="space-y-6">
          {/* Logo Title inside Portal */}
          <div className="flex items-center space-x-2.5 pb-4 border-b border-gray-800/80">
            <div className="bg-emerald-500 text-black px-2 py-1 rounded font-bold font-mono tracking-tighter text-xs">
              CR 
            </div>
            <div>
              <span className="font-display font-extrabold text-sm text-white tracking-tight flex items-center">
                CottonRecycle<span className="text-emerald-500 font-semibold">™</span>
              </span>
              <span className="text-[9px] text-[#059669] font-mono tracking-widest font-semibold block uppercase">
                B2B CENTRAL STATION
              </span>
            </div>
          </div>

          {/* User profile identifier block */}
          <div className="bg-black/55 border border-gray-800 p-2.5 rounded-lg flex items-center space-x-3">
            <img referrerPolicy="no-referrer" src={user.avatar} className="w-10 h-10 rounded-full border border-gray-800" alt={user.name} />
            <div className="min-w-0 flex-1">
              <h4 className="text-white text-xs font-bold leading-tight line-clamp-1">{user.name}</h4>
              <span className="text-[10px] text-emerald-400 font-mono block tracking-wider uppercase">{user.role}</span>
              <p className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">{user.company}</p>
            </div>
          </div>

          {/* Nav Menus */}
          <nav className="space-y-1">
            
            {/* Command center - visible to ADMIN, INVESTOR, SUPPLIER */}
            <button
              onClick={() => setActiveTab("command")}
              id="tab-command-btn"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                activeTab === "command" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Factory Command</span>
            </button>

            {(user.role === "ADMIN" || user.role === "INVESTOR") && (
              <button
                onClick={() => setActiveTab("leads")}
                id="tab-leads-btn"
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${activeTab === "leads" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"}`}
              >
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Incoming Leads</span>
              </button>
            )}

            {/* B2B Sourcing Hub - ALL roles */}
            <button
              onClick={() => setActiveTab("exchange")}
              id="tab-exchange-btn"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                activeTab === "exchange" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>B2B Cotton Exchange</span>
            </button>

            {/* Ingest pickup portal - Suppliers / Admins */}
            <button
              onClick={() => setActiveTab("raas")}
              id="tab-raas-btn"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                activeTab === "raas" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Forklift className="w-4 h-4 text-emerald-400" />
              <span>Circular Ingest (RaaS)</span>
            </button>

            {/* ESG certificates database */}
            <button
              onClick={() => setActiveTab("esg")}
              id="tab-esg-btn"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                activeTab === "esg" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>ESG Material Ledger</span>
            </button>

            {/* Sourcing AI Assistant */}
            <button
              onClick={() => setActiveTab("ai")}
              id="tab-ai-btn"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                activeTab === "ai" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              <span>AI Sourcing Advisor</span>
            </button>

            {/* Container tracking logistics info */}
            <button
              onClick={() => setActiveTab("logistics")}
              id="tab-logistics-btn"
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                activeTab === "logistics" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Container Logistics</span>
            </button>

            {/* Revenue Analytics (Admin / Investors only) */}
            {(user.role === "ADMIN" || user.role === "INVESTOR") && (
              <button
                onClick={() => setActiveTab("finances")}
                id="tab-finances-btn"
                className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-tight transition ${
                  activeTab === "finances" ? "bg-gray-800 text-white border-l-2 border-emerald-500" : "text-gray-400 hover:bg-gray-900 hover:text-white"
                }`}
              >
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Financial Analytics</span>
              </button>
            )}

          </nav>
        </div>

        {/* LOGOUT FOOTER */}
        <div className="pt-4 border-t border-gray-800/85">
          <button
            onClick={onLogout}
            id="portal-logout-btn"
            className="w-full text-left flex items-center space-x-2 px-3 py-2 hover:bg-red-500/10 text-red-400 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Secure System Signout</span>
          </button>
        </div>

      </aside>

      {/* DASHBOARD CONTENT MATRICES */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        
        {/* TOP STATUS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-800 pb-4 mb-6 gap-4">
          <div>
            <span className="text-[10px] uppercase font-mono text-gray-500 block">SLA SECURITY VERIFIED</span>
            <h2 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center">
              <span>CottonRecycle B2B Ecosystem Portal</span>
              <span className="mx-2 text-emerald-500">•</span>
              <span className="text-emerald-400 font-mono text-xs font-normal border border-emerald-500/20 px-2 py-0.5 rounded bg-emerald-500/5">
                {activeTab.toUpperCase()}_DASHBOARD
              </span>
            </h2>
          </div>
          
          <div className="flex items-center space-x-3 text-xs font-mono">
            <button 
              onClick={reloadData} 
              className="p-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-gray-400 cursor-pointer hover:text-emerald-400 transition"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-gray-500 text-[10px]">LOCAL ENGINE STRETCH: 2026-05-23</span>
          </div>
        </div>

        {activeTab === "leads" && (
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
                <div className="text-gray-500 text-sm border border-gray-850 rounded-xl p-6 bg-black/30">No leads received yet.</div>
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
                            <button key={status} onClick={() => handleUpdateLeadStatus(lead.id, status)} className={`px-2.5 py-1 rounded text-[10px] font-mono border transition ${lead.status === status ? "bg-emerald-500 text-black border-emerald-500" : "bg-gray-900 text-gray-400 border-gray-800 hover:text-white"}`}>
                              {status.replace("_", " ")}
                            </button>
                          ))}
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="px-2.5 py-1 rounded text-[10px] font-mono border bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20 transition"
                          >
                            Delete Lead
                          </button>
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
        {activeTab === "command" && (
          <div className="space-y-6">
            
            {/* Live throughput metrics card strip */}
            {factoryMetrics && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">Active Shredder Line</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-xl md:text-2xl font-extrabold font-display text-white">{factoryMetrics.activeMachines}/20</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">Ready</span>
                  </div>
                </div>

                <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">Water Recirculation</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-xl md:text-2xl font-extrabold font-display text-white">{factoryMetrics.waterRecirculationPct}%</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">Closed loop</span>
                  </div>
                </div>

                <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">Rotary Sourcing Target</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-xl md:text-2xl font-extrabold font-display text-white">{(factoryMetrics.totalCapacityTons).toLocaleString()} tn</span>
                    <span className="text-xs text-gray-500">Monthly</span>
                  </div>
                </div>

                <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                  <span className="text-[10px] text-gray-500 font-mono uppercase block">Mechanically Processed</span>
                  <div className="flex items-end justify-between mt-1">
                    <span className="text-xl md:text-2xl font-extrabold font-display text-white">{(factoryMetrics.todayProcessedInKg).toLocaleString()} kg</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold">Today Peak</span>
                  </div>
                </div>

              </div>
            )}

            {/* Power grid indicators */}
            <div className="bg-[#111719]/90 border border-emerald-500/10 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 bg-emerald-500/15 rounded-xl text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">Industrial Microgrid Optimization</h4>
                  <p className="text-gray-400 text-xs mt-0.5">Primary mechanical grinders powered exclusively by direct solar farm backlog & coastal wind mills.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% RENUEVALBE STRENGTH DEPLOYED</span>
              </div>
            </div>

            {/* Active production batch queue */}
            <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-white text-base">Continuous Processing Line Progress</h3>
                  <p className="text-gray-500 text-xs">Live tracking of active raw cotton scrap mechanical breakdown.</p>
                </div>
                <span className="text-xs text-gray-400 font-mono">3 Batches Listed</span>
              </div>

              <div className="space-y-4">
                {factoryBatches.map((batch) => (
                  <div key={batch.id} className="border border-gray-850/80 rounded-xl p-4 bg-[#0b0f11]/60 space-y-3.5 hover:border-gray-850 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-850/40 pb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{batch.id}</span>
                        <span className="text-white text-xs font-bold font-display">{batch.sourceSupplier}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-[10px] font-mono text-gray-500">
                        <span>{batch.grade}</span>
                        <span>•</span>
                        <span>{batch.color} ({batch.weightInKg.toLocaleString()} kg)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400 font-medium">{batch.currentStep}</span>
                          <span className="text-emerald-400 font-mono font-semibold">{batch.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${batch.progress}%` }} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
                        <div className="text-right text-[10px] font-mono leading-tight">
                          <span className="text-gray-500 block uppercase">GRS Verification status</span>
                          <span className="text-white font-semibold">{batch.grsStatus}</span>
                        </div>
                        
                        {/* Admin demo trigger to manually advance machine step progression */}
                        {user.role === "ADMIN" && (
                          <button
                            onClick={() => handleAdvanceBatch(batch.id, batch.progress)}
                            className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold font-mono transition cursor-pointer"
                          >
                            Advance Machine Step
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 2: B2B COTON EXCHANGE */}
        {/* ======================================= */}
        {activeTab === "exchange" && (
          <div className="space-y-6">
            
            {/* Top filtering controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              
              <div className="flex-1 flex items-center space-x-2 bg-[#111719] border border-gray-800 rounded-xl px-3.5 py-2.5">
                <Search className="w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Query yarn weight, pure linen, post-denim, custom Rotterdam stock..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white focus:outline-none w-full"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {["ALL", "Yarn", "Shreds", "Fibers", "Waste Scraps"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-tight transition cursor-pointer ${
                      categoryFilter === cat 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500" 
                        : "bg-gray-900 border-gray-800 text-gray-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                
                {/* Admin/Supplier button to list stock */}
                {(user.role === "ADMIN" || user.role === "SUPPLIER") && (
                  <button
                    onClick={() => setShowNewListingModal(true)}
                    className="px-3.5 py-1.5 bg-emerald-500 text-black rounded-full font-bold text-xs hover:bg-emerald-400 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Upload New Stock</span>
                  </button>
                )}
              </div>

            </div>

            {/* Interactive listings grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="bg-[#111719] border border-gray-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-900 border border-gray-850">
                      <img referrerPolicy="no-referrer" src={listing.image} className="object-cover w-full h-full opacity-80" alt={listing.title} />
                      <div className="absolute top-3 left-3 bg-black/75 border border-gray-800 rounded text-[9px] font-mono px-2 py-0.5 text-gray-300">
                        STATION: {listing.location}
                      </div>
                      <span className="absolute top-3 right-3 bg-emerald-500 text-black font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                        {listing.grade}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase font-mono">{listing.id} // GRS_VERIFIED</span>
                        <span className="text-xs text-emerald-400 font-mono font-semibold">{listing.certificate}</span>
                      </div>
                      <h4 className="font-display font-extrabold text-white text-base leading-tight mt-0.5">{listing.title}</h4>
                      <p className="text-gray-400 text-xs mt-1.5">{listing.material}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-gray-850/60 pt-4 mt-2">
                    <div className="grid grid-cols-3 gap-2 text-center bg-black/40 rounded-lg p-2 border border-gray-850/40">
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-mono block">Price / kg</span>
                        <span className="text-white text-xs font-bold font-mono">${listing.pricePerKg.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-mono block">Available</span>
                        <span className="text-white text-xs font-bold font-mono">{(listing.volume).toLocaleString()} {listing.unit}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-mono block">CO₂ Saved</span>
                        <span className="text-emerald-400 text-[10px] font-bold font-mono">{(listing.esgSavedCo2).toLocaleString()} kg</span>
                      </div>
                    </div>

                    {/* Sourcing checkout actions */}
                    {user.role === "BUYER" || user.role === "ADMIN" ? (
                      <div className="flex items-stretch gap-2">
                        <div className="w-24 bg-black border border-gray-800 rounded-lg px-2 py-1 flex flex-col justify-center">
                          <span className="text-[8px] uppercase text-gray-500 font-mono">Volume</span>
                          <input 
                            type="number" 
                            step="500"
                            min="250"
                            max={listing.volume}
                            placeholder="kg"
                            value={purchaseQty[listing.id] || ""}
                            onChange={(e) => setPurchaseQty({ ...purchaseQty, [listing.id]: Number(e.target.value) })}
                            className="bg-transparent text-white text-xs font-mono font-bold focus:outline-none w-full mt-0.5"
                          />
                        </div>
                        <button
                          onClick={() => handlePurchase(listing.id)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold py-2 px-3 rounded-lg transition tracking-tight flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <span>Execute Sourcing Purchase</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-[10px] text-gray-500 font-mono italic">
                        Logged in as {user.role}. Change profile to BUYER to execute instant circular procurement.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* RFQs FEED */}
            <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                <div>
                  <h3 className="font-display font-bold text-white text-base">Manufacturer Sourcing RFQs</h3>
                  <p className="text-gray-500 text-xs">Sustainability procurement quotas requested directly by fashion & weaving factories.</p>
                </div>
                
                {user.role === "BUYER" && (
                  <button
                    onClick={() => setShowNewRfqModal(true)}
                    className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition text-xs font-mono"
                  >
                    + Submit Sourcing RFQ
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {rfqs.map((rfq) => (
                  <div key={rfq.id} className="bg-black/35 border border-gray-850 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1.5 flex-1 max-w-xl">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-gray-500 font-semibold uppercase">{rfq.id}</span>
                        <span className="text-white text-xs font-extrabold font-display">{rfq.title}</span>
                      </div>
                      <p className="text-gray-400 text-xs">{rfq.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] font-mono text-gray-500 pt-1">
                        <span>VOLUME GOAL: <strong className="text-white">{(rfq.targetVolume).toLocaleString()} {rfq.unit}</strong></span>
                        <span>MAX BUDGET: <strong className="text-white">${(rfq.maxBudget).toLocaleString()}</strong></span>
                        <span>CLOSES: <strong className="text-white">{rfq.deadline}</strong></span>
                        <span>BUYER: <strong className="text-emerald-400">{rfq.buyer}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center sm:space-x-3.5 space-x-2 justify-between">
                      <div className="text-right leading-tight font-mono text-[10px]">
                        <span className="text-gray-500 block">RESPONSES</span>
                        <span className="text-white font-bold">{rfq.bidsCount} Bid(s) Submitted</span>
                      </div>
                      
                      {user.role === "SUPPLIER" ? (
                        <button
                          onClick={() => handleBidOnRfq(rfq.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-[11px] font-bold font-mono transition cursor-pointer"
                        >
                          Submit Bid Offer
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-bold font-mono rounded bg-gray-900 border border-gray-800 text-gray-500">
                          {rfq.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 3: CIRCULAR INGEST (RaaS) */}
        {/* ======================================= */}
        {activeTab === "raas" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-850 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Circular Intake Scheduler (RaaS)</h3>
                    <p className="text-gray-500 text-xs">Strategic pickups allocated from mills and pre-consumer sorting facilities.</p>
                  </div>
                  
                  {user.role === "SUPPLIER" && (
                    <button
                      onClick={() => setShowRfqIngestModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition font-sans text-xs font-bold cursor-pointer"
                    >
                      + Request Waste Lift
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {ingest.map((req) => (
                    <div key={req.id} className="bg-black/45 border border-gray-850 rounded-xl p-4 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-850/40 pb-2 gap-2">
                        <div>
                          <span className="font-mono text-xs text-gray-400 font-semibold">{req.id}</span>
                          <h4 className="text-white text-xs font-extrabold font-display mt-0.5">{req.company}</h4>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-[10px] font-mono">
                          <span className={`px-2 py-0.5 rounded ${
                            req.status === "SCHEDULED" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-yellow-500/15 text-yellow-500 border border-yellow-500/20"
                          }`}>
                            {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-[10px] text-gray-400">
                        <div>
                          <span className="text-gray-500 block uppercase">Category material</span>
                          <span className="text-white">{req.category}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Estimated Volume Pool</span>
                          <span className="text-white">{(req.estimatedVolumeMs).toLocaleString()} kg/month</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Target Pickup</span>
                          <span className="text-emerald-400 font-bold">{req.pickupDate}</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-gray-500 italic flex justify-between items-center bg-[#0b0f11] p-2 rounded border border-gray-850/40">
                        <span>REQUIREMENTS: {req.pickupRequirements}</span>
                        
                        {/* Admin approval workflow */}
                        {user.role === "ADMIN" && req.status === "UNDER_REVIEW" && (
                          <button
                            onClick={() => handleApproveIngest(req.id)}
                            className="px-2 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-semibold font-mono text-[9px] transition cursor-pointer"
                          >
                            Approve Sourcing Intake
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements card */}
              <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-6">
                <div>
                  <h4 className="font-display font-bold text-white text-sm">Industrial Waste Quality Acceptance (OQL)</h4>
                  <p className="text-gray-500 text-xs mt-1">We accept materials strictly categorized under certified parameters to preserve our recycling knife machinery.</p>
                </div>

                <div className="space-y-4">
                  <div className="border border-gray-850 p-3 rounded-lg space-y-1 bg-black/35">
                    <span className="text-[11px] text-emerald-400 font-mono font-bold uppercase block">✔ APPROVED FEEDS</span>
                    <p className="text-[11px] text-gray-400">100% pure combed cotton mill ends, indigo denim textile sweeps, linen sheeting rejects, organic threads backing scraps.</p>
                  </div>
                  
                  <div className="border border-gray-850 p-3 rounded-lg space-y-1 bg-black/35">
                    <span className="text-[11px] text-red-400 font-mono font-bold uppercase block">✕ REJECTED FEEDS</span>
                    <p className="text-[11px] text-gray-400">Materials treated with brominated flame-retardants, heavy polyurethane linings, metallic sewing threads, or moisture above 18.5%.</p>
                  </div>
                </div>

                <div className="bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-4 space-y-1">
                  <span className="text-xs text-white font-semibold flex items-center">
                    <Clock className="w-4 h-4 text-emerald-400 mr-1.5" /> Auto-Scheduler SLA
                  </span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Corporate suppliers with weekly volume commitments above 15,000kg qualify for automated roll-on container replacement. Containers are synced with RFID telemetry tags.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 4: ESG LEDGER */}
        {/* ======================================= */}
        {activeTab === "esg" && (
          <div className="space-y-6">
            
            {/* Impact Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-[#111719]/45 border border-gray-850 p-5 rounded-xl space-y-2">
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Digital Material Passports Logged</span>
                <span className="text-2xl font-black font-display text-white">{esgLedger.length} Active Records</span>
                <p className="text-[11px] text-gray-500">GRS audits generated in sync with real-time checkout invoices.</p>
              </div>

              <div className="bg-[#111719]/45 border border-gray-850 p-5 rounded-xl space-y-2">
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Chemical Toxicity Auditing</span>
                <span className="text-2xl font-black font-display text-emerald-400">0% Solvents Metric</span>
                <p className="text-[11px] text-gray-500">100% mechanical carding process verified by SGS testing lines.</p>
              </div>

              <div className="bg-[#111719]/45 border border-gray-850 p-5 rounded-xl space-y-2">
                <span className="text-[10px] text-gray-500 font-mono block uppercase">Global Standard Verification</span>
                <span className="text-2xl font-black font-display text-white">GRS Standard Level A</span>
                <p className="text-[11px] text-gray-500">Fully compatible with Cradle-to-Cradle certification standards.</p>
              </div>

            </div>

            {/* Material passport ledger table */}
            <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-gray-855 pb-3">
                <h3 className="font-display font-extrabold text-white text-base">GRS Certified Sourcing Ledger Reports</h3>
                <p className="text-gray-500 text-xs mt-0.5">Automated material chain-of-custody tracking with water and CO₂ savings indices.</p>
              </div>

              <div className="space-y-4">
                {esgLedger.map((report) => (
                  <div key={report.id} className="bg-black/45 border border-gray-850 rounded-xl p-4 space-y-4">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-850/40 pb-2.5 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-500/10 text-emerald-400 font-mono text-xs px-2 py-0.5 rounded border border-emerald-500/20">{report.materialPassportId}</span>
                        <span className="text-white text-xs font-bold font-display">Mechanical Circular Material Passport</span>
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono">STAMPED: {report.dateGenerated}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono text-[10px]">
                      <div>
                        <span className="text-gray-500 block uppercase">Carbon mitigation</span>
                        <span className="text-emerald-400 font-bold">-{report.carbonReductionKg.toLocaleString()} kg CO₂</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase">Clean water savings</span>
                        <span className="text-emerald-400 font-bold">+{report.waterSavedLitres.toLocaleString()} L</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase">Fiber Recycled content</span>
                        <span className="text-white font-bold">{report.recycledContentPct}% Mechanical Cotton</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block uppercase">Associated raw batch</span>
                        <span className="text-white">{report.batchId}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-[#0c1012] border border-gray-850 rounded-lg space-y-2">
                      <span className="text-[9px] uppercase font-mono text-gray-500 tracking-wider block">Closed-Loop Sourcing Chain-of-Custody</span>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-white font-mono">
                        {report.chainOfCustody.map((node, i) => (
                          <React.Fragment key={node}>
                            {i > 0 && <span className="text-emerald-500">➔</span>}
                            <span className="bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">{node}</span>
                          </React.Fragment>
                        ))}
                      </div>
                      <p className="text-[10px] text-emerald-400 mt-2 font-semibold">✓ {report.chemicalAudit}</p>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 5: AI SOURCING CORE */}
        {/* ======================================= */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            
            <div className="bg-[#111719] border border-gray-800 rounded-2xl p-5 min-h-[60vh] flex flex-col justify-between space-y-4 relative">
              <div className="absolute top-2 right-2 p-1 bg-emerald-500/10 rounded-full text-emerald-400 border border-emerald-400/20 flex items-center space-x-1 px-2.5 font-mono text-[10px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>SERVER_SIDE_GEMINI_3.5_FLASH</span>
              </div>

              <div>
                <div className="border-b border-gray-850 pb-3 mb-4">
                  <h3 className="font-display font-extrabold text-white text-base">Sourcing Strategic Intelligence Core</h3>
                  <p className="text-gray-500 text-xs">AI Procurement advisor for mechanical cotton circularity. Trained on GRS frameworks, fiber staple logic, and ocean carbon logistics offsets.</p>
                </div>

                {/* Chat feed */}
                <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1">
                  {chatHistory.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`p-4 rounded-xl max-w-xl text-xs leading-relaxed space-y-1.5 ${
                        msg.role === "user" 
                          ? "bg-gray-800 text-white border border-gray-700/80 rounded-br-none" 
                          : "bg-black/50 text-gray-300 border border-gray-850 rounded-bl-none"
                      }`}>
                        <div className="flex items-center space-x-2 border-b border-gray-850 pb-1.5 mb-1.5">
                          <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                            {msg.role === "user" ? `${user.name} (${user.role})` : "COTTONRECYCLE™ SOURCING AI"}
                          </span>
                        </div>
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-black/50 text-gray-500 border border-gray-850 rounded-xl p-4 rounded-bl-none text-xs flex items-center space-x-2 font-mono">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                        <span>Querying processing nodes... Formulating GRS technical analysis...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleAskAi} className="flex items-center space-x-2 bg-black border border-gray-850 rounded-xl p-2 mt-4">
                <input 
                  type="text" 
                  placeholder="Ask about combed staple length retention, Oeko-Tex cert standards, or recommend blending weights for fashion knits..." 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  disabled={aiLoading}
                  className="flex-1 bg-transparent border-none text-xs text-white focus:outline-none px-3.5"
                />
                <button 
                  type="submit" 
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="p-2 bg-emerald-500 hover:bg-emerald-450 disabled:opacity-40 text-black rounded-lg transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 6: CONTAINER LOGISTICS */}
        {/* ======================================= */}
        {activeTab === "logistics" && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Shipments list */}
              <div className="lg:col-span-8 bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-gray-850 pb-3">
                  <h3 className="font-display font-extrabold text-white text-base">Carbon-Neutral Shipping & Port Ingest</h3>
                  <p className="text-gray-500 text-xs">Tracking active mechanical cotton cargos moving through regional port networks.</p>
                </div>

                <div className="space-y-4">
                  {shipments.map((shp) => (
                    <div key={shp.id} className="bg-black/45 border border-gray-850 p-4 rounded-xl space-y-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-850/40 pb-2.5 gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{shp.containerId}</span>
                          <span className="text-white text-xs font-bold font-display">{shp.cargoType}</span>
                        </div>
                        <span className="text-[10px] text-gray-500 font-mono">CARRIER: {shp.carrier}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[10px]">
                        <div>
                          <span className="text-gray-500 block uppercase">Destination hub</span>
                          <span className="text-white font-semibold">{shp.destination}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Depart port</span>
                          <span className="text-white font-semibold">{shp.departure}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Shipping ETA</span>
                          <span className="text-emerald-400 font-bold">{shp.eta}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 block uppercase">Bale volume total</span>
                          <span className="text-white font-semibold">{(shp.weightKg).toLocaleString()} kg</span>
                        </div>
                      </div>

                      {/* Cargo Status meter */}
                      <div className="space-y-1.5 pt-2">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-emerald-400 flex items-center">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
                            Status: {shp.status}
                          </span>
                          <span className="text-white">{shp.progress}% Complete</span>
                        </div>
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full w-0" style={{ width: `${shp.progress}%` }} />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Climate Telemetry */}
              <div className="lg:col-span-4 bg-[#111719] border border-gray-800 rounded-xl p-5 flex flex-col justify-between space-y-6">
                <div>
                  <h4 className="font-display font-bold text-white text-sm">Active Container Cargo Telemetry</h4>
                  <p className="text-gray-500 text-xs mt-1">Fiber elasticity is dependent on tight temperature and moisture isolation inside freight decks.</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#0b0f11]/90 border border-gray-850 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 rounded text-emerald-400">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-mono block">Median Temp</span>
                        <span className="text-white text-xs font-bold font-mono">20.1° C</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">✓ OPTIMAL</span>
                  </div>

                  <div className="bg-[#0b0f11]/90 border border-gray-850 p-4 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-500/10 rounded text-emerald-400">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-mono block">Median Humidity</span>
                        <span className="text-white text-xs font-bold font-mono">46% RH</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">✓ CONTROLLED</span>
                  </div>
                </div>

                <div className="bg-yellow-500/5 rounded-xl border border-yellow-500/10 p-3 text-xs text-gray-400 space-y-1">
                  <span className="text-white font-semibold block flex items-center">
                    <ShieldAlert className="w-4 h-4 text-yellow-500 mr-1.5" /> Condensation warning guidelines
                  </span>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-mono">
                    Any container humidity scaling above 65% RH for more than 12 hours breaks raw mechanical cotton strands. B2B operators receive automated custom deck alerts.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ======================================= */}
        {/* TAB 7: FINANCIAL ANALYTICS & ROADMAP */}
        {/* ======================================= */}
        {activeTab === "finances" && investorAnalytics && (
          <div className="space-y-6">
            
            {/* EBITDA &Raised strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-550 font-mono uppercase block">Total Capital Sourced</span>
                <span className="text-xl md:text-2xl font-extrabold font-display text-white mt-1 block">${(investorAnalytics.totalCapitalRaised).toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">✓ Circular Capital Seed</span>
              </div>

              <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-550 font-mono uppercase block">Annual Recurring Sourcing</span>
                <span className="text-xl md:text-2xl font-extrabold font-display text-white mt-1 block">${(investorAnalytics.annualRecurringRevenue).toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">✓ Contract SLA backlog</span>
              </div>

              <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-550 font-mono uppercase block">Rolling EBITDA margin</span>
                <span className="text-xl md:text-2xl font-extrabold font-display text-emerald-400 mt-1 block">{investorAnalytics.factoryOneEbitda}%</span>
                <span className="text-[10px] text-gray-500 font-mono block mt-0.5">Continuous processing ROI</span>
              </div>

              <div className="bg-[#111719]/45 border border-gray-850 p-4 rounded-xl">
                <span className="text-[10px] text-gray-550 font-mono uppercase block">Active B2B Exchanges</span>
                <span className="text-xl md:text-2xl font-extrabold font-display text-white mt-1 block">+{investorAnalytics.activeUsersCount} accounts</span>
                <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">✓ Checked in this week</span>
              </div>

            </div>

            {/* Impact analytics graph metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-gray-850 pb-2 flex items-center justify-between">
                  <h4 className="font-display font-medium text-white text-sm">Water Resource Offsets Cumulative (Millions LITRES)</h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Total Saved: {(investorAnalytics.cumulativeImpactWaterLitres / 1000000).toFixed(1)}M L</span>
                </div>
                
                {/* Visual inline SVG representation of impact metrics */}
                <div className="h-56 flex items-end justify-between space-x-2 pt-6 bg-black/35 rounded-lg p-4 border border-gray-850/60 relative">
                  <div className="absolute top-2 left-2 text-[9px] text-gray-500 font-mono">LITRES WATER SAVED OVER QUARTERS</div>
                  <div className="w-12 h-[35%] bg-emerald-500/25 rounded-t text-center pt-2 font-mono text-[9px] text-emerald-400">Q2 25</div>
                  <div className="w-12 h-[55%] bg-emerald-500/40 rounded-t text-center pt-2 font-mono text-[9px] text-emerald-400">Q3 25</div>
                  <div className="w-12 h-[72%] bg-emerald-500/60 rounded-t text-center pt-2 font-mono text-[9px] text-white">Q4 25</div>
                  <div className="w-12 h-[95%] bg-emerald-500 rounded-t text-center pt-2 font-mono text-[9px] text-black font-extrabold">Q1 26</div>
                </div>
              </div>

              <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
                <div className="border-b border-gray-850 pb-2 flex items-center justify-between">
                  <h4 className="font-display font-medium text-white text-sm">Carbon Reduction Matrix Cumulative (Tons CO₂)</h4>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Total Reduction: {(investorAnalytics.cumulativeImpactCarbonKg / 1000).toLocaleString()} Tons</span>
                </div>

                <div className="h-56 flex items-end justify-between space-x-2 pt-6 bg-black/35 rounded-lg p-4 border border-gray-850/60 relative">
                  <div className="absolute top-2 left-2 text-[9px] text-gray-500 font-mono">CO₂ TONNES DIRECT REDUCTIONS</div>
                  <div className="w-12 h-[20%] bg-emerald-500/10 rounded-t text-center pt-1 font-mono text-[9px] text-emerald-400">Q2 25</div>
                  <div className="w-12 h-[42%] bg-emerald-500/30 rounded-t text-center pt-1 font-mono text-[9px] text-emerald-400">Q3 25</div>
                  <div className="w-12 h-[68%] bg-emerald-500/50 rounded-t text-center pt-1 font-mono text-[9px] text-white">Q4 25</div>
                  <div className="w-12 h-[88%] bg-emerald-500 rounded-t text-center pt-1 font-mono text-[9px] text-black font-extrabold">Q1 26</div>
                </div>
              </div>

            </div>

            {/* Factory construction roadmap */}
            <div className="bg-[#111719] border border-gray-800 rounded-xl p-5 space-y-4">
              <div className="border-b border-gray-850 pb-2.5">
                <h4 className="font-display font-medium text-white text-base">Factory Construction & Volume Milestones</h4>
                <p className="text-gray-550 text-xs">Phases secured to satisfy raw mechanical cotton demand.</p>
              </div>

              <div className="space-y-4 pt-1">
                {investorAnalytics.factoryRoadmap.map((item: any, i: number) => (
                  <div key={i} className="bg-black/35 border border-gray-850/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <h5 className="text-white text-xs font-bold font-display">{item.phase}</h5>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">{item.status}</span>
                    </div>

                    <div className="w-full sm:w-60 space-y-1">
                      <div className="flex justify-between text-[10px] font-mono text-gray-500">
                        <span>Construction progress</span>
                        <span className="text-white font-bold">{item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* ======================================= */}
      {/* MODALS SECTION */}
      {/* ======================================= */}
      
      {/* 1. Modal: Upload Stock */}
      {showNewListingModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111719] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h4 className="font-display font-bold text-lg text-white border-b border-gray-850 pb-2">Publish Stock Available</h4>
            <form onSubmit={handleCreateListingSubmit} className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Listing Title</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Carded Recycled Cotton Fibers"
                  value={newListing.title}
                  onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">Category</label>
                  <select 
                    value={newListing.category} 
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  >
                    <option value="Yarn">Yarn</option>
                    <option value="Shreds">Shreds</option>
                    <option value="Fibers">Fibers</option>
                    <option value="Waste Scraps">Waste Scraps</option>
                  </select>
                </div>
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">Material grade</label>
                  <input 
                    required 
                    type="text" 
                    value={newListing.grade}
                    onChange={(e) => setNewListing({ ...newListing, grade: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">Volume Quantity (kg)</label>
                  <input 
                    required 
                    type="number" 
                    value={newListing.volume}
                    onChange={(e) => setNewListing({ ...newListing, volume: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">Unit Price Per kg ($)</label>
                  <input 
                    required 
                    type="number" 
                    step="0.01"
                    value={newListing.pricePerKg}
                    onChange={(e) => setNewListing({ ...newListing, pricePerKg: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Fiber Material Breakdown</label>
                <input 
                  required 
                  type="text" 
                  value={newListing.material}
                  onChange={(e) => setNewListing({ ...newListing, material: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">Warehouse Location</label>
                  <input 
                    required 
                    type="text" 
                    value={newListing.location}
                    onChange={(e) => setNewListing({ ...newListing, location: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">OQL Certificate</label>
                  <input 
                    required 
                    type="text" 
                    value={newListing.certificate}
                    onChange={(e) => setNewListing({ ...newListing, certificate: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-2.5 pt-4 border-t border-gray-850">
                <button 
                  type="button" 
                  onClick={() => setShowNewListingModal(false)}
                  className="w-1/2 p-2 rounded bg-gray-800 hover:bg-gray-700 text-white font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 p-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition cursor-pointer"
                >
                  Publish Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Submit RFQ */}
      {showNewRfqModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111719] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h4 className="font-display font-bold text-lg text-white border-b border-gray-850 pb-2">Publish B2B Sourcing RFQ</h4>
            <form onSubmit={handleCreateRfqSubmit} className="space-y-3 text-xs">
              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Sourcing Goal Target</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Carded Combed Ring Yarn Ne 20/1"
                  value={newRfq.title}
                  onChange={(e) => setNewRfq({ ...newRfq, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">Requested Volume (kg)</label>
                  <input 
                    required 
                    type="number" 
                    value={newRfq.targetVolume}
                    onChange={(e) => setNewRfq({ ...newRfq, targetVolume: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="text-gray-400 font-mono">Maximum Quoted Budget ($)</label>
                  <input 
                    required 
                    type="number" 
                    value={newRfq.maxBudget}
                    onChange={(e) => setNewRfq({ ...newRfq, maxBudget: e.target.value })}
                    className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Deadline Schedule</label>
                <input 
                  required 
                  type="date" 
                  value={newRfq.deadline}
                  onChange={(e) => setNewRfq({ ...newRfq, deadline: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">SLA Technical Requirements Description</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Detail preferred blending parameters, thread breaking values, or destination terminal..."
                  value={newRfq.description}
                  onChange={(e) => setNewRfq({ ...newRfq, description: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex space-x-2.5 pt-4 border-t border-gray-855">
                <button 
                  type="button" 
                  onClick={() => setShowNewRfqModal(false)}
                  className="w-1/2 p-2 rounded bg-gray-800 hover:bg-gray-700 text-white font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 p-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition cursor-pointer"
                >
                  Submit RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Schedule RaaS Lift */}
      {showRfqIngestModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#111719] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h4 className="font-display font-bold text-lg text-white border-b border-gray-850 pb-2">Request Circular RaaS Intake lift</h4>
            <form onSubmit={handleCreateIngestSubmit} className="space-y-3 text-xs">
              
              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Intake Sourcing Category</label>
                <select 
                  value={newIngest.category} 
                  onChange={(e) => setNewIngest({ ...newIngest, category: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                >
                  <option value="Post-Industrial Shear Scraps">Post-Industrial Shear Scraps</option>
                  <option value="Post-Consumer Linen Bulk">Post-Consumer Linen Bulk</option>
                  <option value="Discarded Yarn Remnants">Discarded Yarn Remnants</option>
                  <option value="Apparel Overstock Returns">Apparel Overstock Returns</option>
                </select>
              </div>

              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Estimated Lift Volume Weight (kg)</label>
                <input 
                  required 
                  type="number" 
                  placeholder="e.g. 25000"
                  value={newIngest.estimatedVolumeMs}
                  onChange={(e) => setNewIngest({ ...newIngest, estimatedVolumeMs: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Fiber Makeup Breakdown</label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. 100% Cotton Denim cut shears"
                  value={newIngest.materialType}
                  onChange={(e) => setNewIngest({ ...newIngest, materialType: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Material origin certifications</label>
                <input 
                  required 
                  type="text" 
                  value={newIngest.certification}
                  onChange={(e) => setNewIngest({ ...newIngest, certification: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="space-y-0.5">
                <label className="text-gray-400 font-mono">Pickup Dock & Container instructions</label>
                <textarea 
                  rows={2}
                  required
                  value={newIngest.pickupRequirements}
                  onChange={(e) => setNewIngest({ ...newIngest, pickupRequirements: e.target.value })}
                  className="w-full bg-black border border-gray-800 rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex space-x-2.5 pt-4 border-t border-gray-855">
                <button 
                  type="button" 
                  onClick={() => setShowRfqIngestModal(false)}
                  className="w-1/2 p-2 rounded bg-gray-800 hover:bg-gray-700 text-white font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 p-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold transition cursor-pointer"
                >
                  Schedule Pickup Lift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

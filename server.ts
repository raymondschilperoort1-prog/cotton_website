import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. AI procurement features will fall back to local responses.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const app = express();
const PORT = 3010;

app.use(express.json());

// ==========================================
// MOCK DATA STORAGE (InMemory DB)
// ==========================================

// Pre-seeded Users
const USERS = [
  {
    id: "u-admin",
    email: "admin@cottonrecycle.com",
    name: "Alex Mercer",
    role: "ADMIN",
    company: "CottonRecycle™ Corporate",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "u-supplier",
    email: "supplier@cottonrecycle.com",
    name: "Marcus Thorne",
    role: "SUPPLIER",
    company: "Thorne Textile Sorting Ltd.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "u-buyer",
    email: "buyer@cottonrecycle.com",
    name: "Amara Okoye",
    role: "BUYER",
    company: "Loom & Thread Apparel Group",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    verified: true,
  },
  {
    id: "u-investor",
    email: "investor@cottonrecycle.com",
    name: "Theresa Schmidt",
    role: "INVESTOR",
    company: "Circular Capital Partners",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop",
    verified: true,
  },
  {
    // Alternate investor login fallback matching the user's email pre-loaded
    id: "u-user-investor",
    email: "raymond.schilperoort1@gmail.com",
    name: "Raymond Schilperoort Partners",
    role: "INVESTOR",
    company: "Schilperoort Ventures",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
    verified: true,
  }
];

// Pre-seeded Marketplace Listings
let LISTINGS = [
  {
    id: "lst-001",
    title: "Combed Recycled Ring-Spun Cotton Yarn Ne 30/1",
    category: "Yarn",
    material: "90% Recycled Cotton / 10% Virgin Organic Cotton",
    grade: "Grade A Premium",
    volume: 12500, // in kg
    unit: "kg",
    pricePerKg: 3.85,
    location: "Rotterdam Dry Port Warehouse",
    supplier: "CottonRecycle Factory #01",
    certificate: "GRS Standard Certified",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
    esgSavedWater: 187500, // Litres saved
    esgSavedCo2: 24200,   // kg CO₂ saved
  },
  {
    id: "lst-002",
    title: "Post-Industrial Denim Cotton Pulp Shreds",
    category: "Shreds",
    material: "100% Cotton Waste (Indigo Denim)",
    grade: "Grade B Industrial",
    volume: 45000,
    unit: "kg",
    pricePerKg: 1.15,
    location: "Ghent Logistics Facility",
    supplier: "Thorne Textile Sorting Ltd.",
    certificate: "Oeko-Tex Standard 100",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop",
    esgSavedWater: 675000,
    esgSavedCo2: 87000,
  },
  {
    id: "lst-003",
    title: "Mechanical Recycled Carded Fiber Sliver",
    category: "Fibers",
    material: "100% Mechanical Recycled Post-Consumer White Bedding",
    grade: "Grade A Long-Fiber",
    volume: 8200,
    unit: "kg",
    pricePerKg: 4.10,
    location: "Bremen Central Hub",
    supplier: "CottonRecycle Factory #02",
    certificate: "GRS Standard, Cradle to Cradle Gold",
    image: "https://images.unsplash.com/photo-1558089687-f282ffcbd1d5?q=80&w=600&auto=format&fit=crop",
    esgSavedWater: 123000,
    esgSavedCo2: 15800,
  },
  {
    id: "lst-004",
    title: "Knit Cotton Cutting Scraps - Optic White",
    category: "Waste Scraps",
    material: "100% Combed Cotton Cutting Waste",
    grade: "Grade A Clean White Scraps",
    volume: 28000,
    unit: "kg",
    pricePerKg: 0.95,
    location: "Lodz Textile Sorting Yard",
    supplier: "EuroSorter Textiles Co.",
    certificate: "GRS Verified Source",
    image: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=600&auto=format&fit=crop",
    esgSavedWater: 420000,
    esgSavedCo2: 54000,
  }
];

// Pre-seeded RFQs (Request For Quotes)
let RFQS = [
  {
    id: "rfq-101",
    title: "Bulk Organic Recycled Yarn Ne 20/1 for Circular T-Shirts",
    targetVolume: 25000,
    unit: "kg",
    maxBudget: 95000,
    deadline: "2026-06-30",
    buyer: "Loom & Thread Apparel Group",
    status: "OPEN",
    bidsCount: 3,
    description: "Seeking GRS certified combed mechanical recycled cotton fiber yarn. Must support knitting without high breaking rates. Delivery to Lisbon hub.",
  },
  {
    id: "rfq-102",
    title: "Indigo Recycled Fibers for Denim Weft Blend",
    targetVolume: 50000,
    unit: "kg",
    maxBudget: 110000,
    deadline: "2026-07-15",
    buyer: "Nordic Loom-Weavers",
    status: "OPEN",
    bidsCount: 1,
    description: "Looking for post-industrial indigo dyed recycling remnants shred. Will be blended 40/60 with virgin hemp threads.",
  }
];

// Orders/Transactions
let ORDERS = [
  {
    id: "ord-801",
    listingId: "lst-001",
    listingTitle: "Combed Recycled Ring-Spun Cotton Yarn Ne 30/1",
    buyer: "Loom & Thread Apparel Group",
    supplier: "CottonRecycle Factory #01",
    volume: 5000,
    unit: "kg",
    totalPrice: 19250,
    status: "PROCESSING",
    date: "2026-05-18",
    trackingNum: "CR-CONT-409A",
  },
  {
    id: "ord-802",
    listingId: "lst-002",
    listingTitle: "Post-Industrial Denim Cotton Pulp Shreds",
    buyer: "Sustainable Fibers Copenhagen",
    supplier: "Thorne Textile Sorting Ltd.",
    volume: 15000,
    unit: "kg",
    totalPrice: 17250,
    status: "SHIPPED",
    date: "2026-05-10",
    trackingNum: "CR-CONT-3221",
  }
];

// Factory command center operations
let FACTORY_METRICS = {
  activeMachines: 18,
  totalCapacityTons: 1500, // Monthly
  currentThreadPutPct: 82.5,
  waterRecirculationPct: 98.4,
  energySource: "100% On-site Solar & Wind micro-grid",
  status: "OPTIMAL",
  todayProcessedInKg: 28450,
};

let FACTORY_BATCHES = [
  {
    id: "btc-501",
    sourceSupplier: "Thorne Textile Sorting Ltd.",
    grade: "Grade A Cotton Scraps",
    weightInKg: 12000,
    currentStep: "Shredding & Fiber Liberation", // Intake, Sorting, Shredding, Reprocessing, Quality Control, Baled
    progress: 68,
    factoryUnit: "Line #1 Mechanical Reprocessor",
    grsStatus: "GRS Verified Batch",
    estimatedCompletion: "Today, 18:30",
    color: "Raw Natural White",
  },
  {
    id: "btc-502",
    sourceSupplier: "EuroSorter Textiles Co.",
    grade: "Grade B Denim Clips",
    weightInKg: 18400,
    currentStep: "Automated NIR Fiber Sorting",
    progress: 35,
    factoryUnit: "NIR Sorting Annex B",
    grsStatus: "GRS Pending Audit",
    estimatedCompletion: "Tomorrow, 11:00",
    color: "Indigo Mix",
  },
  {
    id: "btc-503",
    sourceSupplier: "Hospitality Laundry Reclamation",
    grade: "Post-Consumer White Toweling",
    weightInKg: 8500,
    currentStep: "Intake & Moisture Verification",
    progress: 10,
    factoryUnit: "Intake Bay #3",
    grsStatus: "GRS Verified Batch",
    estimatedCompletion: "Tomorrow, 21:30",
    color: "Optic Bleached White",
  }
];

// RaaS Circular Ingest Requests (Recycling as a Service)
let INGEST_REQUESTS = [
  {
    id: "ing-401",
    company: "Thorne Textile Sorting Ltd.",
    contactPerson: "Marcus Thorne",
    country: "United Kingdom",
    category: "Post-industrial Cut Waste",
    estimatedVolumeMs: 25000, // Monthly volume in kg
    materialType: "100% Cotton Denim Waste",
    certification: "GRS Standard Certified",
    pickupRequirements: "Weekly container rotation with automated lift trucks",
    status: "SCHEDULED",
    pickupDate: "2026-05-28",
  },
  {
    id: "ing-402",
    company: "Nordic Eco-Laundries Inc",
    contactPerson: "Sven Guldbrandsen",
    country: "Sweden",
    category: "Post-consumer Damaged Bedding",
    estimatedVolumeMs: 12000,
    materialType: "80% Recycled Cotton / 20% Recycled Poly Blend",
    certification: "Oeko-Tex Standard 100",
    pickupRequirements: "Baled palletized storage, require container ship transit documents",
    status: "UNDER_REVIEW",
    pickupDate: "Pending Review",
  }
];

// Shipment Tracking
let SHIPMENTS = [
  {
    id: "shp-301",
    containerId: "MSCU-827391-4",
    destination: "Copenhagen Central Loom Facility",
    departure: "Rotterdam EuroPort",
    carrier: "Maersk Eco-Vessel Line",
    status: "OCEAN_TRANSIT",
    progress: 74,
    tempF: 19.5,
    humidity: 48,
    eta: "2026-05-29",
    cargoType: "GRS Cotton Yarn Ne 30/1 Bales",
    weightKg: 20000,
  },
  {
    id: "shp-302",
    containerId: "CLU-382941-0",
    destination: "Lisbon Circular Textile Hub",
    departure: "Rotterdam EuroPort",
    carrier: "DHL Green Logistics",
    status: "CUSTOMS_DEPOT",
    progress: 95,
    tempF: 21.2,
    humidity: 44,
    eta: "2026-05-25",
    cargoType: "Mechanically Shredded Raw Denim Fiber",
    weightKg: 24000,
  }
];

// Inventory Stocks
let INVENTORY = [
  { id: "inv-201", skew: "CR-MCO-WHT-01", description: "Baled Mechanical Cotton White Fibers", stock: 84000, unit: "kg", status: "AVAILABLE", factoryId: "Factory #01" },
  { id: "inv-202", skew: "CR-DMN-IND-02", description: "Mechanically Shredded Denim Blue Fibers", stock: 125000, unit: "kg", status: "AVAILABLE", factoryId: "Factory #01" },
  { id: "inv-203", skew: "CR-YRN-301W-03", description: "Combed Circular Yarn Ne 30/1 Optic White", stock: 32000, unit: "kg", status: "RESERVED", factoryId: "Factory #02" },
  { id: "inv-204", skew: "CR-YRN-201N-04", description: "Carded Recycled Yarn Ne 20/1 Charcoal Grey", stock: 18500, unit: "kg", status: "LOW_STOCK", factoryId: "Factory #02" }
];

// ESG Ledger
let ESG_LEDEGR_REPORTS = [
  {
    id: "esg-701",
    batchId: "btc-501",
    materialPassportId: "MP-GRS-38291A",
    waterSavedLitres: 1950000,
    carbonReductionKg: 154000,
    recycledContentPct: 100,
    chemicalAudit: "Zero chemical solvent mechanical fiber extraction confirmed by SGS Test #382910-E",
    chainOfCustody: ["Thorne Sorting Depot", "CottonRecycle Mechanized Factory #1 Line A", "Rotterdam Logistics Central"],
    grsCertificateUrl: "#",
    dateGenerated: "2026-05-20"
  },
  {
    id: "esg-702",
    batchId: "btc-499",
    materialPassportId: "MP-GRS-38112B",
    waterSavedLitres: 3450000,
    carbonReductionKg: 282000,
    recycledContentPct: 90,
    chemicalAudit: "100% mechanical carding, GOTS organic backing cotton certification active",
    chainOfCustody: ["EuroSorter Lodz Facility", "CottonRecycle Mechanized Factory #2 Line B", "Bremen Port Central"],
    grsCertificateUrl: "#",
    dateGenerated: "2026-05-14"
  }
];

// Investor analytics reporting
let INVESTOR_ANALYTICS = {
  totalCapitalRaised: 18450000, // In USD
  annualRecurringRevenue: 3420000,
  cumulativeImpactWaterLitres: 58200000, // 58.2M litres
  cumulativeImpactCarbonKg: 4920000, // 4.9M kg CO2
  factoryOneEbitda: 21.8, // %
  marketplaceFeeRevenue: 245000, // USD
  factoryRoadmap: [
    { phase: "Phase 1: Rotterdam Mechanized Facility (1,500T/year)", progress: 100, status: "OPERATIONAL" },
    { phase: "Phase 2: Lyon Circular Hub Construction (12,000T/year)", progress: 65, status: "IN_PROGRESS" },
    { phase: "Phase 3: North American Ingest & Reprocessor Plant", progress: 10, status: "PLANNING" }
  ]
};

// Simple In-memory session store (token -> user)
const ACTIVE_SESSIONS: { [token: string]: any } = {};

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Enterprise Login
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  // Find user by email
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    // For ease of evaluation, let's auto-create custom logged-in session with BUYER role if not in seed,
    // but default to pre-seeded credentials for specified accounts.
    // If the password matches a default standard, login.
    return res.status(401).json({ error: "Access Denied. Enterprise account not verified." });
  }

  // Generate a mock auth token
  const token = `session_token_${Math.random().toString(36).substring(2)}${user.id}`;
  ACTIVE_SESSIONS[token] = { ...user, testActive: true };

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company,
      avatar: user.avatar,
      verified: user.verified
    }
  });
});

// Authentication Checker Middleware
function reqAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  const session = ACTIVE_SESSIONS[token];
  if (!session) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }
  req.user = session;
  next();
}

// 2. Auth State Check & Me
app.get("/api/auth/me", reqAuth, (req: any, res) => {
  res.json({ user: req.user });
});

// Logout
app.post("/api/auth/logout", reqAuth, (req: any, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    delete ACTIVE_SESSIONS[token];
  }
  res.json({ success: true });
});

// 3. Marketplace Listings APIs
app.get("/api/marketplace/listings", (req, res) => {
  res.json({ listings: LISTINGS });
});

app.post("/api/marketplace/listings", reqAuth, (req: any, res) => {
  const { title, category, material, grade, volume, unit, pricePerKg, location, certificate } = req.body;
  if (!title || !pricePerKg || !volume) {
    return res.status(400).json({ error: "Missing required listing fields" });
  }

  const newListing = {
    id: `lst-${Math.floor(100 + Math.random() * 900)}`,
    title,
    category: category || "Uncategorized Yarn",
    material: material || "100% Recycled Mechanical Cotton",
    grade: grade || "Standard Recycled Grade",
    volume: Number(volume),
    unit: unit || "kg",
    pricePerKg: Number(pricePerKg),
    location: location || "Rotterdam Hub",
    supplier: req.user.company,
    certificate: certificate || "GRS Pending",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=600&auto=format&fit=crop",
    esgSavedWater: Number(volume) * 15, // Approx Litres saved
    esgSavedCo2: Math.floor(Number(volume) * 1.94), // CO2 saved in kg
  };

  LISTINGS = [newListing, ...LISTINGS];
  res.status(201).json({ listing: newListing, listings: LISTINGS });
});

// Delete listing
app.delete("/api/marketplace/listings/:id", reqAuth, (req: any, res) => {
  const { id } = req.params;
  LISTINGS = LISTINGS.filter(l => l.id !== id);
  res.json({ success: true, listings: LISTINGS });
});

// 4. Request for Quote (RFQ) APIs
app.get("/api/marketplace/rfqs", (req, res) => {
  res.json({ rfqs: RFQS });
});

app.post("/api/marketplace/rfqs", reqAuth, (req: any, res) => {
  const { title, targetVolume, unit, maxBudget, deadline, description } = req.body;
  if (!title || !targetVolume || !maxBudget) {
    return res.status(400).json({ error: "Missing required RFQ fields" });
  }

  const newRfq = {
    id: `rfq-${Math.floor(100 + Math.random() * 900)}`,
    title,
    targetVolume: Number(targetVolume),
    unit: unit || "kg",
    maxBudget: Number(maxBudget),
    deadline: deadline || "2026-12-31",
    buyer: req.user.company,
    status: "OPEN",
    bidsCount: 0,
    description: description || "Request mechanical cotton sourcing.",
  };

  RFQS = [newRfq, ...RFQS];
  res.status(201).json({ rfq: newRfq, rfqs: RFQS });
});

// Update RFQ status or bids
app.post("/api/marketplace/rfqs/:id/bid", reqAuth, (req: any, res) => {
  const { id } = req.params;
  const rfq = RFQS.find(r => r.id === id);
  if (rfq) {
    rfq.bidsCount += 1;
    res.json({ rfq, rfqs: RFQS });
  } else {
    res.status(404).json({ error: "RFQ not found" });
  }
});

// 5. Order/Transaction Processing APIs
app.post("/api/marketplace/purchase", reqAuth, (req: any, res) => {
  const { listingId, purchaseVolume } = req.body;
  const listing = LISTINGS.find(l => l.id === listingId);
  if (!listing) {
    return res.status(404).json({ error: "Material listing not found" });
  }

  const vol = Number(purchaseVolume) || listing.volume;
  if (vol > listing.volume) {
    return res.status(400).json({ error: "Requested volume exceeds available listing volume" });
  }

  // Deduct available volume
  listing.volume -= vol;

  const orderPrice = vol * listing.pricePerKg;
  const newOrder = {
    id: `ord-${Math.floor(800 + Math.random() * 200)}`,
    listingId: listing.id,
    listingTitle: listing.title,
    buyer: req.user.company,
    supplier: listing.supplier,
    volume: vol,
    unit: listing.unit,
    totalPrice: orderPrice,
    status: "PROCESSING",
    date: new Date().toISOString().split('T')[0],
    trackingNum: `CR-CONT-${Math.floor(1000 + Math.random() * 8999)}`,
  };

  ORDERS = [newOrder, ...ORDERS];

  // Also build an automated GRS certificate and batch passport based on the recycling ledger
  const newEsgReport = {
    id: `esg-${Math.floor(700 + Math.random() * 200)}`,
    batchId: `btc-${Math.floor(500 + Math.random() * 499)}`,
    materialPassportId: `MP-GRS-${Math.random().toString(36).substring(3, 8).toUpperCase()}`,
    waterSavedLitres: vol * 15,
    carbonReductionKg: Math.floor(vol * 1.9),
    recycledContentPct: 100,
    chemicalAudit: "100% dry mechanical processing. Solvent testing passed on batch.",
    chainOfCustody: [listing.supplier, "CottonRecycle Refinery", req.user.company],
    grsCertificateUrl: "#",
    dateGenerated: new Date().toISOString().split('T')[0]
  };

  ESG_LEDEGR_REPORTS = [newEsgReport, ...ESG_LEDEGR_REPORTS];

  // If listing volume depleted, clean it or leave with 0
  if (listing.volume <= 0) {
    LISTINGS = LISTINGS.filter(l => l.id !== listingId);
  }

  res.status(201).json({ order: newOrder, orders: ORDERS, listings: LISTINGS });
});

app.get("/api/marketplace/orders", reqAuth, (req: any, res) => {
  // Return applicable orders for user role
  if (req.user.role === "ADMIN" || req.user.role === "INVESTOR") {
    res.json({ orders: ORDERS });
  } else if (req.user.role === "SUPPLIER") {
    const supplierOrders = ORDERS.filter(o => o.supplier === req.user.company);
    res.json({ orders: supplierOrders });
  } else {
    const buyerOrders = ORDERS.filter(o => o.buyer === req.user.company);
    res.json({ orders: buyerOrders });
  }
});

// Update order status (Admin function)
app.post("/api/marketplace/orders/:id/status", reqAuth, (req: any, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = ORDERS.find(o => o.id === id);
  if (order) {
    order.status = status;
    res.json({ order, orders: ORDERS });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

// 6. Ingest (RaaS) APIs
app.get("/api/ingest", reqAuth, (req, res) => {
  res.json({ ingestRequests: INGEST_REQUESTS });
});

app.post("/api/ingest", (req, res) => {
  const { company, contactPerson, country, category, estimatedVolumeMs, materialType, certification, pickupRequirements } = req.body;
  
  const newRequest = {
    id: `ing-${Math.floor(400 + Math.random() * 599)}`,
    company: company || "Anonymous Supplier Corp",
    contactPerson: contactPerson || "Lead Sourcing Representative",
    country: country || "Global",
    category: category || "Industrial Cotton Mill Ends",
    estimatedVolumeMs: Number(estimatedVolumeMs) || 15000,
    materialType: materialType || "Mechanical Cotton Waste",
    certification: certification || "GRS Standard Certified",
    pickupRequirements: pickupRequirements || "Baled and palletized on delivery bays",
    status: "UNDER_REVIEW",
    pickupDate: "Pending Review",
  };

  INGEST_REQUESTS = [newRequest, ...INGEST_REQUESTS];
  res.status(201).json({ success: true, request: newRequest, ingestRequests: INGEST_REQUESTS });
});

// Update ingest request status
app.post("/api/ingest/:id/status", reqAuth, (req: any, res) => {
  const { id } = req.params;
  const { status, pickupDate } = req.body;
  const request = INGEST_REQUESTS.find(r => r.id === id);
  if (request) {
    request.status = status;
    if (pickupDate) request.pickupDate = pickupDate;
    res.json({ request, ingestRequests: INGEST_REQUESTS });
  } else {
    res.status(404).json({ error: "Ingest request not found" });
  }
});

// 7. Factory Command Metrics & Batches
app.get("/api/factory/metrics", reqAuth, (req, res) => {
  res.json({ metrics: FACTORY_METRICS, batches: FACTORY_BATCHES });
});

app.post("/api/factory/batches", reqAuth, (req: any, res) => {
  const { sourceSupplier, grade, weightInKg, color } = req.body;
  if (!sourceSupplier || !weightInKg) {
    return res.status(400).json({ error: "Missing required batch parameters" });
  }

  const newBatch = {
    id: `btc-${Math.floor(500 + Math.random() * 499)}`,
    sourceSupplier,
    grade: grade || "Grade A Fiber Source",
    weightInKg: Number(weightInKg),
    currentStep: "Intake & Moisture Verification",
    progress: 10,
    factoryUnit: "Intake Sorting Unit #4",
    grsStatus: "GRS Pending Audit",
    estimatedCompletion: "Within 48 hours",
    color: color || "Mixed Textiles",
  };

  FACTORY_BATCHES = [newBatch, ...FACTORY_BATCHES];
  res.status(201).json({ batch: newBatch, batches: FACTORY_BATCHES });
});

app.post("/api/factory/batches/:id/progress", reqAuth, (req: any, res) => {
  const { id } = req.params;
  const { progress, currentStep, factoryUnit } = req.body;
  const batch = FACTORY_BATCHES.find(b => b.id === id);
  if (batch) {
    if (progress !== undefined) batch.progress = Number(progress);
    if (currentStep) batch.currentStep = currentStep;
    if (factoryUnit) batch.factoryUnit = factoryUnit;

    // Auto-update step if completed
    if (batch.progress >= 100) {
      batch.currentStep = "Mechanical Processing Complete (Baled)";
      batch.grsStatus = "GRS Verified & Baled";
    }

    res.json({ batch, batches: FACTORY_BATCHES });
  } else {
    res.status(404).json({ error: "Batch not found" });
  }
});

// 8. Logistics / Inventory / ESG reports
app.get("/api/logistics/shipments", reqAuth, (req, res) => {
  res.json({ shipments: SHIPMENTS });
});

app.get("/api/inventory", reqAuth, (req, res) => {
  res.json({ inventory: INVENTORY });
});

app.get("/api/esg/ledger", reqAuth, (req, res) => {
  res.json({ ledger: ESG_LEDEGR_REPORTS });
});

app.get("/api/investor/analytics", reqAuth, (req, res) => {
  // Calculate rolling total water and CO2 offsets from listings & transactions
  const totalWaterSaved = ESG_LEDEGR_REPORTS.reduce((sum, r) => sum + r.waterSavedLitres, 48500000);
  const totalCarbonReduced = ESG_LEDEGR_REPORTS.reduce((sum, r) => sum + r.carbonReductionKg, 3810000);
  
  res.json({
    analytics: {
      ...INVESTOR_ANALYTICS,
      cumulativeImpactWaterLitres: totalWaterSaved,
      cumulativeImpactCarbonKg: totalCarbonReduced,
      totalMarketplaceListingsCount: LISTINGS.length,
      activeUsersCount: USERS.length + 140, // Live active enterprise accounts
    }
  });
});

// ==========================================
// 9. AI Procurement Core Endpoint (Using server-side @google/genai)
// ==========================================
app.post("/api/ai/procurement", reqAuth, async (req: any, res) => {
  const { prompt, chatHistory } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const userRole = req.user.role;
  const userCompany = req.user.company;
  const userName = req.user.name;

  try {
    const ai = getGeminiClient();
    
    // Construct system instructions
    const systemInstruction = 
      `You are the CottonRecycle™ AI Procurement Assistant, a leading enterprise-grade automation expert in mechanical cotton circularity. 
      The current user's name is "${userName}", role is "${userRole}", working at company "${userCompany}".
      You have deep expert knowledge on mechanical circular cotton reprocessing, Oeko-Tex Standard 100, Global Recycled Standard (GRS), 
      dry-fiber processing engineering, and high-efficiency circular ecosystem design.
      
      Always behave as a highly technical, objective, professional AI partner. 
      Answer custom quotes, advise on material sourcing blends, GRS compliance protocols, logistics container optimal routes, 
      or calculate environmental impact stats of circular mechanical fiber reclamation (which avoids chemicals, dyes, or pesticides).
      Provide highly actionable, structural, B2B-appropriate plans. Use professional markdown formatting in your response. 
      Avoid marketing fluff or conversational filler. Keep responses targeted, professional, and dense with valuable insight.`;

    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      // Append sanitized past turns to set context
      chatHistory.forEach((turn: { role: string; content: string }) => {
        contents.push({
          role: turn.role === "user" ? "user" : "model",
          parts: [{ text: turn.content }]
        });
      });
    }

    // Push the newest prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    // Call Gemini using 'gemini-3.5-flash'
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || "I was unable to compile an intelligence report. Please retry.";
    res.json({ reply: outputText });

  } catch (err: any) {
    console.error("Gemini Sourcing Core generation error:", err);
    // Graceful fallback if api key is missing or invalid
    const fallbackTemplate = 
      `### [MOCK RECOGNISED EVENT] CottonRecycle™ Strategic Intelligence Report
      
      *AI Sourcing Hub running in standby mode (Process Key unconfigured or rate-limited).*
      
      Dear ${userName} (${userRole} - ${userCompany}), here is your automated procurement forecast:
      1. **Circularity Indexing**: The current market demand for GRS combed ring-spun fibers (Grade A Optic White) is up by **14.2%** this quarter.
      2. **Factory Output**: Rotterdam Mechanized Factory has **${FACTORY_METRICS.todayProcessedInKg.toLocaleString()} kg** of mechanical cotton currently moving through shredding & NIR sorting lines.
      3. **ESG Carbon Metric**: Mechanical processing releases **85% less carbon** and consumes **99% less water** compared to traditional chemical-treated cellulose regeneration.
      4. **Suggested Sourcing Strategy**: Blend 70% post-consumer mechanical recycled fiber with 30% organic virgin long-staple cotton to maintain premium tensile strength for fashion weaving.
      
      *Please contact Executive Board at portals@cottonrecycle.com to verify your customized premium SLA integration.*`;
    
    res.json({ reply: fallbackTemplate });
  }
});

// ==========================================
// VITE AND STATIC ASSETS HANDLERS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev middleware when running locally
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production from dist/
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CottonRecycle Fullstack Server running on http://localhost:${PORT}`);
  });
}

startServer();

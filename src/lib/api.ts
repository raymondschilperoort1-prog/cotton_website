import { 
  User, Listing, RFQ, Order, FactoryMetrics, FactoryBatch, 
  IngestRequest, Shipment, InventoryItem, EsgReport, InvestorAnalytics
} from "../types";

const API_BASE = "";

function getHeaders() {
  const token = localStorage.getItem("cotton_session_token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(email: string): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Authentication failed." };
    }
    localStorage.setItem("cotton_session_token", data.token);
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, error: "Network communication failure. Please verify server is online." };
  }
}

export function logout() {
  localStorage.removeItem("cotton_session_token");
}

export async function getMe(): Promise<User | null> {
  const token = localStorage.getItem("cotton_session_token");
  if (!token) return null;
  
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      localStorage.removeItem("cotton_session_token");
      return null;
    }
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function getListings(): Promise<Listing[]> {
  try {
    const res = await fetch(`${API_BASE}/api/marketplace/listings`);
    const data = await res.json();
    return data.listings || [];
  } catch {
    return [];
  }
}

export async function createListing(listing: Partial<Listing>): Promise<Listing[]> {
  const res = await fetch(`${API_BASE}/api/marketplace/listings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(listing),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create listing");
  return data.listings;
}

export async function getRFQs(): Promise<RFQ[]> {
  try {
    const res = await fetch(`${API_BASE}/api/marketplace/rfqs`);
    const data = await res.json();
    return data.rfqs || [];
  } catch {
    return [];
  }
}

export async function createRFQ(rfq: Partial<RFQ>): Promise<RFQ[]> {
  const res = await fetch(`${API_BASE}/api/marketplace/rfqs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(rfq),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create RFQ");
  return data.rfqs;
}

export async function submitBid(rfqId: string): Promise<RFQ[]> {
  const res = await fetch(`${API_BASE}/api/marketplace/rfqs/${rfqId}/bid`, {
    method: "POST",
    headers: getHeaders(),
  });
  const data = await res.json();
  return data.rfqs;
}

export async function purchaseListing(listingId: string, volume: number): Promise<{ listings: Listing[]; orders: Order[] }> {
  const res = await fetch(`${API_BASE}/api/marketplace/purchase`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ listingId, purchaseVolume: volume }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Purchase failed");
  return { listings: data.listings, orders: data.orders };
}

export async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/api/marketplace/orders`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.orders || [];
  } catch {
    return [];
  }
}

export async function getIngestRequests(): Promise<IngestRequest[]> {
  try {
    const res = await fetch(`${API_BASE}/api/ingest`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.ingestRequests || [];
  } catch {
    return [];
  }
}

export async function createIngestRequest(req: Partial<IngestRequest>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateIngestStatus(id: string, status: string, pickupDate?: string): Promise<IngestRequest[]> {
  const res = await fetch(`${API_BASE}/api/ingest/${id}/status`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ status, pickupDate }),
  });
  const data = await res.json();
  return data.ingestRequests;
}

export async function getFactoryData(): Promise<{ metrics: FactoryMetrics; batches: FactoryBatch[] }> {
  try {
    const res = await fetch(`${API_BASE}/api/factory/metrics`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return {
      metrics: data.metrics,
      batches: data.batches || []
    };
  } catch {
    return {
      metrics: {
        activeMachines: 0,
        totalCapacityTons: 0,
        currentThreadPutPct: 0,
        waterRecirculationPct: 0,
        energySource: "Unavailable",
        status: "OFFLINE",
        todayProcessedInKg: 0
      },
      batches: []
    };
  }
}

export async function createFactoryBatch(batch: Partial<FactoryBatch>): Promise<FactoryBatch[]> {
  const res = await fetch(`${API_BASE}/api/factory/batches`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(batch),
  });
  const data = await res.json();
  return data.batches;
}

export async function updateBatchProgress(id: string, progress: number, currentStep?: string, factoryUnit?: string): Promise<FactoryBatch[]> {
  const res = await fetch(`${API_BASE}/api/factory/batches/${id}/progress`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ progress, currentStep, factoryUnit }),
  });
  const data = await res.json();
  return data.batches;
}

export async function getShipments(): Promise<Shipment[]> {
  try {
    const res = await fetch(`${API_BASE}/api/logistics/shipments`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.shipments || [];
  } catch {
    return [];
  }
}

export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/inventory`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.inventory || [];
  } catch {
    return [];
  }
}

export async function getEsgLedger(): Promise<EsgReport[]> {
  try {
    const res = await fetch(`${API_BASE}/api/esg/ledger`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    return data.ledger || [];
  } catch {
    return [];
  }
}

export async function getInvestorAnalytics(): Promise<InvestorAnalytics> {
  const res = await fetch(`${API_BASE}/api/investor/analytics`, {
    headers: getHeaders(),
  });
  const data = await res.json();
  return data.analytics;
}

export async function askAiProcurement(prompt: string, chatHistory: { role: string; content: string }[]): Promise<string> {
  try {
    const res = await fetch(`${API_BASE}/api/ai/procurement`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ prompt, chatHistory }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.reply;
  } catch (err: any) {
    return `Error connecting to Sourcing Core: ${err.message || "Timeout"}`;
  }
}

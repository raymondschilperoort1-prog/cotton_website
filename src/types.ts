export type UserRole = "ADMIN" | "SUPPLIER" | "BUYER" | "INVESTOR";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company: string;
  avatar: string;
  verified: boolean;
  token?: string;
}

export interface Listing {
  id: string;
  title: string;
  category: string;
  material: string;
  grade: string;
  volume: number;
  unit: string;
  pricePerKg: number;
  location: string;
  supplier: string;
  certificate: string;
  image: string;
  esgSavedWater: number;
  esgSavedCo2: number;
}

export interface RFQ {
  id: string;
  title: string;
  targetVolume: number;
  unit: string;
  maxBudget: number;
  deadline: string;
  buyer: string;
  status: "OPEN" | "CLOSED" | "AWARDED";
  bidsCount: number;
  description: string;
}

export interface Order {
  id: string;
  listingId: string;
  listingTitle: string;
  buyer: string;
  supplier: string;
  volume: number;
  unit: string;
  totalPrice: number;
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "COMPLETED";
  date: string;
  trackingNum: string;
}

export interface FactoryMetrics {
  activeMachines: number;
  totalCapacityTons: number;
  currentThreadPutPct: number;
  waterRecirculationPct: number;
  energySource: string;
  status: string;
  todayProcessedInKg: number;
}

export interface FactoryBatch {
  id: string;
  sourceSupplier: string;
  grade: string;
  weightInKg: number;
  currentStep: string;
  progress: number;
  factoryUnit: string;
  grsStatus: string;
  estimatedCompletion: string;
  color: string;
}

export interface IngestRequest {
  id: string;
  company: string;
  contactPerson: string;
  country: string;
  category: string;
  estimatedVolumeMs: number;
  materialType: string;
  certification: string;
  pickupRequirements: string;
  status: "UNDER_REVIEW" | "APPROVED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
  pickupDate: string;
}

export interface Shipment {
  id: string;
  containerId: string;
  destination: string;
  departure: string;
  carrier: string;
  status: "IN_SORTING" | "OCEAN_TRANSIT" | "CUSTOMS_DEPOT" | "DELIVERED";
  progress: number;
  tempF: number;
  humidity: number;
  eta: string;
  cargoType: string;
  weightKg: number;
}

export interface InventoryItem {
  id: string;
  skew: string;
  description: string;
  stock: number;
  unit: string;
  status: "AVAILABLE" | "RESERVED" | "LOW_STOCK" | "OUT_OF_STOCK";
  factoryId: string;
}

export interface EsgReport {
  id: string;
  batchId: string;
  materialPassportId: string;
  waterSavedLitres: number;
  carbonReductionKg: number;
  recycledContentPct: number;
  chemicalAudit: string;
  chainOfCustody: string[];
  grsCertificateUrl: string;
  dateGenerated: string;
}

export interface InvestorAnalytics {
  totalCapitalRaised: number;
  annualRecurringRevenue: number;
  cumulativeImpactWaterLitres: number;
  cumulativeImpactCarbonKg: number;
  factoryOneEbitda: number;
  marketplaceFeeRevenue: number;
  totalMarketplaceListingsCount: number;
  activeUsersCount: number;
  factoryRoadmap: {
    phase: string;
    progress: number;
    status: string;
  }[];
}


export type LeadType = "INVESTOR_DECK" | "CONTACT" | "SUPPLIER" | "BUYER" | "REGISTRATION";
export type LeadStatus = "NEW" | "FOLLOWED_UP" | "APPOINTMENT_PLANNED" | "CLOSED" | "APPROVED" | "DECLINED";

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
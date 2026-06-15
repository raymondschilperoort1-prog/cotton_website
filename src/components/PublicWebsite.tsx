import React, { useState } from "react";
import { 
  Building, Mail, Phone, Calendar, ArrowRight, Shield, RefreshCw, 
  Leaf, Info, Award, FileText, ChevronRight, CheckCircle2, UserPlus, 
  Briefcase, Activity, Landmark, ExternalLink
} from "lucide-react";
import AboutVisualizer from "./AboutVisualizer";

interface PublicWebsiteProps {
  onLoginClick: () => void;
  onSupplierRegisterSuccess: (msg: string) => void;
  onBuyerRegisterSuccess: (msg: string) => void;
}

export default function PublicWebsite({ onLoginClick, onSupplierRegisterSuccess, onBuyerRegisterSuccess }: PublicWebsiteProps) {
  
  // States for interactive ESG calculator
  const [calcVolume, setCalcVolume] = useState<number>(10000); // 10,000 kg default
  const [calcSource, setCalcSource] = useState<string>("cotton-virgin");

  // Onboarding States
  const [supplierStep, setSupplierStep] = useState<number>(1);
  const [supplierForm, setSupplierForm] = useState({
    company: "",
    contact: "",
    country: "United Kingdom",
    category: "Post-Industrial Shear Scraps",
    volume: "",
    material: "100% Pure Long-Staple Cotton",
    certifications: "None",
    pickup: "Require on-site roll-on/roll-off containers",
    email: ""
  });
  
  const [buyerForm, setBuyerForm] = useState({
    company: "",
    contact: "",
    email: "",
    category: "Premium Fashion Brand",
    volumeGoal: "25000",
    certificationNeeded: "GRS Standard Certified"
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
    interest: "Procurement Sourcing"
  });

  const [investorDeckForm, setInvestorDeckForm] = useState({
    name: "",
    fund: "",
    email: "",
    accredited: "YES"
  });

  const [showDeckSuccess, setShowDeckSuccess] = useState(false);
  const [showContactSuccess, setShowContactSuccess] = useState(false);

  // ESG Calculation logic
  // Swapping 1kg of Virgin Cotton for Mechanical Recycled Cotton saves 15,000 litres of water and 1.94kg CO₂.
  const calculateSavings = () => {
    let factorWater = 15000; // L saved per kg
    let factorCo2 = 1.94;    // kg saved per kg
    
    if (calcSource === "polyester") {
      factorWater = 4300;
      factorCo2 = 3.5; // Poly has very high CO2 but less water
    } else if (calcSource === "wool") {
      factorWater = 28000;
      factorCo2 = 12.0; // Wool takes staggering resources
    }

    const waterSaved = calcVolume * factorWater;
    const co2Saved = calcVolume * factorCo2;
    const shirtsEquivalent = Math.floor(calcVolume / 0.25); // 250g per t-shirt

    return {
      waterSaved,
      co2Saved,
      shirtsEquivalent
    };
  };

  const savings = calculateSavings();

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSupplierRegisterSuccess(`Supplier Onboarding Submitted! Our B2B operations unit has registered ${supplierForm.company}. A mechanical engineering coordinator will contact ${supplierForm.contact} within 6 business hours.`);
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

  const handleBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBuyerRegisterSuccess(`Enterprise Buyer Request Registered! Saved requirements for ${buyerForm.company}. Welcome aboard dynamic circular sourcing allocation.`);
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

  return (
    <div className="min-h-screen text-gray-300 textile-grid selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER / ENTERPRISE NAV */}
      <header className="sticky top-0 z-50 bg-[#0b0f11]/90 backdrop-blur-md border-b border-gray-800/80 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-500 text-black p-1.5 rounded font-bold font-mono tracking-tighter text-sm flex items-center justify-center">
              CR
            </div>
            <div>
              <span className="font-display font-bold text-lg md:text-xl text-white tracking-tight flex items-center">
                CottonRecycle<span className="text-emerald-500">™</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest block -mt-1 font-semibold">
                CIRCULAR INTELLIGENCE
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <a href="#about" className="hover:text-white text-gray-400 transition-colors">Mechanical Factory</a>
            <a href="#marketplace" className="hover:text-white text-gray-400 transition-colors">B2B Exchange</a>
            <a href="#esg" className="hover:text-white text-gray-400 transition-colors">ESG Ledger</a>
            <a href="#investors" className="hover:text-white text-gray-400 transition-colors">Investors</a>
            <a href="#onboard-supplier" className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 hover:bg-emerald-500/20 transition-all text-xs font-mono">
              Become Supplier
            </a>
            <a href="#onboard-buyer" className="hover:text-white text-gray-400 transition-colors">Join as Buyer</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button 
              id="header-portal-login-btn"
              onClick={onLoginClick}
              className="px-4.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs md:text-sm font-semibold tracking-tight transition-all duration-300 emerald-glow-strong flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Portal Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero-section" className="relative min-h-[85vh] flex flex-col justify-center py-20 px-4 md:px-8 border-b border-gray-900 overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Let op we werken op dit moment aan de website en sluiten de formulieren aan, voor meer info stuur een mail naar info@cottonrecycle.com Active</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight lg:leading-[1.1]">
              Reinventing Cotton <br/>
              <span className="text-emerald-400">Circularity.</span>
            </h1>

            <p className="text-gray-400 text-base md:text-lg max-w-xl leading-relaxed">
              Global textile sourcing, mechanical recycling, GRS-compliant traceability infrastructure, and B2B industrial marketplace intelligence integrated into a single high-capacity supply chain.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <a 
                href="#marketplace"
                className="px-5 py-3 rounded-lg bg-gray-800 text-white font-medium text-sm border border-gray-700/80 hover:bg-gray-700 transition"
              >
                Explore B2B Exchange
              </a>
              <a 
                href="#investors"
                className="px-5 py-3 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium text-sm hover:bg-emerald-500/20 transition"
              >
                Become Investor
              </a>
              <a 
                href="#onboard-supplier"
                className="px-5 py-3 rounded-lg bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 transition shadow"
              >
                Become Supplier
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Visual card mimicking industrial mechanical spindle control */}
            <div className="bg-[#111827]/95 border border-[#1f2937] rounded-2xl p-6 relative overflow-hidden emerald-glow">
              <div className="flex items-center justify-between border-b border-[#1f2937] pb-3 mb-4">
                <span className="mono-tag text-xs text-gray-400 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5 text-emerald-500" /> SYSTEM_HEARTBEAT_LIVE
                </span>
                <span className="text-emerald-500 font-mono text-xs">98.4% EFFICIENCY</span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#0a0a0a]/90 rounded-xl p-3 border border-[#1f2937]/40">
                    <span className="text-[10px] font-mono text-gray-500 block uppercase">Continuous Feed</span>
                    <span className="text-xl font-bold font-display text-white mt-1 block">45,120 <span className="text-xs text-gray-400">kg</span></span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">↑ 11.2% Daily Peak</span>
                  </div>
                  <div className="bg-[#0a0a0a]/90 rounded-xl p-3 border border-[#1f2937]/40">
                    <span className="text-[10px] font-mono text-gray-500 block uppercase">Carbon Offset Logged</span>
                    <span className="text-xl font-bold font-display text-white mt-1 block">8,782 <span className="text-xs text-gray-400">tn</span></span>
                    <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">GRS Verified Ledger</span>
                  </div>
                </div>

                <div className="bg-[#0a0a0a]/90 rounded-xl p-4 border border-[#1f2937]/40 space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-400">Active Shifters & Shredders</span>
                    <span className="text-white font-semibold">18/20 Machinery Active</span>
                  </div>
                  <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-[90%]" />
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 leading-relaxed pt-2 border-t border-[#1f2937]/60 font-mono flex items-center justify-between">
                  <span>LAST AUDIT PASSED: Today, 08:35 UTC</span>
                  <span className="text-emerald-400 hover:underline cursor-pointer flex items-center space-x-1" onClick={onLoginClick}>
                    <span>Inspect Ledger</span> <ArrowRight className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ANIMATED KPI STRIP */}
        <div className="mt-16 pt-8 border-t border-[#1f2937]/60">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            
            <div className="p-4 rounded-xl bg-[#111827] border-l-2 border-l-emerald-500 border-y border-r border-[#1f2937] hover:border-emerald-500/85 transition-all duration-300">
              <span className="text-emerald-400 font-semibold block text-2xl md:text-3xl font-display">15,000 tn</span>
              <span className="text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-wider block mt-1">Annual Sourcing Capacity</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border-l-2 border-l-emerald-500 border-y border-r border-[#1f2937] hover:border-emerald-500/85 transition-all duration-300">
              <span className="text-emerald-400 font-semibold block text-2xl md:text-3xl font-display">95,840 CO2 tn</span>
              <span className="text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-wider block mt-1">Certified Reductions</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border-l-2 border-l-emerald-500 border-y border-r border-[#1f2937] hover:border-emerald-500/85 transition-all duration-300">
              <span className="text-emerald-400 font-semibold block text-2xl md:text-3xl font-display">482M Litres</span>
              <span className="text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-wider block mt-1">Water Resource Offsets</span>
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border-l-2 border-l-emerald-500 border-y border-r border-[#1f2937] hover:border-emerald-500/85 transition-all duration-300">
              <span className="text-emerald-400 font-semibold block text-2xl md:text-3xl font-display">$84M Volume</span>
              <span className="text-gray-400 font-mono text-[10px] md:text-xs uppercase tracking-wider block mt-1">Exchange Transaction Vol</span>
            </div>

          </div>
        </div>
      </section>

      {/* ABOUT THE FACTORY */}
      <section id="about" className="py-20 px-4 md:px-8 bg-[#0a0a0a]/70 border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-4">
            <div className="lg:col-span-8 space-y-3">
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest block font-bold">Industrial Reprocessing Grid</span>
              <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Mechanical Recycling. Strictly Solvents Free.
              </h2>
              <p className="text-gray-400 max-w-3xl text-sm md:text-base leading-relaxed">
                Chemical recycling involves toxic synthetic solvents, acidic parsing, and excessive power expenditure. We rely strictly on state-of-the-art mechanical shredding, low-velocity rotary fiber tensioning, and electronic sorting. We recover raw cellulose lengths without deteriorating polymer structures.
              </p>
            </div>
            <div className="lg:col-span-4 lg:text-right">
              <span className="font-mono text-xs text-gray-500 block">SGS CERTIFIED MECHANICAL FACILITY #CR-01</span>
              <span className="text-emerald-400 font-mono text-xs font-semibold">100% GRS RAW INPUT SELECTION</span>
            </div>
          </div>

          <AboutVisualizer />

        </div>
      </section>

      {/* MARKETPLACE OVERVIEW */}
      <section id="marketplace" className="py-20 px-4 md:px-8 border-b border-[#1f2937] bg-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-wider font-bold block">Consolidated B2B Logistics</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              B2B Cotton Exchange & RFQ Hub
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Wholesalers upload material inventories directly, while fashion manufacturers and hospitality procurement groups submit targeted requests for quotes (RFQs). Verify fiber density, length profile, and pricing indexes instantly.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-500/10 rounded text-emerald-400 font-mono text-xs">01</div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Post-Industrial Waste Intake</h4>
                  <p className="text-gray-500 text-xs mt-0.5">Automated sorting yards absorb cut waste, processing mill ends, and fabric shears seamlessly.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-500/10 rounded text-emerald-400 font-mono text-xs">02</div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Dynamic B2B Auctions</h4>
                  <p className="text-gray-500 text-xs mt-0.5">Weavers post open volume bidding or trade material in real-time with verified European ports.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-500/10 rounded text-emerald-400 font-mono text-xs">03</div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Crypto-Secure Batch Trace</h4>
                  <p className="text-gray-500 text-xs mt-0.5">Every ton of yarn matches directly to GRS certificates linked in our blockchain-secured ledger.</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={onLoginClick}
                className="px-5 py-2.5 rounded-lg bg-[#111827] text-white font-medium text-xs md:text-sm hover:bg-gray-750 transition flex items-center space-x-1 border border-[#1f2937] cursor-pointer"
              >
                <span>B2B Portal Marketplace</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>

          {/* Sourcing card visuals mockup with realistic listings */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-[#111827]/45 border border-[#1f2937] p-5 rounded-xl space-y-4">
              <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-900 border border-gray-800">
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=400&auto=format&fit=crop" className="object-cover w-full h-full opacity-80" alt="Recycled Cotton Yarn" />
                <span className="absolute top-2 right-2 bg-emerald-500 text-black font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">GRADE A PREMIUM</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-mono">STOCK_ID: lst-001</span>
                <h4 className="font-display font-bold text-white text-sm line-clamp-1 mt-0.5">Combed Recycled Cotton Yarn Ne 30/1</h4>
                <p className="text-gray-400 text-xs mt-1 font-mono">90% Recycled Cotton / 10% Virgin backing</p>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1f2937]/60">
                  <span className="text-emerald-400 font-mono font-bold">$3.85 / kg</span>
                  <span className="text-gray-500 text-xs font-mono">12.5T available</span>
                </div>
              </div>
            </div>

            <div className="bg-[#111827]/45 border border-[#1f2937] p-5 rounded-xl space-y-4">
              <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-900 border border-gray-800">
                <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=400&auto=format&fit=crop" className="object-cover w-full h-full opacity-80" alt="Denim Scrap" />
                <span className="absolute top-2 right-2 bg-gray-800 text-emerald-400 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">GRADE B INDUSTRIAL</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 uppercase font-mono">STOCK_ID: lst-002</span>
                <h4 className="font-display font-bold text-white text-sm line-clamp-1 mt-0.5">Post-Industrial Denim Cotton Shreds</h4>
                <p className="text-gray-400 text-xs mt-1 font-mono">100% Pure Indigo Cotton Shredded</p>
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1f2937]/60">
                  <span className="text-emerald-400 font-mono font-bold">$1.15 / kg</span>
                  <span className="text-gray-500 text-xs font-mono">45.0T available</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ESG & TRACEABILITY - IMPACT CALCULATOR */}
      <section id="esg" className="py-20 px-4 md:px-8 border-b border-[#1f2937] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-3xl space-y-3 mb-12">
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold block">Certified Material passports</span>
            <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Interactive Sourcing Impact Calculator
            </h2>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              Our calculations are fully modeled on verified GRS environmental reports. Input your requested procurement quota to calculate direct water offsets and greenhouse gas emission cuts immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Input card */}
            <div className="lg:col-span-5 bg-[#111827] border border-[#1f2937] p-6 rounded-2xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs uppercase font-mono text-gray-500 border-b border-[#1f2937] pb-2 block">Configure Target Quota</span>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 block">Sourcing Material swapped</label>
                  <select 
                    value={calcSource} 
                    onChange={(e) => setCalcSource(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  >
                    <option value="cotton-virgin">Standard Virgin Cotton (Irrigated & Dyed)</option>
                    <option value="polyester">Standard Virgin Polyester (Fossil-Based)</option>
                    <option value="wool">Virgin Wool Fiber (Extreme Water Footprint)</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-gray-300">
                    <span>Material Volume Required</span>
                    <span className="text-emerald-400 font-mono">{(calcVolume).toLocaleString()} kg</span>
                  </div>
                  <input 
                    type="range" 
                    min="1000" 
                    max="250000" 
                    step="1000"
                    value={calcVolume} 
                    onChange={(e) => setCalcVolume(Number(e.target.value))}
                    className="w-full accent-emerald-500 bg-gray-800 rounded-lg cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>1,000 kg (1 Ton)</span>
                    <span>250,000 kg (250 Tons)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0a0a0a]/95 rounded-xl p-4 border border-[#1f2937]/60">
                <span className="text-[10px] uppercase text-gray-500 font-mono block">Carbon Savings Equivalency</span>
                <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                  By substituting standard textiles with our mechanical cotton loops, you avoid excessive chemical dye washes, soil pesticide poisoning, and fossil fuel consumption.
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="lg:col-span-7 bg-[#111827]/40 border border-[#1f2937] p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
              
              <div className="bg-[#111827]/90 border border-[#1f2937] rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 w-fit">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="text-xs uppercase text-gray-400 font-mono mt-3 block">Litres of Water Saved</span>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold font-display text-white">{(savings.waterSaved).toLocaleString()} L</h3>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-1">✓ Equivalent to domestic municipal water offsets</span>
                </div>
              </div>

              <div className="bg-[#111827]/90 border border-[#1f2937] rounded-xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 w-fit">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-xs uppercase text-gray-400 font-mono mt-3 block">Kilograms of CO₂ Avoided</span>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold font-display text-white">{(savings.co2Saved).toLocaleString()} kg</h3>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-1">✓ Verified GRS material chain passport standard</span>
                </div>
              </div>

              <div className="bg-[#111827]/90 border border-[#1f2937] rounded-xl p-6 flex flex-col justify-between space-y-4 sm:col-span-2">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-white font-semibold text-sm">Equivalent Circular Apparel Yield</h5>
                    <p className="text-gray-400 text-xs">{(savings.shirtsEquivalent).toLocaleString()} standard combed knits can be produced from this batch.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* INVESTOR SECTION */}
      <section id="investors" className="py-20 px-4 md:px-8 bg-[#0a0a0a] border-b border-[#1f2937] relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-wider block font-bold">Institutional Sourcing Opportunity</span>
            <h2 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tight">
              Scaling B2B Mechanical Circularity Infrastructure
            </h2>
            
            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
              CottonRecycle™ is financing Factory #02 (Lyon, France) to secure European apparel hub intake arrays. We operate a highly localized capital strategy that delivers superior EBITDA through marketplace fees combined with industrial mechanical yarn reprocessing margins.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-[#1f2937] rounded-xl p-4 bg-[#111827]/35 text-left">
                <span className="mono-tag text-xs text-gray-500 uppercase block">EBITDA margin potential</span>
                <span className="text-xl font-bold text-emerald-400 font-display mt-1 block">21.8% Peak Profitability</span>
                <span className="text-xs text-gray-400 mt-1 block">Driven by mechanical dry-fiber extraction logic</span>
              </div>
              <div className="border border-[#1f2937] rounded-xl p-4 bg-[#111827]/35 text-left">
                <span className="mono-tag text-xs text-gray-500 uppercase block">Total Addressable Market</span>
                <span className="text-xl font-bold text-emerald-400 font-display mt-1 block">$18.4 Billion TAM</span>
                <span className="text-xs text-gray-400 mt-1 block">Replacing virgin pesticide-ridden organic feeds</span>
              </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-start space-x-3 text-left">
              <Landmark className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <h5 className="text-white text-sm font-semibold">Future Circular Cotton Token System</h5>
                <p className="text-gray-400 text-xs mt-0.5">We are planning a blockchain-based certificate trading token system (RE-COT) to enable brands to buy verified carbon credits directly integrated with mechanical waste streams.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 text-left">
            <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 space-y-6">
              <div className="border-b border-[#1f2937] pb-3">
                <h4 className="font-display font-bold text-lg text-white">Request Executive Investor Deck</h4>
                <p className="text-gray-500 text-xs mt-0.5">Please provide accredited institutional registry details.</p>
              </div>

              {showDeckSuccess ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h5 className="text-white font-bold text-sm">Investor Request Received</h5>
                  <p className="text-gray-400 text-xs">
                    Our Board of Directors will review your validation profile. Confidential digital deck and Rotterdam feasibility logs will be delivered to your inbox within hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setShowDeckSuccess(true); }} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-gray-400 uppercase">Director / Representative Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Theresa Schmidt" 
                      value={investorDeckForm.name} 
                      onChange={(e) => setInvestorDeckForm({...investorDeckForm, name: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-gray-400 uppercase">Venture Fund / Investment Firm</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Circular Capital Partners" 
                      value={investorDeckForm.fund} 
                      onChange={(e) => setInvestorDeckForm({...investorDeckForm, fund: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-gray-400 uppercase">Institutional Verification Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="e.g. tschmidt@circularpartners.com" 
                      value={investorDeckForm.email} 
                      onChange={(e) => setInvestorDeckForm({...investorDeckForm, email: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-gray-400">ARE YOU AN ACCREDITED INSTITUTIONAL INVESTOR?</label>
                    <div className="flex space-x-3 pt-1">
                      <label className="flex items-center space-x-2 text-xs text-white">
                        <input 
                          type="radio" 
                          name="accredited" 
                          value="YES" 
                          checked={investorDeckForm.accredited === "YES"}
                          onChange={() => setInvestorDeckForm({...investorDeckForm, accredited: "YES"})}
                          className="accent-emerald-500"
                        />
                        <span>Yes, verified</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs text-white">
                        <input 
                          type="radio" 
                          name="accredited" 
                          value="NO" 
                          checked={investorDeckForm.accredited === "NO"}
                          onChange={() => setInvestorDeckForm({...investorDeckForm, accredited: "NO"})}
                          className="accent-emerald-500"
                        />
                        <span>Individual Sourcing Group</span>
                      </label>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition cursor-pointer"
                  >
                    Submit Investor Inquiry
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* SUPPLIER ONBOARDING */}
      <section id="onboard-supplier" className="py-20 px-4 md:px-8 border-b border-[#1f2937] bg-[#0a0a0a]">
        <div className="max-w-4xl mx-auto bg-[#111827]/80 border border-[#1f2937] rounded-xl p-6 md:p-8 relative">
          
          <div className="border-b border-[#1f2937] pb-4 mb-6">
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold">RECYCLING AS A SERVICE (RaaS)</span>
            <h3 className="font-display text-2xl font-extrabold text-white">Become an Approved Waste Supplier</h3>
            <p className="text-gray-400 text-xs md:text-sm mt-1">
              Secure contracts for post-industrial scrap extraction, hotel waste sweeps, or bulk mechanical shredding. Use our professional onboarding form below.
            </p>
          </div>

          <div className="flex items-center space-x-4 mb-6 border-b border-[#1f2937] pb-4 font-mono text-xs">
            <span className={`px-2.5 py-1 rounded ${supplierStep === 1 ? 'bg-emerald-500 text-black font-semibold' : 'bg-gray-800 text-gray-500'}`}>01. Company Profile</span>
            <span className="text-gray-700">➔</span>
            <span className={`px-2.5 py-1 rounded ${supplierStep === 2 ? 'bg-emerald-500 text-black font-semibold' : 'bg-gray-800 text-gray-500'}`}>02. Material Categorization</span>
            <span className="text-gray-700">➔</span>
            <span className={`px-2.5 py-1 rounded ${supplierStep === 3 ? 'bg-emerald-500 text-black font-semibold' : 'bg-gray-800 text-gray-500'}`}>03. Operations Logistics</span>
          </div>

          <form onSubmit={handleSupplierSubmit} className="space-y-6">
            
            {supplierStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-mono">Company Legal Entity Name</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Thorne Textile Sorting Ltd."
                      value={supplierForm.company}
                      onChange={(e) => setSupplierForm({...supplierForm, company: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-mono">Operations Contact Representative</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Marcus Thorne"
                      value={supplierForm.contact}
                      onChange={(e) => setSupplierForm({...supplierForm, contact: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-mono">Enterprise Operational Country</label>
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. United Kingdom"
                      value={supplierForm.country}
                      onChange={(e) => setSupplierForm({...supplierForm, country: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-mono">Corporate Sourcing Email</label>
                    <input 
                      required 
                      type="email" 
                      placeholder="e.g. mthorne@thornetextiles.com"
                      value={supplierForm.email}
                      onChange={(e) => setSupplierForm({...supplierForm, email: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={() => setSupplierStep(2)}
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                >
                  <span>Continue to Material Metrics</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {supplierStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-mono">Textile Categorization Type</label>
                    <select 
                      value={supplierForm.category}
                      onChange={(e) => setSupplierForm({...supplierForm, category: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    >
                      <option value="Post-Industrial Shear Scraps">Post-Industrial Shear Scraps</option>
                      <option value="Post-Consumer Linen Bulk">Post-Consumer Linen Bulk</option>
                      <option value="Discarded Yarn Remnants">Discarded Yarn Remnants</option>
                      <option value="Apparel Overstock Returns">Apparel Overstock Returns</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-mono">Estimated Monthly Weight (kg)</label>
                    <input 
                      required 
                      type="number" 
                      placeholder="e.g. 25000"
                      value={supplierForm.volume}
                      onChange={(e) => setSupplierForm({...supplierForm, volume: e.target.value})}
                      className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Confirmed Material Makeup Composition</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. 100% Pure Indigo Cotton Scraps (No synthetics mixed)"
                    value={supplierForm.material}
                    onChange={(e) => setSupplierForm({...supplierForm, material: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Active Source Certifications (if any)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. GRS Verified Source, Oeko-Tex Standard 100"
                    value={supplierForm.certifications}
                    onChange={(e) => setSupplierForm({...supplierForm, certifications: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setSupplierStep(1)}
                    className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 text-white text-xs transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setSupplierStep(3)}
                    className="px-5 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                  >
                    <span>Proceed to Logistics</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {supplierStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Specific Pickup or Container Requirements</label>
                  <textarea 
                    rows={3}
                    placeholder="e.g. Require high-density bulk containers rotated weekly by standard hydraulics. Can handle flatbed loading docks."
                    value={supplierForm.pickup}
                    onChange={(e) => setSupplierForm({...supplierForm, pickup: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>

                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1.5 text-xs text-gray-400">
                  <span className="font-semibold text-white block">Verified GRS Safe-Contract Agreement</span>
                  By submitting this request, you confirm that your raw feed inventories do not contain chemical flame retardants, high metal wire structures, or excessive mold damage. We comply fully with Cradle-to-Cradle guidelines.
                </div>

                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    onClick={() => setSupplierStep(2)}
                    className="px-4 py-2 rounded bg-[#111827] border border-[#1f2937] hover:bg-gray-750 text-white text-xs transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                  >
                    <span>Submit Strategic Intake Profile</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </form>
        </div>
      </section>

      {/* BUYER REGISTRATION */}
      <section id="onboard-buyer" className="py-20 px-4 md:px-8 bg-black/40 border-b border-[#1f2937]">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          
          <div className="md:col-span-5 flex flex-col justify-between space-y-6 text-left">
            <div>
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold block">Enterprise Purchasing Portal</span>
              <h3 className="font-display text-2xl font-extrabold text-white mt-1">Unlock Guaranteed Fiber Allocation</h3>
              <p className="text-gray-400 text-xs md:text-sm mt-3 leading-relaxed">
                Apparel houses, sustainable weavers, and hospitality groups can secure reliable contracts. Registered buyers gain instant access to our pricing engine, bid tracking system, and ESG GRS passport verification modules.
              </p>
            </div>

            <div className="border border-[#1f2937] rounded-xl p-4 bg-[#111827]/45 space-y-2">
              <span className="text-[10px] text-gray-500 font-mono block">PARTNERSHIP SLA LEVELS</span>
              <div className="flex items-center justify-between text-xs font-mono text-white text-left">
                <span>Enterprise Tier</span>
                <span className="text-emerald-400">100T+ Allocation</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-white text-left">
                <span>Standard Tier</span>
                <span className="text-emerald-400">10T+ Allocation</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-[#111827]/90 border border-[#1f2937] rounded-xl p-6 text-left">
            <h4 className="font-display text-lg font-bold text-white border-b border-[#1f2937] pb-3 mb-4">Register as Certified Buyer</h4>
            
            <form onSubmit={handleBuyerSubmit} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Company / Organization Legal Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Loom & Thread Apparel" 
                    value={buyerForm.company}
                    onChange={(e) => setBuyerForm({...buyerForm, company: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Procurement Director Contact</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Amara Okoye" 
                    value={buyerForm.contact}
                    onChange={(e) => setBuyerForm({...buyerForm, contact: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Institutional Email</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="e.g. procurement@loomandthread.com" 
                    value={buyerForm.email}
                    onChange={(e) => setBuyerForm({...buyerForm, email: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Apparel Segment Type</label>
                  <select 
                    value={buyerForm.category}
                    onChange={(e) => setBuyerForm({...buyerForm, category: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                  >
                    <option value="Premium Fashion Brand">Premium Fashion Brand</option>
                    <option value="Hotel Textile Sourcing">Hotel Textile Sourcing</option>
                    <option value="Industrial Canvas Manufacturer">Industrial Canvas Manufacturer</option>
                    <option value="Yarn Wholesaler Distributor">Yarn Wholesaler Distributor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-[#0a0a0a] sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Est. Annual Recycled Quota (kg)</label>
                  <input 
                    required 
                    type="number" 
                    placeholder="e.g. 25000" 
                    value={buyerForm.volumeGoal}
                    onChange={(e) => setSupplierForm({...buyerForm, volumeGoal: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Certification Standard Required</label>
                  <select 
                    value={buyerForm.certificationNeeded}
                    onChange={(e) => setSupplierForm({...buyerForm, certificationNeeded: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white"
                  >
                    <option value="GRS Standard Certified">Global Recycled Standard (GRS)</option>
                    <option value="Oeko-Tex Standard 100">Oeko-Tex Standard 100</option>
                    <option value="Cradle-to-Cradle Gold">Cradle-to-Cradle Gold</option>
                    <option value="Any verified Circular origin">Any verified Circular origin</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <span>Request Allocation Account</span>
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* EXECUTIVE CONTACT / CALENDAR */}
      <section id="contact" className="py-20 px-4 md:px-8 bg-[#0a0a0a] border-b border-[#1f2937] relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8 text-left">
            <div className="space-y-4">
              <span className="text-emerald-400 font-mono text-xs uppercase tracking-widest font-bold block">EXECUTIVE DESK</span>
              <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
                Establish Direct Contact
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                We maintain active regional offices at Rotterdam, Lyon, and Lodz. Fill out the corporate message form, schedule a live telemetry brief, or ping our WhatsApp operations desk immediately.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#111827] border border-[#1f2937] rounded-xl space-y-2">
                <span className="text-[10px] text-gray-500 font-mono block">REGIONAL COORDINATION OFFICE</span>
                <p className="text-xs text-white">Prinses Beatrixlaan 18c, Netherlands</p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-mono font-bold">
                <a 
                  href="https://wa.me/310850132468" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 rounded-lg hover:bg-[#25D366]/20 transition flex items-center"
                >
                  <Phone className="w-4 h-4 mr-1.5" /> WhatsApp Business Desk
                </a>
                <a 
                  href="https://www.linkedin.com/in/raymondschilperoort/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-4 py-2 bg-[#0077B5]/10 text-[#0077B5] border border-[#0077B5]/20 rounded-lg hover:bg-[#0077B5]/25 transition flex items-center"
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" /> LinkedIn Executive Channel
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#111827]/85 border border-[#1f2937] rounded-xl p-6 md:p-8 text-left">
            <h4 className="font-display text-lg font-bold text-white border-b border-[#1f2937] pb-3 mb-4">Direct Communication Matrix</h4>
            
            {showContactSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h5 className="text-white text-base font-bold">Message Transmitted Successfully</h5>
                <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
                  Thank you. Your strategic sourcing or plant construction inquiry has been logged in our Rotterdam ticketing grid. A verified relations officer has been allocated.
                </p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setShowContactSuccess(true); }} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Sender Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Amara Okoye" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Company / Fund Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="e.g. Loom & Thread Apparel" 
                    value={contactForm.company}
                    onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Corporate Email Inbox</label>
                  <input 
                    required 
                    type="email" 
                    placeholder="e.g. contact@company.com" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-mono">Primary Sourcing Goal</label>
                  <select 
                    value={contactForm.interest}
                    onChange={(e) => setContactForm({...contactForm, interest: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Procurement Sourcing">B2B Sourcing Allocation</option>
                    <option value="Supplier Partnership">Supplier Sourcing Partnership</option>
                    <option value="Plant Investment">Mechanized Plant Investment Tier</option>
                    <option value="Media Press">Press & ESG Audit Collaboration</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs text-gray-400 font-mono">Technical Requirements / Message Outline</label>
                  <textarea 
                    rows={4}
                    placeholder="What specific mechanical cotton targets or GRS auditing guidelines do you wish to align on?" 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-[#374151] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full sm:col-span-2 px-5 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs tracking-tight transition cursor-pointer"
                >
                  Transmit Secure Corporate Communication
                </button>
              </form>
            )}

          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-black/90 py-12 px-4 md:px-8 border-t border-gray-900 text-sm text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <span className="font-display font-bold text-white tracking-tight">CottonRecycle™</span>
            <span>© 2026. All operations allocated under strict GRS and Oeko-Tex Standard 100 codes.</span>
          </div>

          <div className="flex space-x-4">
            <a href="#about" className="hover:text-white transition">Technology</a>
            <a href="#marketplace" className="hover:text-white transition">Marketplace</a>
            <a href="#onboard-supplier" className="hover:text-white transition">Supplier Desk</a>
            <button className="text-emerald-400 hover:underline inline-flex items-center space-x-1" onClick={onLoginClick}>
              <span>Portal Operations Access</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}

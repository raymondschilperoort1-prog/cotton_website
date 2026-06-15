import React, { useState } from "react";
import { 
  Truck, Scissors, ChevronRight, Activity, Cpu, ShieldCheck, HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Step {
  id: number;
  title: string;
  shortDesc: string;
  icon: React.ComponentType<any>;
  details: string;
  metricLabel: string;
  metricValue: string;
  co2SavedPct: number;
  waterSavedPct: number;
}

export default function AboutVisualizer() {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps: Step[] = [
    {
      id: 1,
      title: "1. Automated Intake & NIR Sorter",
      shortDesc: "Near-Infrared spectroscopy identifies 100% pure cotton sources.",
      icon: Truck,
      details: "Bales of post-industrial denim scraps or post-consumer white linens are run through high-speed conveyor belts. Automated NIR optical sorters isolate pure cellulosic cotton instantly, rejecting elastane and poly blends.",
      metricLabel: "NIR Accuracy",
      metricValue: "99.8% Sorting Precision",
      co2SavedPct: 15,
      waterSavedPct: 10,
    },
    {
      id: 2,
      title: "2. Magnetic Sieve & Trim Stripping",
      shortDesc: "Zippers, buttons, and iron remnants are isolated systematically.",
      icon: Scissors,
      details: "Materials go through our physical delacing rollers and multi-stage magnetic sieves. It extracts all hardware such as steel zippers, brass rivets, buttons, and synthetic thread seams without breaking raw cotton fibers.",
      metricLabel: "Hardware Recovery",
      metricValue: "100% Metal Extraction",
      co2SavedPct: 22,
      waterSavedPct: 18,
    },
    {
      id: 3,
      title: "3. Direct-Drive Rotary Shredders",
      shortDesc: "High-torque shredders liberate yarn structure to raw fluff.",
      icon: Cpu,
      details: "Unlike traditional high-tension teeth that tear textile fibers apart and shorten staples, our low-velocity direct-drive carbon shredders slowly untether cotton threads into loose flocking structures.",
      metricLabel: "Fibre Tensile Hold",
      metricValue: "88% Length Retention",
      co2SavedPct: 45,
      waterSavedPct: 35,
    },
    {
      id: 4,
      title: "4. Air-flow Fibre Sifters",
      shortDesc: "Multi-stage cyclone sift segregates high-grade long staple yarn.",
      icon: Activity,
      details: "Fibers are blown through a series of vacuum-sealed air cyclone sifters. Heavy short-fiber dust sinks, while premium long-staple mechanical fibers float to recovery buffers, ready for high-grade spinning.",
      metricLabel: "Premium Grade Sifted",
      metricValue: "78% Long-Staple Yield",
      co2SavedPct: 62,
      waterSavedPct: 58,
    },
    {
      id: 5,
      title: "5. Electrostatic Purification",
      shortDesc: "Extracts micro-contaminants, lint, and color impurities.",
      icon: HelpCircle,
      details: "Fibers travel through active electrostatic charging plates. They isolate microscale dye particles, synthetic contaminants, and fine dust to ensure the resultant white raw cotton matches the purity of virgin organic cotton.",
      metricLabel: "Purity Index",
      metricValue: "99.4% Pure Cellulose",
      co2SavedPct: 80,
      waterSavedPct: 75,
    },
    {
      id: 6,
      title: "6. High-Density GRS Certified Baling",
      shortDesc: "Hydraulic presses pack 250kg bales stamped with digital tracking ids.",
      icon: ShieldCheck,
      details: "Processed premium mechanical recycling cotton is pressed into hydraulic bales. Each bale receives a unique RFID tracking passport connected to the Global Recycled Standard ledger, enabling 100% raw-source transparency.",
      metricLabel: "Export Packaging",
      metricValue: "250kg Standard GRS Bale",
      co2SavedPct: 85,
      waterSavedPct: 99,
    },
  ];

  const currentStepData = steps.find(s => s.id === activeStep) || steps[0];

  return (
    <div className="bg-[#0e1315] border border-gray-800 rounded-2xl p-6 md:p-8 relative overflow-hidden emerald-glow">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Step Grid Buttons */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          <div className="space-y-1 mb-4">
            <span className="text-emerald-400 font-mono text-xs uppercase tracking-wider block">Closed-Loop Technology</span>
            <h3 className="font-display text-2xl font-bold text-white">Mechanical Extraction Flow</h3>
            <p className="text-gray-400 text-sm">Strictly zero chemical solvents. Direct fiber liberation driven by clean energy grids.</p>
          </div>
          
          <div className="space-y-2.5">
            {steps.map((s) => {
              const IconComp = s.icon;
              const isActive = s.id === activeStep;
              return (
                <button
                  key={s.id}
                  id={`process-step-btn-${s.id}`}
                  onClick={() => setActiveStep(s.id)}
                  className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
                    isActive 
                      ? "bg-gray-800/80 border-emerald-500 text-white emerald-glow" 
                      : "bg-[#111719]/45 border-gray-800/80 text-gray-400 hover:border-gray-700 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg transition-transform duration-300 ${
                      isActive ? "bg-emerald-500/10 text-emerald-400 scale-105" : "bg-gray-800/55 text-gray-500"
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-xs md:text-sm">{s.title}</h4>
                      <p className="text-gray-500 text-xs line-clamp-1 mt-0.5">{s.shortDesc}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "text-emerald-400 translate-x-1" : "text-gray-600"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Step Detailed Info Graphic */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#111719]/80 border border-gray-800/80 rounded-xl p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6 flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="flex items-center space-x-2">
                    <span className="mono-tag text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded">
                      STAGE 0{currentStepData.id}
                    </span>
                    <span className="mono-tag text-xs text-gray-500">
                      SECURE_PASSPORT_ENABLED
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 flex items-center space-x-1 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                    CALIBRATED
                  </span>
                </div>

                <h4 className="font-display text-xl md:text-2xl font-bold text-white">
                  {currentStepData.title}
                </h4>
                
                <p className="text-gray-300 text-sm leading-relaxed">
                  {currentStepData.details}
                </p>
                
                <div className="bg-[#0b0f11] border border-gray-800/60 rounded-lg p-4">
                  <span className="text-[11px] uppercase text-gray-500 tracking-wider font-mono">Factory Telemetry Benchmark</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-white text-sm font-semibold">{currentStepData.metricLabel}</span>
                    <span className="text-emerald-400 font-mono text-sm font-semibold">{currentStepData.metricValue}</span>
                  </div>
                </div>
              </div>

              {/* ESG KPI gauges */}
              <div className="mt-6 pt-6 border-t border-gray-800/80 space-y-4">
                <h5 className="font-mono text-xs uppercase text-gray-400">Cumulative Savings Matrix (%)</h5>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Water Savings Percentage */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">Water Offset</span>
                      <span className="text-emerald-400 font-bold">{currentStepData.waterSavedPct}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${currentStepData.waterSavedPct}%` }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* CO2 Savings Percentage */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-gray-500">CO₂ Reduction</span>
                      <span className="text-emerald-400 font-bold">{currentStepData.co2SavedPct}%</span>
                    </div>
                    <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${currentStepData.co2SavedPct}%` }}
                        transition={{ duration: 0.6 }}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}

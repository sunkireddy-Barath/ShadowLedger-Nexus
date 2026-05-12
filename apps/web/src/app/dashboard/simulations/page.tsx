"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Play, 
  BarChart3, 
  AlertTriangle, 
  TrendingDown, 
  Wind,
  Layers,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SimulationsPage() {
  const [activeSim, setActiveSim] = useState<string | null>(null);

  const simulations = [
    { id: 'runway', name: 'Treasury Exhaustion', icon: TrendingDown, risk: 'Low', desc: 'Predicts operational runway based on current burn rate and volatility.' },
    { id: 'depeg', name: 'Stablecoin Depeg Risk', icon: AlertTriangle, risk: 'High', desc: 'Simulates impact of major stablecoin depegging on treasury liquidity.' },
    { id: 'payroll', name: 'Payroll Sustainability', icon: Layers, risk: 'Low', desc: 'Evaluates multi-year payroll capacity under various growth scenarios.' },
    { id: 'stress', name: 'Vendor Payment Stress', icon: Wind, risk: 'Mid', desc: 'Tests treasury resilience against sudden large vendor settlement requests.' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow">Financial Simulations</h1>
          <p className="text-muted-foreground mt-1">Predict and stress-test treasury resilience with AI-driven models.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {simulations.map((sim) => (
            <motion.div
              key={sim.id}
              whileHover={{ y: -5 }}
              className={cn(
                "glass p-6 rounded-3xl border-white/10 transition-all cursor-pointer group",
                activeSim === sim.id && "border-cyan-glow/50 bg-cyan-glow/5"
              )}
              onClick={() => setActiveSim(sim.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-cyan-glow/10 transition-colors">
                  <sim.icon size={24} className={cn("text-white transition-colors", activeSim === sim.id && "text-cyan-glow")} />
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                  sim.risk === 'High' ? 'bg-red-500/10 text-red-500' : 
                  sim.risk === 'Mid' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-glow/10 text-emerald-glow'
                )}>
                  {sim.risk} Risk Simulation
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{sim.name}</h3>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{sim.desc}</p>
              
              <button className="flex items-center gap-2 text-xs font-bold text-cyan-glow hover:underline uppercase tracking-widest">
                Configure Model <ChevronRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>

        {activeSim && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-3xl p-8 border-white/5"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Simulation: {simulations.find(s => s.id === activeSim)?.name}</h2>
                <p className="text-xs text-muted-foreground mt-1 font-mono uppercase">ID: SIM_MODEL_{activeSim.toUpperCase()}_v4.2</p>
              </div>
              <button className="px-8 py-3 bg-cyan-glow text-black font-bold rounded-xl neo-glow-cyan flex items-center gap-2 hover:scale-105 transition-all">
                <Play size={18} fill="black" />
                Run AI Simulation
              </button>
            </div>

            <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.02),transparent_70%)]" />
              <div className="flex flex-col items-center text-center px-12 relative z-10">
                <BarChart3 size={48} className="text-white/20 mb-4" />
                <p className="text-sm text-muted-foreground">Select parameters and click "Run" to generate predictive data visualzation.</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

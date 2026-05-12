import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,242,255,0.05),transparent_70%)]" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-glow/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-glow/5 rounded-full blur-[150px]" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-glow neo-glow-cyan flex items-center justify-center mb-8 animate-bounce">
          <ShieldCheck className="text-black" size={32} />
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
          SHADOWLEDGER <span className="text-cyan-glow text-glow">NEXUS</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl leading-relaxed">
          The Autonomous Invisible Financial Operating System for Web3 Organizations.
          Run your entire organization invisibly on-chain.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6">
          <Link 
            href="/dashboard"
            className="group px-8 py-4 bg-cyan-glow text-black font-bold rounded-2xl neo-glow-cyan hover:scale-105 transition-all flex items-center gap-2"
          >
            Launch Command Center
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <button className="px-8 py-4 glass text-white font-bold rounded-2xl hover:bg-white/10 transition-all border-white/10">
            Explore Architecture
          </button>
        </div>
        
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-12">
          <Stat label="Shielded Assets" value="$2.4B+" />
          <Stat label="Active DAOs" value="150+" />
          <Stat label="Privacy Score" value="99.9%" />
          <Stat label="AI Decisions/Day" value="25k+" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <p className="text-3xl font-bold font-mono text-white mb-1">{value}</p>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
    </div>
  );
}
